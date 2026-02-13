/**
 * Transaction Aggregation Service
 * 
 * Calculates summary metrics from transaction arrays.
 * Supports two aggregation modes:
 * - MTD (Month-to-Date): Metrics for the current calendar month only
 * - Monthly: Grouped metrics for each month in the dataset, sorted descending
 * 
 * Metrics calculated: total transactions, approved/declined counts,
 * total volume, and breakdowns by card brand and decline reason.
 */

/**
 * Get the current month key (YYYY-MM format)
 * @returns {string} Current month key
 */
function getCurrentMonthKey() {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
}

/**
 * Get month key from a date
 * @param {string|Date} date - Date to extract month from
 * @returns {string} Month key in YYYY-MM format
 */
function getMonthKey(date) {
  const d = new Date(date);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
}

/**
 * Format month key to readable format
 * @param {string} monthKey - Month key in YYYY-MM format
 * @returns {string} Readable month format (e.g., "Jan 2025")
 */
function formatMonthKey(monthKey) {
  const [year, month] = monthKey.split('-');
  const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 
                      'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  return `${monthNames[parseInt(month) - 1]} ${year}`;
}

/**
 * Calculate aggregated metrics for a set of transactions
 * @param {Array} transactions - Array of transaction objects
 * @returns {Object} Aggregated metrics
 */
function calculateMetrics(transactions) {
  const total = transactions.length;
  const approved = transactions.filter(t => t.status === 'Approved');
  const declined = transactions.filter(t => t.status === 'Declined');
  
  // Group by card brand
  const byCardBrand = {};
  transactions.forEach(t => {
    if (!byCardBrand[t.cardBrand]) {
      byCardBrand[t.cardBrand] = { total: 0, approved: 0, declined: 0, amount: 0 };
    }
    byCardBrand[t.cardBrand].total++;
    byCardBrand[t.cardBrand].amount += t.amount;
    if (t.status === 'Approved') {
      byCardBrand[t.cardBrand].approved++;
    } else {
      byCardBrand[t.cardBrand].declined++;
    }
  });
  
  // Group by decline reason code
  const byDeclineReason = {};
  declined.forEach(t => {
    if (t.declineReasonCode) {
      if (!byDeclineReason[t.declineReasonCode]) {
        byDeclineReason[t.declineReasonCode] = 0;
      }
      byDeclineReason[t.declineReasonCode]++;
    }
  });
  
  // Calculate total amounts
  const totalAmount = transactions.reduce((sum, t) => sum + t.amount, 0);
  const approvedAmount = approved.reduce((sum, t) => sum + t.amount, 0);
  const declinedAmount = declined.reduce((sum, t) => sum + t.amount, 0);
  
  return {
    totalTransactions: total,
    totalApproved: approved.length,
    totalDeclined: declined.length,
    totalAmount: parseFloat(totalAmount.toFixed(2)),
    approvedAmount: parseFloat(approvedAmount.toFixed(2)),
    declinedAmount: parseFloat(declinedAmount.toFixed(2)),
    byCardBrand,
    byDeclineReason
  };
}

/**
 * Calculate Month-to-Date (MTD) summary
 * @param {Array} transactions - Array of transaction objects
 * @returns {Object} MTD summary with metrics
 */
function calculateMTDSummary(transactions) {
  const currentMonthKey = getCurrentMonthKey();
  
  // Filter transactions for current month
  const mtdTransactions = transactions.filter(t => {
    return getMonthKey(t.transactionDate) === currentMonthKey;
  });
  
  const metrics = calculateMetrics(mtdTransactions);
  
  return {
    month: currentMonthKey,
    monthFormatted: formatMonthKey(currentMonthKey),
    ...metrics
  };
}

/**
 * Calculate Month-by-Month summary
 * @param {Array} transactions - Array of transaction objects
 * @returns {Array} Array of monthly summaries sorted by month
 */
function calculateMonthByMonthSummary(transactions) {
  // Group transactions by month
  const byMonth = {};
  
  transactions.forEach(t => {
    const monthKey = getMonthKey(t.transactionDate);
    if (!byMonth[monthKey]) {
      byMonth[monthKey] = [];
    }
    byMonth[monthKey].push(t);
  });
  
  // Calculate metrics for each month
  const monthlySummaries = Object.entries(byMonth).map(([monthKey, monthTransactions]) => {
    const metrics = calculateMetrics(monthTransactions);
    return {
      month: monthKey,
      monthFormatted: formatMonthKey(monthKey),
      ...metrics
    };
  });
  
  // Sort by month (most recent first)
  monthlySummaries.sort((a, b) => b.month.localeCompare(a.month));
  
  return monthlySummaries;
}

module.exports = {
  getCurrentMonthKey,
  getMonthKey,
  formatMonthKey,
  calculateMetrics,
  calculateMTDSummary,
  calculateMonthByMonthSummary
};
