/**
 * Unit Tests for Aggregation Service
 */

const {
  getCurrentMonthKey,
  getMonthKey,
  formatMonthKey,
  calculateMetrics,
  calculateMTDSummary,
  calculateMonthByMonthSummary
} = require('../src/services/aggregationService');

// Sample test data - using fixed dates for predictable testing
const mockTransactions = [
  // February 2026 transactions (current month for test date)
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
    transactionDate: '2026-02-05T11:00:00.000Z'
  },
  {
    transactionId: 'TXN-003',
    merchantId: 'MERCH-003',
    amount: 150.00,
    cardBrand: 'Visa',
    status: 'Approved',
    transactionDate: '2026-02-08T12:00:00.000Z'
  },
  // January 2026 transactions
  {
    transactionId: 'TXN-004',
    merchantId: 'MERCH-004',
    amount: 300.00,
    cardBrand: 'Amex',
    status: 'Approved',
    transactionDate: '2026-01-15T13:00:00.000Z'
  },
  {
    transactionId: 'TXN-005',
    merchantId: 'MERCH-005',
    amount: 400.00,
    cardBrand: 'Discover',
    status: 'Declined',
    declineReasonCode: '02-Invalid card number',
    transactionDate: '2026-01-20T14:00:00.000Z'
  },
  // December 2025 transactions
  {
    transactionId: 'TXN-006',
    merchantId: 'MERCH-006',
    amount: 500.00,
    cardBrand: 'Visa',
    status: 'Declined',
    declineReasonCode: '03-Suspected fraud',
    transactionDate: '2025-12-10T15:00:00.000Z'
  }
];

