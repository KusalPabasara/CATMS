import React from 'react';
import { Box, Typography, Paper } from '@mui/material';

const BranchManagers: React.FC = () => {
  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Branch Managers
      </Typography>
      <Paper sx={{ p: 3 }}>
        <Typography variant="body1">
          Branch manager management functionality is under development.
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
          This page will allow system administrators to manage branch managers and their permissions.
        </Typography>
      </Paper>
    </Box>
  );
};

export default BranchManagers;
