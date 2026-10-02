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

function calculateEnterpriseType(investmentLakhs, turnoverLakhs) {
  const inv = parseFloat(investmentLakhs) || 0;
  const turn = parseFloat(turnoverLakhs) || 0;
  
  // MSME Classification Guidelines (Values in Lakhs):
  // Micro: Investment <= 100 Lakhs (1Cr) AND Turnover <= 500 Lakhs (5Cr)
  if (inv <= 100 && turn <= 500) return 'Micro';
  // Small: Investment <= 1000 Lakhs (10Cr) AND Turnover <= 5000 Lakhs (50Cr)
  if (inv <= 1000 && turn <= 5000) return 'Small';
  // Medium: Investment <= 5000 Lakhs (50Cr) AND Turnover <= 25000 Lakhs (250Cr)
  if (inv <= 5000 && turn <= 25000) return 'Medium';
  
  return 'Large';
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
      // NEW: Business Details
      date_of_establishment, registration_number, udyam_registration_number,
      // NEW: Business Activity
      sub_sector, business_activity, products_services, is_export_business,
      // NEW: Financial Details
      enterprise_type, annual_turnover, existing_loan, required_investment_amount,
      // NEW: Business Location
      city_town_village, pin_code, area_type, is_sez,
      // NEW: Owner Details
      owner_age, owner_gender, owner_nationality, employment_status, family_income, social_category, minority_status, disability_status
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
      
      // Save all the extra new fields
      date_of_establishment: date_of_establishment || undefined,
      registration_number: registration_number || undefined,
      udyam_registration_number: udyam_registration_number || undefined,
      sub_sector: sub_sector || undefined,
      business_activity: business_activity || undefined,
      products_services: products_services || undefined,
      is_export_business: is_export_business || undefined,
      enterprise_type: enterprise_type || calculateEnterpriseType(investment_amount, annual_turnover),
      annual_turnover: annual_turnover !== undefined ? Number(annual_turnover) : undefined,
      existing_loan: existing_loan || undefined,
      required_investment_amount: required_investment_amount !== undefined ? Number(required_investment_amount) : undefined,
      city_town_village: city_town_village || undefined,
      pin_code: pin_code || undefined,
      area_type: area_type || undefined,
      is_sez: is_sez || undefined,
      owner_age: owner_age !== undefined ? Number(owner_age) : undefined,
      owner_gender: owner_gender || undefined,
      owner_nationality: owner_nationality || undefined,
      employment_status: employment_status || undefined,
      family_income: family_income !== undefined ? Number(family_income) : undefined,
      social_category: social_category || undefined,
      minority_status: minority_status || undefined,
      disability_status: disability_status || undefined,
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
      // NEW: Business Details
      date_of_establishment, registration_number, udyam_registration_number,
      // NEW: Business Activity
      sub_sector, business_activity, products_services, is_export_business,
      // NEW: Financial Details
      enterprise_type, annual_turnover, existing_loan, required_investment_amount,
      // NEW: Business Location
      city_town_village, pin_code, area_type, is_sez,
      // NEW: Owner Details
      owner_age, owner_gender, owner_nationality, employment_status, family_income, social_category, minority_status, disability_status
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

    const updates = {
      applicant_name: applicant_name !== undefined ? applicant_name : undefined,
      date_of_birth: date_of_birth !== undefined ? date_of_birth : undefined,
      phone_number: phone_number !== undefined ? phone_number : undefined,
      aadhaar_number: aadhaar_number !== undefined ? aadhaar_number : undefined,
      pan_number: pan_number !== undefined ? pan_number : undefined,
      business_name: business_name !== undefined ? business_name : undefined,
      business_type: targetType !== undefined ? targetType : undefined,
      sector: targetSector !== undefined ? targetSector : undefined,
      nic_code: nic_code !== undefined ? nic_code : undefined,
      state: state !== undefined ? state : undefined,
      district: district !== undefined ? district : undefined,
      investment_amount: investment_amount !== undefined ? Number(investment_amount) : undefined,
      employee_count: employee_count !== undefined ? Number(employee_count) : undefined,
      stage: stage !== undefined ? stage : undefined,
      // NEW FIELDS
      date_of_establishment: date_of_establishment !== undefined ? date_of_establishment : undefined,
      registration_number: registration_number !== undefined ? registration_number : undefined,
      udyam_registration_number: udyam_registration_number !== undefined ? udyam_registration_number : undefined,
      sub_sector: sub_sector !== undefined ? sub_sector : undefined,
      business_activity: business_activity !== undefined ? business_activity : undefined,
      products_services: products_services !== undefined ? products_services : undefined,
      is_export_business: is_export_business !== undefined ? is_export_business : undefined,
      enterprise_type: enterprise_type !== undefined ? enterprise_type : calculateEnterpriseType(
        investment_amount !== undefined ? investment_amount : profile?.investment_amount,
        annual_turnover !== undefined ? annual_turnover : profile?.annual_turnover
      ),
      annual_turnover: annual_turnover !== undefined ? Number(annual_turnover) : undefined,
      existing_loan: existing_loan !== undefined ? existing_loan : undefined,
      required_investment_amount: required_investment_amount !== undefined ? Number(required_investment_amount) : undefined,
      city_town_village: city_town_village !== undefined ? city_town_village : undefined,
      pin_code: pin_code !== undefined ? pin_code : undefined,
      area_type: area_type !== undefined ? area_type : undefined,
      is_sez: is_sez !== undefined ? is_sez : undefined,
      owner_age: owner_age !== undefined ? Number(owner_age) : undefined,
      owner_gender: owner_gender !== undefined ? owner_gender : undefined,
      owner_nationality: owner_nationality !== undefined ? owner_nationality : undefined,
      employment_status: employment_status !== undefined ? employment_status : undefined,
      family_income: family_income !== undefined ? Number(family_income) : undefined,
      social_category: social_category !== undefined ? social_category : undefined,
      minority_status: minority_status !== undefined ? minority_status : undefined,
      disability_status: disability_status !== undefined ? disability_status : undefined,
    };

    // Remove undefined keys
    Object.keys(updates).forEach(key => updates[key] === undefined && delete updates[key]);

    if (!profile) {
      profile = await ApplicantProfile.create({
        user_id: req.user.id,
        applicant_name: applicant_name || user.name,
        business_name: business_name || 'My Business',
        business_type: targetType || 'food_processing',
        sector: targetSector || 'food_processing',
        state: state || 'Madhya Pradesh',
        investment_amount: investment_amount != null ? Number(investment_amount) : 10,
        employee_count: employee_count != null ? Number(employee_count) : 5,
        stage: stage || 'pre_establishment',
        ...updates
      });
    } else {
      await profile.update(updates);
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

