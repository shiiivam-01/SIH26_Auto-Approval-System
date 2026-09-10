const { ApplicantProfile, User } = require('../models');

function alignSectorAndType(business_type, sector) {
  let finalType = business_type;
  let finalSector = sector;

  if (finalType) {
    const t = String(finalType).toLowerCase().trim();
    if (t === 'pharmacy' || t === 'chemist' || t === 'medical_store') {
      finalSector = 'pharma';
      finalType = 'pharmacy';
    } else if (t === 'clinic' || t === 'hospital') {
      finalSector = 'pharma';
      finalType = 'clinic';
    } else if (['cafe', 'restaurant', 'hotel', 'bakery', 'dhaba', 'food_processing'].includes(t)) {
      finalSector = 'food_processing';
      if (t === 'food_processing') finalType = 'food_processing';
    } else if (t === 'gym_fitness' || t === 'gym' || t === 'fitness') {
      finalSector = 'it_ites';
      finalType = 'gym_fitness';
    } else if (t === 'factory' || t === 'manufacturing') {
      finalSector = 'manufacturing';
      finalType = 'factory';
    } else if (t === 'textile') {
      finalSector = 'textile';
      finalType = 'textile';
    } else if (t === 'agriculture' || t === 'warehouse') {
      finalSector = 'agriculture';
    }
  } else if (finalSector) {
    const s = String(finalSector).toLowerCase().trim();
    if (s === 'pharma') finalType = 'pharmacy';
    else if (s === 'food_processing') finalType = 'food_processing';
    else if (s === 'manufacturing') finalType = 'factory';
    else if (s === 'textile') finalType = 'textile';
    else if (s === 'agriculture') finalType = 'agriculture';
    else if (s === 'it_ites') finalType = 'gym_fitness';
  }

  return {
    business_type: finalType || 'food_processing',
    sector: finalSector || 'food_processing',
  };
}

