/**
 * Unit Tests for Filter Service
 */

const {
  filterByCardBrand,
  filterByStatus,
  filterByDeclineReasonCode,
  applyFilters
} = require('../src/services/filterService');

// Sample test data
const mockTransactions = [
  {
    transactionId: 'TXN-001',
    merchantId: 'MERCH-001',
    amount: 100.00,
    cardBrand: 'Visa',
    status: 'Approved',
    transactionDate: '2026-02-01T10:00:00.000Z'
  },
  {
    transactionId: 'TXN-002',
    merchantId: 'MERCH-002',
    amount: 200.00,
    cardBrand: 'Mastercard',
    status: 'Declined',
    declineReasonCode: '01-Insufficient funds',
    transactionDate: '2026-02-02T11:00:00.000Z'
  },
  {
    transactionId: 'TXN-003',
    merchantId: 'MERCH-003',
    amount: 300.00,
    cardBrand: 'Visa',
    status: 'Declined',
    declineReasonCode: '02-Invalid card number',
    transactionDate: '2026-01-15T12:00:00.000Z'
  },
  {
    transactionId: 'TXN-004',
    merchantId: 'MERCH-004',
    amount: 400.00,
    cardBrand: 'Amex',
    status: 'Approved',
    transactionDate: '2026-01-20T13:00:00.000Z'
  },
  {
    transactionId: 'TXN-005',
    merchantId: 'MERCH-005',
    amount: 500.00,
    cardBrand: 'Discover',
    status: 'Declined',
    declineReasonCode: '03-Suspected fraud',
    transactionDate: '2025-12-10T14:00:00.000Z'
  }
];

describe('Filter Service', () => {
  describe('filterByCardBrand', () => {
    it('should return all transactions when cardBrand is not specified', () => {
      const result = filterByCardBrand(mockTransactions, null);
      expect(result).toHaveLength(5);
    });

    it('should return all transactions when cardBrand is "all"', () => {
      const result = filterByCardBrand(mockTransactions, 'all');
      expect(result).toHaveLength(5);
    });

    it('should filter transactions by Visa', () => {
      const result = filterByCardBrand(mockTransactions, 'Visa');
      expect(result).toHaveLength(2);
      expect(result.every(t => t.cardBrand === 'Visa')).toBe(true);
    });

    it('should filter transactions by Mastercard', () => {
      const result = filterByCardBrand(mockTransactions, 'Mastercard');
      expect(result).toHaveLength(1);
      expect(result[0].cardBrand).toBe('Mastercard');
    });

    it('should filter transactions by Amex', () => {
      const result = filterByCardBrand(mockTransactions, 'Amex');
      expect(result).toHaveLength(1);
      expect(result[0].cardBrand).toBe('Amex');
    });

    it('should filter transactions by Discover', () => {
      const result = filterByCardBrand(mockTransactions, 'Discover');
      expect(result).toHaveLength(1);
      expect(result[0].cardBrand).toBe('Discover');
    });

    it('should return empty array for non-existent card brand', () => {
      const result = filterByCardBrand(mockTransactions, 'NonExistent');
      expect(result).toHaveLength(0);
    });
  });

  describe('filterByStatus', () => {
    it('should return all transactions when status is not specified', () => {
      const result = filterByStatus(mockTransactions, null);
      expect(result).toHaveLength(5);
    });

    it('should return all transactions when status is "all"', () => {
      const result = filterByStatus(mockTransactions, 'all');
      expect(result).toHaveLength(5);
    });

    it('should filter transactions by Approved status', () => {
      const result = filterByStatus(mockTransactions, 'Approved');
      expect(result).toHaveLength(2);
      expect(result.every(t => t.status === 'Approved')).toBe(true);
    });

    it('should filter transactions by Declined status', () => {
      const result = filterByStatus(mockTransactions, 'Declined');
      expect(result).toHaveLength(3);
      expect(result.every(t => t.status === 'Declined')).toBe(true);
    });
  });

  describe('filterByDeclineReasonCode', () => {
    it('should return all transactions when declineReasonCode is not specified', () => {
      const result = filterByDeclineReasonCode(mockTransactions, null);
      expect(result).toHaveLength(5);
    });

    it('should return all transactions when declineReasonCode is "all"', () => {
      const result = filterByDeclineReasonCode(mockTransactions, 'all');
      expect(result).toHaveLength(5);
    });

    it('should filter transactions by decline reason code', () => {
      const result = filterByDeclineReasonCode(mockTransactions, '01-Insufficient funds');
      expect(result).toHaveLength(1);
      expect(result[0].declineReasonCode).toBe('01-Insufficient funds');
    });

    it('should filter by suspected fraud decline reason', () => {
      const result = filterByDeclineReasonCode(mockTransactions, '03-Suspected fraud');
      expect(result).toHaveLength(1);
      expect(result[0].declineReasonCode).toBe('03-Suspected fraud');
    });
  });

  describe('applyFilters', () => {
    it('should return all transactions when no filters are applied', () => {
      const result = applyFilters(mockTransactions, {});
      expect(result).toHaveLength(5);
    });

    it('should apply single filter correctly', () => {
      const result = applyFilters(mockTransactions, { cardBrand: 'Visa' });
      expect(result).toHaveLength(2);
    });

    it('should apply multiple filters correctly', () => {
      const result = applyFilters(mockTransactions, {
        cardBrand: 'Visa',
        status: 'Declined'
      });
      expect(result).toHaveLength(1);
      expect(result[0].cardBrand).toBe('Visa');
      expect(result[0].status).toBe('Declined');
    });

    it('should apply all three filters correctly', () => {
      const result = applyFilters(mockTransactions, {
        cardBrand: 'Mastercard',
        status: 'Declined',
        declineReasonCode: '01-Insufficient funds'
      });
      expect(result).toHaveLength(1);
      expect(result[0].transactionId).toBe('TXN-002');
    });

    it('should return empty array when filters result in no matches', () => {
      const result = applyFilters(mockTransactions, {
        cardBrand: 'Visa',
        status: 'Declined',
        declineReasonCode: '03-Suspected fraud'
      });
      expect(result).toHaveLength(0);
    });

    it('should not modify the original array', () => {
      const originalLength = mockTransactions.length;
      applyFilters(mockTransactions, { cardBrand: 'Visa' });
      expect(mockTransactions).toHaveLength(originalLength);
    });
  });
});
