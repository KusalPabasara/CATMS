import React from 'react';
import { Box, Typography, Paper } from '@mui/material';

const DoctorsManagement: React.FC = () => {
  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Doctors Management
      </Typography>
      <Paper sx={{ p: 3 }}>
        <Typography variant="body1">
          Doctors management functionality is under development.
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
          This page will allow branch managers to manage doctors, schedules, and specialties.
        </Typography>
      </Paper>
    </Box>
  );
};

export default DoctorsManagement;
