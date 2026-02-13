/**
 * Transaction Filter Service
 * 
 * Provides composable filter functions for querying transactions.
 * Each filter is pure (no side effects) and can be combined via applyFilters().
 * 
 * Supported filters:
 * - cardBrand: Visa, Mastercard, Amex, Discover
 * - status: Approved, Declined
 * - declineReasonCode: 01-Insufficient funds, 02-Invalid card number, 03-Suspected fraud
 */

/**
 * Filter transactions by card brand
 * @param {Array} transactions - Array of transaction objects
 * @param {string} cardBrand - Card brand to filter by (Visa, Mastercard, Amex, Discover)
 * @returns {Array} Filtered transactions
 */
function filterByCardBrand(transactions, cardBrand) {
  if (!cardBrand || cardBrand === 'all') return transactions;
  return transactions.filter(t => t.cardBrand === cardBrand);
}

/**
 * Filter transactions by status
 * @param {Array} transactions - Array of transaction objects
 * @param {string} status - Status to filter by (Approved, Declined)
 * @returns {Array} Filtered transactions
 */
function filterByStatus(transactions, status) {
  if (!status || status === 'all') return transactions;
  return transactions.filter(t => t.status === status);
}

/**
 * Filter transactions by decline reason code
 * @param {Array} transactions - Array of transaction objects
 * @param {string} declineReasonCode - Decline reason code to filter by
 * @returns {Array} Filtered transactions
 */
function filterByDeclineReasonCode(transactions, declineReasonCode) {
  if (!declineReasonCode || declineReasonCode === 'all') return transactions;
  return transactions.filter(t => t.declineReasonCode === declineReasonCode);
}

/**
 * Apply all filters to transactions
 * @param {Array} transactions - Array of transaction objects
 * @param {Object} filters - Object containing filter criteria
 * @returns {Array} Filtered transactions
 */
function applyFilters(transactions, filters = {}) {
  let result = [...transactions];
  
  if (filters.cardBrand) {
    result = filterByCardBrand(result, filters.cardBrand);
  }
  
  if (filters.status) {
    result = filterByStatus(result, filters.status);
  }
  
  if (filters.declineReasonCode) {
    result = filterByDeclineReasonCode(result, filters.declineReasonCode);
  }
  
  return result;
}

module.exports = {
  filterByCardBrand,
  filterByStatus,
  filterByDeclineReasonCode,
  applyFilters
};
