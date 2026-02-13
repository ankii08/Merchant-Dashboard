/**
 * Transaction API Routes
 * 
 * RESTful endpoints for transaction data access and aggregation.
 * All routes support optional query parameters for filtering:
 * - cardBrand: Filter by payment network
 * - status: Filter by Approved/Declined
 * - declineReasonCode: Filter by specific decline reason
 * 
 * Base path: /api/transactions (mounted in app.js)
 */

const express = require('express');
const router = express.Router();

const { getTransactions } = require('../data/dataStore');
const { applyFilters } = require('../services/filterService');
const { calculateMTDSummary, calculateMonthByMonthSummary } = require('../services/aggregationService');

/**
 * GET /api/transactions
 * Returns all transactions with optional filtering
 * Query params: cardBrand, status, declineReasonCode
 */
router.get('/', (req, res) => {
  try {
    const { cardBrand, status, declineReasonCode } = req.query;
    
    let transactions = getTransactions();
    
    // Apply filters
    transactions = applyFilters(transactions, {
      cardBrand,
      status,
      declineReasonCode
    });
    
    res.json({
      success: true,
      count: transactions.length,
      data: transactions
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * GET /api/transactions/summary
 * Returns MTD and Month-by-Month summaries with optional filtering
 * Query params: cardBrand, status, declineReasonCode
 */
router.get('/summary', (req, res) => {
  try {
    const { cardBrand, status, declineReasonCode } = req.query;
    
    let transactions = getTransactions();
    
    // Apply filters
    transactions = applyFilters(transactions, {
      cardBrand,
      status,
      declineReasonCode
    });
    
    // Calculate summaries
    const mtdSummary = calculateMTDSummary(transactions);
    const monthByMonth = calculateMonthByMonthSummary(transactions);
    
    res.json({
      success: true,
      filters: {
        cardBrand: cardBrand || 'all',
        status: status || 'all',
        declineReasonCode: declineReasonCode || 'all'
      },
      mtdSummary,
      monthByMonth
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * GET /api/transactions/mtd
 * Returns Month-to-Date summary only
 * Query params: cardBrand, status, declineReasonCode
 */
router.get('/mtd', (req, res) => {
  try {
    const { cardBrand, status, declineReasonCode } = req.query;
    
    let transactions = getTransactions();
    
    // Apply filters
    transactions = applyFilters(transactions, {
      cardBrand,
      status,
      declineReasonCode
    });
    
    const mtdSummary = calculateMTDSummary(transactions);
    
    res.json({
      success: true,
      data: mtdSummary
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * GET /api/transactions/monthly
 * Returns Month-by-Month summary only
 * Query params: cardBrand, status, declineReasonCode
 */
router.get('/monthly', (req, res) => {
  try {
    const { cardBrand, status, declineReasonCode } = req.query;
    
    let transactions = getTransactions();
    
    // Apply filters
    transactions = applyFilters(transactions, {
      cardBrand,
      status,
      declineReasonCode
    });
    
    const monthByMonth = calculateMonthByMonthSummary(transactions);
    
    res.json({
      success: true,
      data: monthByMonth
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * GET /api/transactions/filters
 * Returns available filter options
 */
router.get('/filters', (req, res) => {
  try {
    res.json({
      success: true,
      data: {
        cardBrands: ['Visa', 'Mastercard', 'Amex', 'Discover'],
        statuses: ['Approved', 'Declined'],
        declineReasonCodes: [
          '01-Insufficient funds',
          '02-Invalid card number',
          '03-Suspected fraud'
        ]
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

module.exports = router;
