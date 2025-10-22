import sequelize from '../config/database';
import Role from '../models/role.model';
import Branch from '../models/branch.model';
import User from '../models/user.model';
import bcrypt from 'bcrypt';

const seedInitialData = async () => {
  try {
    await sequelize.authenticate();
    console.log('✅ DB connected for seeding');

    // Get existing roles
    const roles = await Role.findAll();
    console.log('✅ Found existing roles:', roles.map(r => r.name));

    // Create a default branch if it doesn't exist
    let branch = await Branch.findOne({ where: { name: 'Main Clinic' } });
    if (!branch) {
      branch = await Branch.create({
        name: 'Main Clinic',
        location: '123 Galle Road, Colombo 03, Sri Lanka',
        phone: '+94-11-234-5678'
      });
      console.log('✅ Branch created:', branch.name);
    } else {
      console.log('✅ Using existing branch:', branch.name);
    }

    // Check if admin user already exists
    let adminUser = await User.findOne({ where: { email: 'admin@catms.com' } });
    if (!adminUser) {
      const adminPassword = await bcrypt.hash('admin123', 10);
      const systemAdminRole = roles.find(r => r.name === 'System Administrator');
      if (systemAdminRole) {
        adminUser = await User.create({
          full_name: 'System Administrator',
          email: 'admin@catms.com',
          password_hash: adminPassword,
          role_id: systemAdminRole.role_id,
          branch_id: branch.branch_id
        });
        console.log('✅ Admin user created:', adminUser.email);
      } else {
        console.log('⚠️ System Administrator role not found, skipping admin user creation');
      }
    } else {
      console.log('✅ Admin user already exists:', adminUser.email);
    }

    // Check if doctor user already exists
    let doctorUser = await User.findOne({ where: { email: 'doctor@catms.com' } });
    if (!doctorUser) {
      const doctorPassword = await bcrypt.hash('doctor123', 10);
      const doctorRole = roles.find(r => r.name === 'Doctor');
      if (doctorRole) {
        doctorUser = await User.create({
          full_name: 'Dr. John Smith',
          email: 'doctor@catms.com',
          password_hash: doctorPassword,
          role_id: doctorRole.role_id,
          branch_id: branch.branch_id
        });
        console.log('✅ Doctor user created:', doctorUser.email);
      } else {
        console.log('⚠️ Doctor role not found, skipping doctor user creation');
      }
    } else {
      console.log('✅ Doctor user already exists:', doctorUser.email);
    }

    console.log('✅ Initial data seeding completed successfully!');
    console.log('\n📋 Test Credentials:');
    console.log('Admin: admin@catms.com / admin123');
    console.log('Doctor: doctor@catms.com / doctor123');

  } catch (err) {
    console.error('❌ Seeding error:', err);
  } finally {
    await sequelize.close();
  }
};

seedInitialData();
