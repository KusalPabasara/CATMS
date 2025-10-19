const { exec } = require('child_process');
const path = require('path');

console.log('🚀 Starting CATMS Backend...');

// Function to run database sync
const runDatabaseSync = () => {
  return new Promise((resolve, reject) => {
    console.log('🔄 Running database sync...');
    
    exec('npx ts-node ./utils/sync.ts', (error, stdout, stderr) => {
      if (error) {
        console.error('❌ Database sync failed:', error);
        console.log('⚠️  Continuing without sync...');
        resolve();
        return;
      }
      
      console.log('✅ Database sync completed successfully');
      console.log(stdout);
      resolve();
    });
  });
};

// Function to start the main application
const startApp = () => {
  console.log('🚀 Starting main application...');
  
  exec('npm run start', (error, stdout, stderr) => {
    if (error) {
      console.error('❌ Failed to start application:', error);
      process.exit(1);
    }
    
    console.log(stdout);
  });
};

// Main startup sequence
const startup = async () => {
  try {
    // Wait a bit for database to be ready
    console.log('⏳ Waiting for database to be ready...');
    await new Promise(resolve => setTimeout(resolve, 5000));
    
    // Run database sync
    await runDatabaseSync();
    
    // Start the main application
    startApp();
    
  } catch (error) {
    console.error('❌ Startup failed:', error);
    process.exit(1);
  }
};

// Start the startup sequence
startup();
