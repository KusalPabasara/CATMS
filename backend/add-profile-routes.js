// Script to add profile picture routes to the existing server
const express = require('express');
const profilePictureRoutes = require('./profile-picture-routes');

// Create a simple server that extends the existing one
const app = express();

// Add CORS
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', 'http://localhost:5173');
  res.header('Access-Control-Allow-Credentials', 'true');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  if (req.method === 'OPTIONS') {
    res.sendStatus(200);
  } else {
    next();
  }
});

// Add body parser
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static files for uploads
app.use('/uploads', express.static('uploads'));

// Add profile picture routes
app.use('/api/patient-auth', profilePictureRoutes);

// Health check
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'healthy', service: 'profile-picture-upload' });
});

const PORT = 5001; // Use a different port to avoid conflicts
app.listen(PORT, () => {
  console.log(`📸 Profile picture upload service running on http://localhost:${PORT}`);
  console.log(`📸 Upload endpoint: http://localhost:${PORT}/api/patient-auth/profile-picture`);
});



