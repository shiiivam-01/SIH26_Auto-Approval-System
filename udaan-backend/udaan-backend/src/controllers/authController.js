const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
require('dotenv').config();
const { User } = require('../models');

// Hardcoded privileged accounts — ONLY these emails can access officer/inspector/admin roles
const PRIVILEGED_ACCOUNTS = {
  'officer@gmail.com': 'officer',
  'inspector@gmail.com': 'inspector',
  'admin@gmail.com': 'admin',
};

// Rate limiting & Brute Force protection for login
// In-memory tracker: { email: { count: number, firstAttempt: timestamp, lockedUntil: timestamp } }
const loginAttempts = new Map();
const MAX_ATTEMPTS = 5;
const LOCKOUT_MS = 15 * 60 * 1000; // 15 minutes

function checkRateLimit(email) {
  const record = loginAttempts.get(email);
  if (!record) return null;

  const now = Date.now();
  if (record.lockedUntil && record.lockedUntil > now) {
    const minutesLeft = Math.ceil((record.lockedUntil - now) / 60000);
    return `Account temporarily locked due to multiple failed login attempts. Please retry after ${minutesLeft} minute(s).`;
  }
  return null;
}

function recordFailedAttempt(email) {
  const now = Date.now();
  const record = loginAttempts.get(email) || { count: 0, firstAttempt: now, lockedUntil: null };

  if (now - record.firstAttempt > LOCKOUT_MS) {
    record.count = 1;
    record.firstAttempt = now;
    record.lockedUntil = null;
  } else {
    record.count += 1;
  }

  if (record.count >= MAX_ATTEMPTS) {
    record.lockedUntil = now + LOCKOUT_MS;
  }

  loginAttempts.set(email, record);
}

function resetFailedAttempts(email) {
  loginAttempts.delete(email);
}

/**
 * Validates password complexity against government cybersecurity standards:
 * Minimum 8 characters, with uppercase, lowercase, digit, and special symbol.
 */
function validatePasswordStrength(password) {
  if (!password || typeof password !== 'string') return 'Password is required';
  if (password.length < 8) return 'Password must be at least 8 characters long';
  if (!/[A-Z]/.test(password)) return 'Password must contain at least one uppercase letter (A-Z)';
  if (!/[a-z]/.test(password)) return 'Password must contain at least one lowercase letter (a-z)';
  if (!/[0-9]/.test(password)) return 'Password must contain at least one numeric digit (0-9)';
  if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) return 'Password must contain at least one special character (!@#$%^&*...)';

  const lower = password.toLowerCase();
  if (['password', 'password123', 'admin123', '12345678', 'qwerty123'].includes(lower)) {
    return 'Password is too common and insecure. Choose a stronger password.';
  }
  return null;
}

