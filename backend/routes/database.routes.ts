import express from 'express';
import { authenticateToken } from '../auth/auth.middleware';
import sequelize from '../config/database';

const router = express.Router();

// Apply authentication middleware to all routes
router.use(authenticateToken);

// Get all tables
router.get('/tables', async (req, res) => {
  try {
    const [results] = await sequelize.query(`
      SELECT TABLE_NAME as name, TABLE_COMMENT as comment
      FROM INFORMATION_SCHEMA.TABLES 
      WHERE TABLE_SCHEMA = DATABASE()
      ORDER BY TABLE_NAME
    `);
    
    res.json({
      success: true,
      data: results,
    });
  } catch (error) {
    console.error('Error fetching tables:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch tables',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

// Get table structure
router.get('/table/:tableName', async (req, res) => {
  try {
    const { tableName } = req.params;
    
    const [results] = await sequelize.query(`
      SELECT 
        COLUMN_NAME as name,
        DATA_TYPE as type,
        IS_NULLABLE as nullable,
        COLUMN_KEY as \`key\`,
        COLUMN_DEFAULT as default_value,
        EXTRA as extra,
        COLUMN_COMMENT as comment
      FROM INFORMATION_SCHEMA.COLUMNS 
      WHERE TABLE_SCHEMA = DATABASE() 
      AND TABLE_NAME = ?
      ORDER BY ORDINAL_POSITION
    `, {
      replacements: [tableName],
    });
    
    res.json({
      success: true,
      data: results,
    });
  } catch (error) {
    console.error('Error fetching table structure:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch table structure',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

// Execute query (for migration purposes)
router.post('/query', async (req, res) => {
  try {
    const { query } = req.body;
    
    if (!query) {
      return res.status(400).json({
        success: false,
        message: 'Query is required',
      });
    }
    
    // Only allow SELECT queries for security
    if (!query.trim().toUpperCase().startsWith('SELECT')) {
      return res.status(400).json({
        success: false,
        message: 'Only SELECT queries are allowed',
      });
    }
    
    const [results] = await sequelize.query(query);
    
    res.json({
      success: true,
      data: results,
    });
  } catch (error) {
    console.error('Error executing query:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to execute query',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

// Execute migration (for MedSync migration)
router.post('/migrate', async (req, res) => {
  try {
    const { sql } = req.body;
    
    if (!sql) {
      return res.status(400).json({
        success: false,
        message: 'SQL is required',
      });
    }
    
    // Execute the migration SQL
    await sequelize.query(sql);
    
    res.json({
      success: true,
      message: 'Migration executed successfully',
    });
  } catch (error) {
    console.error('Error executing migration:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to execute migration',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

export default router;
