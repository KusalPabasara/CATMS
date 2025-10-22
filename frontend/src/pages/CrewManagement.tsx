import React from 'react';
import { Box, Typography, Paper } from '@mui/material';

const CrewManagement: React.FC = () => {
  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Crew Management
      </Typography>
      <Paper sx={{ p: 3 }}>
        <Typography variant="body1">
          Crew management functionality is under development.
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
          This page will allow branch managers to manage staff members and their roles.
        </Typography>
      </Paper>
    </Box>
  );
};

export default CrewManagement;