async function register(req, res) {
  try {
    const { name, email, password } = req.body;
    if (!name || !email || !password) {
      return res.status(400).json({ error: 'name, email and password are required' });
    }

    const passwordError = validatePasswordStrength(password);
    if (passwordError) {
      return res.status(400).json({ error: passwordError });
    }

    const existing = await User.findOne({ where: { email: email.toLowerCase().trim() } });
    if (existing) return res.status(409).json({ error: 'Email already registered' });

    // Upgraded salt rounds (12) for enhanced protection against brute-force / GPU cracking
    const password_hash = await bcrypt.hash(password, 12);

    // Security requirement: Public registration must always create an applicant with department: null.
    const user = await User.create({
      name: name.trim(),
      email: email.toLowerCase().trim(),
      password_hash,
      role: 'applicant',
      department: null,
    });

    const token = jwt.sign(
      { id: user.id, role: user.role, department: user.department || null },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.status(201).json({
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        department: user.department || null,
      },
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

async function login(req, res) {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: 'email and password are required' });
    }

    const normalizedEmail = email.toLowerCase().trim();

    // Check brute force protection
    const lockoutError = checkRateLimit(normalizedEmail);
    if (lockoutError) {
      return res.status(429).json({ error: lockoutError });
    }

    const user = await User.findOne({ where: { email: normalizedEmail } });
    if (!user) {
      recordFailedAttempt(normalizedEmail);
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const valid = await bcrypt.compare(password, user.password_hash);
    if (!valid) {
      recordFailedAttempt(normalizedEmail);
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // ROLE ENFORCEMENT: Only privileged emails can hold privileged roles
    const privilegedRole = PRIVILEGED_ACCOUNTS[normalizedEmail];
    if (privilegedRole && user.role !== privilegedRole) {
      // Fix role if it was tampered
      user.role = privilegedRole;
      await user.save();
    }
    // Non-privileged users are always applicants
    if (!privilegedRole && user.role !== 'applicant') {
      user.role = 'applicant';
      await user.save();
    }

    // Reset failed counter on successful authentication
    resetFailedAttempts(normalizedEmail);

    const token = jwt.sign(
      { id: user.id, role: user.role, department: user.department || null },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        department: user.department || null,
      },
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

async function googleOAuthLogin(req, res) {
  try {
    const { credential, email: directEmail, password: directPassword, name: directName, date_of_birth, phone_number, targetRole } = req.body;

    let payload = null;

    // Direct Google credentials login (email + password from Google login modal)
    if (directEmail && directPassword) {
      const normalizedEmail = directEmail.toLowerCase().trim();
      const passwordError = validatePasswordStrength(directPassword);
      if (passwordError) {
        return res.status(400).json({ error: passwordError });
      }

      payload = {
        email: normalizedEmail,
        name: directName && directName.trim() ? directName.trim() : normalizedEmail.split('@')[0],
        sub: 'google-pwd-' + Date.now(),
      };
    } else if (credential) {
      // Handle mock token for testing
      if (credential.startsWith('mock-google-token-')) {
        const email = credential.replace('mock-google-token-', '').toLowerCase().trim();
        payload = {
          email: email.includes('@') ? email : `${email}@gmail.com`,
          name: directName && directName.trim() ? directName.trim() : email.split('@')[0],
          sub: 'mock-' + Date.now(),
        };
      } else {
        // Validate token via Google's official tokeninfo API endpoint
        const response = await fetch(`https://oauth2.googleapis.com/tokeninfo?id_token=${encodeURIComponent(credential)}`);
        if (!response.ok) {
          return res.status(401).json({ error: 'Invalid Google OAuth token' });
        }
        payload = await response.json();

        // If GOOGLE_CLIENT_ID is configured, verify audience match
        if (process.env.GOOGLE_CLIENT_ID && payload.aud !== process.env.GOOGLE_CLIENT_ID) {
          return res.status(401).json({ error: 'Google OAuth token client_id mismatch' });
        }
      }
    } else {
      return res.status(400).json({ error: 'Google OAuth credential or credentials are required' });
    }

    const { email, name } = payload;
    if (!email) {
      return res.status(400).json({ error: 'Google OAuth token does not contain a verified email' });
    }

    const normalizedEmail = email.toLowerCase().trim();
    let user = await User.findOne({ where: { email: normalizedEmail } });
    const validRoles = ['applicant', 'officer', 'inspector', 'admin'];

    const chosenName = (directName && directName.trim()) ? directName.trim() : (name || normalizedEmail.split('@')[0]);

    if (!user) {
      // NO AUTO-REGISTRATION: User must register first via the Register page
      return res.status(401).json({ error: 'Account not found. Please register first before signing in.' });
    }

    // VERIFY PASSWORD: Existing user must provide correct password
    if (directPassword) {
      const valid = await bcrypt.compare(directPassword, user.password_hash);
      if (!valid) {
        return res.status(401).json({ error: 'Invalid password. Please try again.' });
      }
    }
    // If no directPassword (real Google OAuth token flow), skip password check

    if (directName && directName.trim()) {
      user.name = directName.trim();
    }
    // ROLE ENFORCEMENT: Only privileged emails can hold privileged roles
    const privilegedRole = PRIVILEGED_ACCOUNTS[normalizedEmail];
    if (privilegedRole) {
      user.role = privilegedRole;
      if (privilegedRole === 'officer' || privilegedRole === 'inspector') {
        user.department = user.department || 'Fire Department';
      }
    } else {
      user.role = 'applicant';
    }
    await user.save();

    // Also update ApplicantProfile if exists
    const { ApplicantProfile } = require('../models');
    const profile = await ApplicantProfile.findOne({ where: { user_id: user.id } });
    if (profile) {
      if (directName && directName.trim()) profile.applicant_name = directName.trim();
      if (date_of_birth) profile.date_of_birth = date_of_birth;
      if (phone_number) profile.phone_number = phone_number;
      await profile.save();
    }


    const token = jwt.sign(
      { id: user.id, role: user.role, department: user.department || null },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        department: user.department || null,
      },
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

module.exports = { register, login, googleOAuthLogin };


