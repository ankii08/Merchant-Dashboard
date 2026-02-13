/**
 * Integration Tests for Transaction API
 */

const request = require('supertest');
const app = require('../src/app');
const { setTransactions } = require('../src/data/dataStore');

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
  }
];

describe('Transaction API Integration Tests', () => {
  beforeAll(() => {
    // Set up mock data before tests
    setTransactions(mockTransactions);
  });

  describe('GET /api/health', () => {
    it('should return health status', async () => {
      const response = await request(app).get('/api/health');
      
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('status', 'ok');
      expect(response.body).toHaveProperty('timestamp');
    });
  });

  describe('GET /api/transactions', () => {
    it('should return all transactions', async () => {
      const response = await request(app).get('/api/transactions');
      
      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.count).toBe(5);
      expect(response.body.data).toHaveLength(5);
    });

    it('should filter by cardBrand', async () => {
      const response = await request(app)
        .get('/api/transactions')
        .query({ cardBrand: 'Visa' });
      
      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.count).toBe(2);
      expect(response.body.data.every(t => t.cardBrand === 'Visa')).toBe(true);
    });

    it('should filter by status', async () => {
      const response = await request(app)
        .get('/api/transactions')
        .query({ status: 'Declined' });
      
      expect(response.status).toBe(200);
      expect(response.body.count).toBe(2);
      expect(response.body.data.every(t => t.status === 'Declined')).toBe(true);
    });

    it('should filter by declineReasonCode', async () => {
      const response = await request(app)
        .get('/api/transactions')
        .query({ declineReasonCode: '01-Insufficient funds' });
      
      expect(response.status).toBe(200);
      expect(response.body.count).toBe(1);
      expect(response.body.data[0].declineReasonCode).toBe('01-Insufficient funds');
    });

    it('should apply multiple filters', async () => {
      const response = await request(app)
        .get('/api/transactions')
        .query({ 
          cardBrand: 'Mastercard',
          status: 'Declined'
        });
      
      expect(response.status).toBe(200);
      expect(response.body.count).toBe(1);
      expect(response.body.data[0].cardBrand).toBe('Mastercard');
      expect(response.body.data[0].status).toBe('Declined');
    });
  });

  describe('GET /api/transactions/summary', () => {
    it('should return MTD and monthly summaries', async () => {
      const response = await request(app).get('/api/transactions/summary');
      
      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body).toHaveProperty('mtdSummary');
      expect(response.body).toHaveProperty('monthByMonth');
      expect(response.body).toHaveProperty('filters');
    });

    it('should return filtered summaries', async () => {
      const response = await request(app)
        .get('/api/transactions/summary')
        .query({ cardBrand: 'Visa' });
      
      expect(response.status).toBe(200);
      expect(response.body.filters.cardBrand).toBe('Visa');
    });
  });

  describe('GET /api/transactions/mtd', () => {
    it('should return MTD summary', async () => {
      const response = await request(app).get('/api/transactions/mtd');
      
      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('totalTransactions');
      expect(response.body.data).toHaveProperty('totalApproved');
      expect(response.body.data).toHaveProperty('totalDeclined');
      expect(response.body.data).toHaveProperty('byCardBrand');
      expect(response.body.data).toHaveProperty('byDeclineReason');
    });
  });

  describe('GET /api/transactions/monthly', () => {
    it('should return monthly summaries', async () => {
      const response = await request(app).get('/api/transactions/monthly');
      
      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(Array.isArray(response.body.data)).toBe(true);
    });
  });

  describe('GET /api/transactions/filters', () => {
    it('should return available filter options', async () => {
      const response = await request(app).get('/api/transactions/filters');
      
      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.cardBrands).toContain('Visa');
      expect(response.body.data.cardBrands).toContain('Mastercard');
      expect(response.body.data.cardBrands).toContain('Amex');
      expect(response.body.data.cardBrands).toContain('Discover');
      expect(response.body.data.statuses).toContain('Approved');
      expect(response.body.data.statuses).toContain('Declined');
      expect(response.body.data.declineReasonCodes).toHaveLength(3);
    });
  });

  describe('404 Handler', () => {
    it('should return 404 for non-existent endpoints', async () => {
      const response = await request(app).get('/api/nonexistent');
      
      expect(response.status).toBe(404);
      expect(response.body.success).toBe(false);
      expect(response.body.error).toBe('Endpoint not found');
    });
  });
});
