import React from 'react';
import { Box, Typography, Paper } from '@mui/material';

const InsuranceManagement: React.FC = () => {
  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Insurance Management
      </Typography>
      <Paper sx={{ p: 3 }}>
        <Typography variant="body1">
          Insurance management functionality is under development.
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
          This page will allow staff to manage insurance policies, claims, and coverage.
        </Typography>
      </Paper>
    </Box>
  );
};

export default InsuranceManagement;
