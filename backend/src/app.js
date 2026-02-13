/**
 * Express Application Configuration
 * 
 * Sets up the Express app with:
 * - CORS for cross-origin requests from the React frontend
 * - JSON body parsing for POST/PUT requests
 * - Transaction API routes mounted at /api/transactions
 * - Global error handling for uncaught exceptions
 */

const express = require('express');
const cors = require('cors');

const transactionRoutes = require('./routes/transactionRoutes');

const app = express();

// Enable CORS for frontend running on port 5173
app.use(cors());

// Parse JSON request bodies (not currently used, but enables future POST endpoints)
app.use(express.json());

// Mount transaction routes - all endpoints prefixed with /api/transactions
app.use('/api/transactions', transactionRoutes);

// Simple health check for load balancers and monitoring
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Catch-all for undefined routes
app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: 'Endpoint not found'
  });
});

// Global error handler - catches any unhandled errors in route handlers
app.use((err, req, res, next) => {
  console.error('Error:', err.message);
  res.status(500).json({
    success: false,
    error: 'Internal server error'
  });
});

module.exports = app;
