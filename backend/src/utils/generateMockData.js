/**
 * Mock Data Generator for Merchant Transaction Dashboard
 * Generates 50+ transaction records spanning multiple months
 */

const fs = require('fs');
const path = require('path');

// Constants
const CARD_BRANDS = ['Visa', 'Mastercard', 'Amex', 'Discover'];
const STATUSES = ['Approved', 'Declined'];
const DECLINE_REASON_CODES = [
  '01-Insufficient funds',
  '02-Invalid card number',
  '03-Suspected fraud'
];

// Generate a random ID
function generateId() {
  return 'TXN-' + Math.random().toString(36).substring(2, 11).toUpperCase();
}

// Generate a random merchant ID
function generateMerchantId() {
  return 'MERCH-' + Math.random().toString(36).substring(2, 8).toUpperCase();
}

// Generate a random amount between min and max
function generateAmount(min = 10, max = 5000) {
  return parseFloat((Math.random() * (max - min) + min).toFixed(2));
}

// Get a random element from an array
function getRandomElement(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

// Generate a random date within the past N months
function generateRandomDate(monthsBack = 6) {
  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth();
  
  // Random month within the range (current month to monthsBack months ago)
  const randomMonthsBack = Math.floor(Math.random() * (monthsBack + 1));
  const targetMonth = currentMonth - randomMonthsBack;
  
  // Calculate the actual month and year
  let month = targetMonth;
  let year = currentYear;
  
  while (month < 0) {
    month += 12;
    year -= 1;
  }
  
  // Random day within the month
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const day = Math.floor(Math.random() * daysInMonth) + 1;
  
  // Random time
  const hours = Math.floor(Math.random() * 24);
  const minutes = Math.floor(Math.random() * 60);
  const seconds = Math.floor(Math.random() * 60);
  
  const date = new Date(year, month, day, hours, minutes, seconds);
  
  // For current month, ensure date is not in the future
  if (date > now) {
    date.setDate(now.getDate() - 1);
  }
  
  return date.toISOString();
}

// Generate a single transaction
function generateTransaction() {
  const status = getRandomElement(STATUSES);
  
  const transaction = {
    transactionId: generateId(),
    merchantId: generateMerchantId(),
    amount: generateAmount(),
    cardBrand: getRandomElement(CARD_BRANDS),
    status: status,
    transactionDate: generateRandomDate(6)
  };
  
  // Add decline reason code only if status is Declined
  if (status === 'Declined') {
    transaction.declineReasonCode = getRandomElement(DECLINE_REASON_CODES);
  }
  
  return transaction;
}

// Generate multiple transactions
function generateTransactions(count = 50) {
  const transactions = [];
  
  // Ensure we have at least some transactions in the current month
  const currentMonthCount = Math.ceil(count * 0.3); // 30% in current month
  const otherMonthsCount = count - currentMonthCount;
  
  // Generate current month transactions
  for (let i = 0; i < currentMonthCount; i++) {
    const transaction = generateTransaction();
    // Override date to be in current month
    const now = new Date();
    const randomDay = Math.floor(Math.random() * now.getDate()) + 1;
    const currentMonthDate = new Date(
      now.getFullYear(),
      now.getMonth(),
      randomDay,
      Math.floor(Math.random() * 24),
      Math.floor(Math.random() * 60),
      Math.floor(Math.random() * 60)
    );
    transaction.transactionDate = currentMonthDate.toISOString();
    transactions.push(transaction);
  }
  
  // Generate other months transactions
  for (let i = 0; i < otherMonthsCount; i++) {
    transactions.push(generateTransaction());
  }
  
  // Sort by date (most recent first)
  transactions.sort((a, b) => new Date(b.transactionDate) - new Date(a.transactionDate));
  
  return transactions;
}

// Main execution
function main() {
  const transactionCount = 75; // Generate 75 transactions
  const transactions = generateTransactions(transactionCount);
  
  // Create data directory if it doesn't exist
  const dataDir = path.join(__dirname, '..', 'data');
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }
  
  // Write to JSON file
  const filePath = path.join(dataDir, 'transactions.json');
  fs.writeFileSync(filePath, JSON.stringify(transactions, null, 2));
  
  console.log(`✅ Generated ${transactions.length} transactions`);
  console.log(`📁 Saved to: ${filePath}`);
  
  // Print summary
  const approved = transactions.filter(t => t.status === 'Approved').length;
  const declined = transactions.filter(t => t.status === 'Declined').length;
  
  console.log('\n📊 Summary:');
  console.log(`   Approved: ${approved}`);
  console.log(`   Declined: ${declined}`);
  
  // Group by month
  const byMonth = {};
  transactions.forEach(t => {
    const date = new Date(t.transactionDate);
    const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
    byMonth[monthKey] = (byMonth[monthKey] || 0) + 1;
  });
  
  console.log('\n📅 Transactions by Month:');
  Object.entries(byMonth).sort().forEach(([month, count]) => {
    console.log(`   ${month}: ${count}`);
  });
}

// Export for testing
module.exports = {
  generateId,
  generateMerchantId,
  generateAmount,
  getRandomElement,
  generateTransaction,
  generateTransactions,
  CARD_BRANDS,
  STATUSES,
  DECLINE_REASON_CODES
};

// Run if called directly
if (require.main === module) {
  main();
}
