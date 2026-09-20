const { ApplicantProfile } = require('./src/models');
const { Sequelize } = require('sequelize');
const db = require('./src/config/database');

async function fix() {
  try {
    await db.authenticate();
    const [updated] = await ApplicantProfile.update(
      { stage: 'pre_establishment' },
      { where: { stage: 'pre_registration' } }
    );
    console.log(`Updated ${updated} records.`);
  } catch (err) {
    console.error(err);
  } finally {
    process.exit(0);
  }
}

fix();
