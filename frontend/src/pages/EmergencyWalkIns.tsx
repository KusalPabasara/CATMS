import React from 'react';
import { Box, Typography, Paper } from '@mui/material';

const EmergencyWalkIns: React.FC = () => {
  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Emergency Walk-ins
      </Typography>
      <Paper sx={{ p: 3 }}>
        <Typography variant="body1">
          Emergency walk-ins functionality is under development.
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
          This page will allow staff to manage emergency walk-in appointments and urgent cases.
        </Typography>
      </Paper>
    </Box>
  );
};

export default EmergencyWalkIns;