describe('Aggregation Service', () => {
  describe('getMonthKey', () => {
    it('should return correct month key for a date string', () => {
      expect(getMonthKey('2026-02-15T12:00:00.000Z')).toBe('2026-02');
    });

    it('should return correct month key for January', () => {
      expect(getMonthKey('2026-01-15T12:00:00.000Z')).toBe('2026-01');
    });

    it('should return correct month key for December', () => {
      expect(getMonthKey('2025-12-15T12:00:00.000Z')).toBe('2025-12');
    });

    it('should handle Date objects', () => {
      const date = new Date(2026, 1, 15, 12, 0, 0); // February 15, 2026
      expect(getMonthKey(date)).toBe('2026-02');
    });
  });

  describe('formatMonthKey', () => {
    it('should format month key to readable format', () => {
      expect(formatMonthKey('2026-02')).toBe('Feb 2026');
    });

    it('should format January correctly', () => {
      expect(formatMonthKey('2026-01')).toBe('Jan 2026');
    });

    it('should format December correctly', () => {
      expect(formatMonthKey('2025-12')).toBe('Dec 2025');
    });

    it('should format all months correctly', () => {
      const months = [
        ['2026-01', 'Jan 2026'],
        ['2026-02', 'Feb 2026'],
        ['2026-03', 'Mar 2026'],
        ['2026-04', 'Apr 2026'],
        ['2026-05', 'May 2026'],
        ['2026-06', 'Jun 2026'],
        ['2026-07', 'Jul 2026'],
        ['2026-08', 'Aug 2026'],
        ['2026-09', 'Sep 2026'],
        ['2026-10', 'Oct 2026'],
        ['2026-11', 'Nov 2026'],
        ['2026-12', 'Dec 2026']
      ];

      months.forEach(([key, expected]) => {
        expect(formatMonthKey(key)).toBe(expected);
      });
    });
  });

  describe('calculateMetrics', () => {
    it('should calculate correct total transactions', () => {
      const metrics = calculateMetrics(mockTransactions);
      expect(metrics.totalTransactions).toBe(6);
    });

    it('should calculate correct approved count', () => {
      const metrics = calculateMetrics(mockTransactions);
      expect(metrics.totalApproved).toBe(3);
    });

    it('should calculate correct declined count', () => {
      const metrics = calculateMetrics(mockTransactions);
      expect(metrics.totalDeclined).toBe(3);
    });

    it('should calculate correct total amount', () => {
      const metrics = calculateMetrics(mockTransactions);
      expect(metrics.totalAmount).toBe(1650.00);
    });

    it('should calculate correct approved amount', () => {
      const metrics = calculateMetrics(mockTransactions);
      expect(metrics.approvedAmount).toBe(550.00);
    });

    it('should calculate correct declined amount', () => {
      const metrics = calculateMetrics(mockTransactions);
      expect(metrics.declinedAmount).toBe(1100.00);
    });

    it('should group by card brand correctly', () => {
      const metrics = calculateMetrics(mockTransactions);
      
      expect(metrics.byCardBrand.Visa.total).toBe(3);
      expect(metrics.byCardBrand.Visa.approved).toBe(2);
      expect(metrics.byCardBrand.Visa.declined).toBe(1);
      
      expect(metrics.byCardBrand.Mastercard.total).toBe(1);
      expect(metrics.byCardBrand.Amex.total).toBe(1);
      expect(metrics.byCardBrand.Discover.total).toBe(1);
    });

    it('should group by decline reason correctly', () => {
      const metrics = calculateMetrics(mockTransactions);
      
      expect(metrics.byDeclineReason['01-Insufficient funds']).toBe(1);
      expect(metrics.byDeclineReason['02-Invalid card number']).toBe(1);
      expect(metrics.byDeclineReason['03-Suspected fraud']).toBe(1);
    });

    it('should handle empty array', () => {
      const metrics = calculateMetrics([]);
      
      expect(metrics.totalTransactions).toBe(0);
      expect(metrics.totalApproved).toBe(0);
      expect(metrics.totalDeclined).toBe(0);
      expect(metrics.totalAmount).toBe(0);
    });
  });

  describe('calculateMTDSummary', () => {
    it('should return current month transactions only', () => {
      // Note: This test depends on the current date
      const mtd = calculateMTDSummary(mockTransactions);
      
      expect(mtd).toHaveProperty('month');
      expect(mtd).toHaveProperty('monthFormatted');
      expect(mtd).toHaveProperty('totalTransactions');
      expect(mtd).toHaveProperty('totalApproved');
      expect(mtd).toHaveProperty('totalDeclined');
    });

    it('should include byCardBrand breakdown', () => {
      const mtd = calculateMTDSummary(mockTransactions);
      expect(mtd).toHaveProperty('byCardBrand');
    });

    it('should include byDeclineReason breakdown', () => {
      const mtd = calculateMTDSummary(mockTransactions);
      expect(mtd).toHaveProperty('byDeclineReason');
    });
  });

  describe('calculateMonthByMonthSummary', () => {
    it('should return array of monthly summaries', () => {
      const monthly = calculateMonthByMonthSummary(mockTransactions);
      expect(Array.isArray(monthly)).toBe(true);
    });

    it('should group transactions by month', () => {
      const monthly = calculateMonthByMonthSummary(mockTransactions);
      expect(monthly.length).toBe(3); // Feb, Jan, Dec
    });

    it('should sort by month descending (most recent first)', () => {
      const monthly = calculateMonthByMonthSummary(mockTransactions);
      
      for (let i = 0; i < monthly.length - 1; i++) {
        expect(monthly[i].month > monthly[i + 1].month).toBe(true);
      }
    });

    it('should calculate correct metrics for each month', () => {
      const monthly = calculateMonthByMonthSummary(mockTransactions);
      
      // Find February 2026
      const feb = monthly.find(m => m.month === '2026-02');
      expect(feb.totalTransactions).toBe(3);
      expect(feb.totalApproved).toBe(2);
      expect(feb.totalDeclined).toBe(1);
      
      // Find January 2026
      const jan = monthly.find(m => m.month === '2026-01');
      expect(jan.totalTransactions).toBe(2);
      expect(jan.totalApproved).toBe(1);
      expect(jan.totalDeclined).toBe(1);
      
      // Find December 2025
      const dec = monthly.find(m => m.month === '2025-12');
      expect(dec.totalTransactions).toBe(1);
      expect(dec.totalApproved).toBe(0);
      expect(dec.totalDeclined).toBe(1);
    });

    it('should include formatted month names', () => {
      const monthly = calculateMonthByMonthSummary(mockTransactions);
      
      expect(monthly.find(m => m.month === '2026-02').monthFormatted).toBe('Feb 2026');
      expect(monthly.find(m => m.month === '2026-01').monthFormatted).toBe('Jan 2026');
      expect(monthly.find(m => m.month === '2025-12').monthFormatted).toBe('Dec 2025');
    });

    it('should handle empty array', () => {
      const monthly = calculateMonthByMonthSummary([]);
      expect(monthly).toEqual([]);
    });
  });
});
