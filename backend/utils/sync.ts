import sequelize from '../config/database';
import db from '../models';

const syncDB = async () => {
  try {
    await sequelize.authenticate();
    console.log('✅ DB connected');

    await sequelize.sync({ force: false }); // 👉 Set to true to drop & recreate tables
    console.log('✅ All models synced successfully');
  } catch (err) {
    console.error('❌ Sync error:', err);
  } finally {
    await sequelize.close();
  }
};

syncDB();
