import React from 'react';
import { Box, Typography, Paper } from '@mui/material';

const Users: React.FC = () => {
  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        User Management
      </Typography>
      <Paper sx={{ p: 3 }}>
        <Typography variant="body1">
          User management functionality is under development.
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
          This page will allow administrators to manage system users, roles, and permissions.
        </Typography>
      </Paper>
    </Box>
  );
};

export default Users;
