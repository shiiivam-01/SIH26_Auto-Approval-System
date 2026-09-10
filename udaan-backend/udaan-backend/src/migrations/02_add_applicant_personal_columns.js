module.exports = {
  up: async (queryInterface, Sequelize) => {
    const tables = await queryInterface.showAllTables();
    if (!tables.includes('ApplicantProfiles')) {
      console.log('[Migration] ApplicantProfiles table does not exist. Skipping.');
      return;
    }

    const tableInfo = await queryInterface.describeTable('ApplicantProfiles');
    const cols = [
      { name: 'applicant_name', type: Sequelize.STRING },
      { name: 'date_of_birth', type: Sequelize.STRING },
      { name: 'phone_number', type: Sequelize.STRING },
      { name: 'aadhaar_number', type: Sequelize.STRING },
      { name: 'pan_number', type: Sequelize.STRING },
      { name: 'business_type', type: Sequelize.STRING },
    ];

    for (const col of cols) {
      if (!tableInfo[col.name]) {
        console.log(`[Migration] Adding ${col.name} to ApplicantProfiles table...`);
        await queryInterface.addColumn('ApplicantProfiles', col.name, {
          type: col.type,
          allowNull: true,
        });
        console.log(`[Migration] Added ${col.name} successfully.`);
      } else {
        console.log(`[Migration] ${col.name} column already exists. Skipping.`);
      }
    }
  },
};
