/**
 * In-Memory Data Store
 * 
 * Manages transaction data loaded from transactions.json.
 * Uses module-level caching to avoid repeated file I/O.
 * The data is loaded once at server startup and held in memory
 * for fast read access throughout the application lifecycle.
 */

const fs = require('fs');
const path = require('path');

let transactions = [];

/**
 * Load transactions from JSON file
 * @returns {Array} Array of transactions
 */
function loadTransactions() {
  const dataPath = path.join(__dirname, '..', 'data', 'transactions.json');
  
  try {
    if (fs.existsSync(dataPath)) {
      const data = fs.readFileSync(dataPath, 'utf8');
      transactions = JSON.parse(data);
      console.log(`📊 Loaded ${transactions.length} transactions from file`);
    } else {
      console.warn('⚠️  No transactions file found. Run "npm run generate-data" first.');
      transactions = [];
    }
  } catch (error) {
    console.error('❌ Error loading transactions:', error.message);
    transactions = [];
  }
  
  return transactions;
}

/**
 * Get all transactions
 * @returns {Array} Array of transactions
 */
function getTransactions() {
  return transactions;
}

/**
 * Set transactions (useful for testing)
 * @param {Array} data - Array of transactions to set
 */
function setTransactions(data) {
  transactions = data;
}

module.exports = {
  loadTransactions,
  getTransactions,
  setTransactions
};