async function createProfile(req, res) {
  try {
    const {
      applicant_name,
      date_of_birth,
      phone_number,
      aadhaar_number,
      pan_number,
      business_name,
      business_type,
      sector,
      nic_code,
      state,
      district,
      investment_amount,
      employee_count,
      stage,
    } = req.body;

    if (!business_name || (!sector && !business_type) || !state || investment_amount == null || employee_count == null) {
      return res.status(400).json({
        error: 'business_name, sector, state, investment_amount and employee_count are required',
      });
    }

    const { business_type: alignedType, sector: alignedSector } = alignSectorAndType(business_type, sector);

    const profile = await ApplicantProfile.create({
      user_id: req.user.id,
      applicant_name: applicant_name || undefined,
      date_of_birth: date_of_birth || undefined,
      phone_number: phone_number || undefined,
      aadhaar_number: aadhaar_number || undefined,
      pan_number: pan_number || undefined,
      business_name,
      business_type: alignedType,
      sector: alignedSector,
      nic_code,
      state,
      district,
      investment_amount,
      employee_count,
      stage: stage || 'pre_establishment',
    });

    if (applicant_name && applicant_name.trim()) {
      await User.update({ name: applicant_name.trim() }, { where: { id: req.user.id } });
    }

    const user = await User.findByPk(req.user.id, { attributes: ['id', 'name', 'email', 'role'] });
    const profileJson = profile.toJSON();
    profileJson.applicant_name = profileJson.applicant_name || user?.name;
    profileJson.email = user?.email;

    res.status(201).json(profileJson);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

async function getMyProfile(req, res) {
  try {
    const user = await User.findByPk(req.user.id, {
      attributes: ['id', 'name', 'email', 'role', 'department'],
    });

    let profile = await ApplicantProfile.findOne({ where: { user_id: req.user.id } });
    if (!profile && user?.role === 'applicant' && user?.email?.toLowerCase() === 'test@gmail.com') {
      profile = await ApplicantProfile.create({
        user_id: user.id,
        applicant_name: 'Aarav Sharma',
        date_of_birth: '1995-08-15',
        phone_number: '9876543210',
        business_name: 'Sharma Medical & Pharmacy',
        business_type: 'pharmacy',
        sector: 'pharma',
        nic_code: '47721',
        state: 'Madhya Pradesh',
        district: 'Bhopal',
        investment_amount: 25,
        employee_count: 8,
        stage: 'pre_establishment',
      });
    }

    if (!profile) {
      return res.status(404).json({
        error: 'Profile not found',
        user: {
          id: user?.id,
          name: user?.name,
          email: user?.email,
        },
      });
    }

    const profileData = profile.toJSON();
    if (!profileData.business_type) {
      const { business_type } = alignSectorAndType(null, profileData.sector);
      profileData.business_type = business_type;
    }
    profileData.applicant_name = profileData.applicant_name || user?.name;
    profileData.email = user?.email;

    res.json(profileData);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

async function updateProfile(req, res) {
  try {
    const user = await User.findByPk(req.user.id);
    if (!user) return res.status(404).json({ error: 'User not found' });

    let profile = await ApplicantProfile.findOne({ where: { user_id: req.user.id } });

    const {
      applicant_name,
      date_of_birth,
      phone_number,
      aadhaar_number,
      pan_number,
      business_name,
      business_type,
      sector,
      nic_code,
      state,
      district,
      investment_amount,
      employee_count,
      stage,
    } = req.body;

    // Synchronize User table name so UI header immediately reflects updated applicant name
    if (applicant_name && applicant_name.trim()) {
      user.name = applicant_name.trim();
      await user.save();
    }

    // Align business_type and sector together
    let targetType = business_type !== undefined ? business_type : profile?.business_type;
    let targetSector = sector !== undefined ? sector : profile?.sector;
    if (business_type !== undefined || sector !== undefined) {
      const aligned = alignSectorAndType(targetType, targetSector);
      targetType = aligned.business_type;
      targetSector = aligned.sector;
    }

    if (!profile) {
      profile = await ApplicantProfile.create({
        user_id: req.user.id,
        applicant_name: applicant_name || user.name,
        date_of_birth: date_of_birth || null,
        phone_number: phone_number || null,
        aadhaar_number: aadhaar_number || null,
        pan_number: pan_number || null,
        business_name: business_name || 'My Business',
        business_type: targetType || 'food_processing',
        sector: targetSector || 'food_processing',
        nic_code: nic_code || null,
        state: state || 'Madhya Pradesh',
        district: district || null,
        investment_amount: investment_amount != null ? Number(investment_amount) : 10,
        employee_count: employee_count != null ? Number(employee_count) : 5,
        stage: stage || 'pre_establishment',
      });
    } else {
      if (applicant_name !== undefined) profile.applicant_name = applicant_name;
      if (date_of_birth !== undefined) profile.date_of_birth = date_of_birth;
      if (phone_number !== undefined) profile.phone_number = phone_number;
      if (aadhaar_number !== undefined) profile.aadhaar_number = aadhaar_number;
      if (pan_number !== undefined) profile.pan_number = pan_number;
      if (business_name !== undefined) profile.business_name = business_name;
      if (targetType !== undefined) profile.business_type = targetType;
      if (targetSector !== undefined) profile.sector = targetSector;
      if (nic_code !== undefined) profile.nic_code = nic_code;
      if (state !== undefined) profile.state = state;
      if (district !== undefined) profile.district = district;
      if (investment_amount !== undefined) profile.investment_amount = Number(investment_amount);
      if (employee_count !== undefined) profile.employee_count = Number(employee_count);
      if (stage !== undefined) profile.stage = stage;
      await profile.save();
    }

    const result = profile.toJSON();
    result.applicant_name = profile.applicant_name || user.name;
    result.email = user.email;

    res.json({
      message: 'Profile updated successfully',
      profile: result,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        department: user.department,
      },
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

module.exports = { createProfile, getMyProfile, updateProfile };

