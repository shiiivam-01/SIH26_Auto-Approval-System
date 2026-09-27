module.exports = {
  up: async (queryInterface, Sequelize) => {
    const tables = await queryInterface.showAllTables();
    if (!tables.includes('ApplicantProfiles')) {
      console.log('[Migration 03] ApplicantProfiles table does not exist. Skipping.');
      return;
    }

    const tableInfo = await queryInterface.describeTable('ApplicantProfiles');
    const cols = [
      // Business Details
      { name: 'date_of_establishment', type: Sequelize.STRING },
      { name: 'registration_number', type: Sequelize.STRING },
      { name: 'udyam_registration_number', type: Sequelize.STRING },
      // Business Activity
      { name: 'sub_sector', type: Sequelize.STRING },
      { name: 'business_activity', type: Sequelize.STRING },
      { name: 'products_services', type: Sequelize.STRING },
      { name: 'is_export_business', type: Sequelize.STRING, defaultValue: 'No' },
      // Financial Details
      { name: 'enterprise_type', type: Sequelize.STRING },
      { name: 'annual_turnover', type: Sequelize.FLOAT },
      { name: 'existing_loan', type: Sequelize.STRING, defaultValue: 'No' },
      { name: 'required_investment_amount', type: Sequelize.FLOAT },
      // Business Location
      { name: 'city_town_village', type: Sequelize.STRING },
      { name: 'pin_code', type: Sequelize.STRING },
      { name: 'area_type', type: Sequelize.STRING },
      { name: 'is_sez', type: Sequelize.STRING, defaultValue: 'No' },
      // Owner Details
      { name: 'owner_age', type: Sequelize.INTEGER },
      { name: 'owner_gender', type: Sequelize.STRING },
      { name: 'owner_nationality', type: Sequelize.STRING, defaultValue: 'Indian' },
      { name: 'employment_status', type: Sequelize.STRING },
      { name: 'family_income', type: Sequelize.FLOAT },
      { name: 'social_category', type: Sequelize.STRING },
      { name: 'minority_status', type: Sequelize.STRING, defaultValue: 'No' },
      { name: 'disability_status', type: Sequelize.STRING, defaultValue: 'No' },
    ];

    for (const col of cols) {
      if (!tableInfo[col.name]) {
        console.log(`[Migration 03] Adding ${col.name} to ApplicantProfiles...`);
        await queryInterface.addColumn('ApplicantProfiles', col.name, {
          type: col.type,
          allowNull: true,
          defaultValue: col.defaultValue || null,
        });
        console.log(`[Migration 03] Added ${col.name} successfully.`);
      } else {
        console.log(`[Migration 03] ${col.name} already exists. Skipping.`);
      }
    }
  },
};
