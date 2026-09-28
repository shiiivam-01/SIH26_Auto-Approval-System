module.exports = {
  up: async (queryInterface, Sequelize) => {
    const tables = await queryInterface.showAllTables();
    if (!tables.includes('DocumentVaults')) {
      console.log('[Migration 04] DocumentVaults table does not exist. Skipping.');
      return;
    }

    const tableInfo = await queryInterface.describeTable('DocumentVaults');
    const cols = [
      { name: 'required_document_type', type: Sequelize.STRING },
      { name: 'detected_document_type', type: Sequelize.STRING },
      { name: 'confidence_score', type: Sequelize.FLOAT },
      { name: 'quality_status', type: Sequelize.STRING },
      { name: 'validation_message', type: Sequelize.STRING(1000) }
    ];

    // Modify enum values for verified_status to include the new AI statuses
    // For SQLite, replacing ENUMs is hard, but Sequelize handles string types for SQLite.
    // For Postgres, ENUMs require special commands, but since we are migrating, we can just add the cols first.
    
    for (const col of cols) {
      if (!tableInfo[col.name]) {
        console.log(`[Migration 04] Adding ${col.name} to DocumentVaults...`);
        await queryInterface.addColumn('DocumentVaults', col.name, {
          type: col.type,
          allowNull: true,
        });
        console.log(`[Migration 04] Added ${col.name} successfully.`);
      } else {
        console.log(`[Migration 04] ${col.name} already exists. Skipping.`);
      }
    }
  },
};
