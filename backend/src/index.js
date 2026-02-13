/**
 * Server Entry Point
 * Starts the Express server
 */

const app = require('./app');
const { loadTransactions } = require('./data/dataStore');

const PORT = process.env.PORT || 3001;

// Load transaction data
loadTransactions();

// Start server
app.listen(PORT, () => {
  console.log(`\n Server running on http://localhost:${PORT}`);
  console.log(` API available at http://localhost:${PORT}/api/transactions`);
  console.log(`\nAvailable endpoints:`);
  console.log(`   GET /api/transactions          - All transactions`);
  console.log(`   GET /api/transactions/summary  - MTD & Monthly summaries`);
  console.log(`   GET /api/transactions/mtd      - MTD summary only`);
  console.log(`   GET /api/transactions/monthly  - Monthly summary only`);
  console.log(`   GET /api/transactions/filters  - Available filter options`);
  console.log(`   GET /api/health               - Health check\n`);
});
