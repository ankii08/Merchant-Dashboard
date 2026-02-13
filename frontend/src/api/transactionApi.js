/**
 * Transaction API Client
 * 
 * HTTP client for the backend REST API.
 * Uses relative URLs that are proxied to localhost:3001 by Vite.
 * All functions return parsed JSON and throw on HTTP errors.
 */

const API_BASE_URL = '/api';

/**
 * Fetches MTD and monthly summaries with optional filters.
 * Called whenever filters change in the UI to refresh dashboard data.
 * 
 * @param {Object} filters - { cardBrand, status, declineReasonCode }
 * @returns {Promise<Object>} { success, mtdSummary, monthByMonth }
 */
export async function fetchSummary(filters = {}) {
  // Build query string, excluding 'all' values (they mean "no filter")
  const params = new URLSearchParams();
  
  if (filters.cardBrand && filters.cardBrand !== 'all') {
    params.append('cardBrand', filters.cardBrand);
  }
  if (filters.status && filters.status !== 'all') {
    params.append('status', filters.status);
  }
  if (filters.declineReasonCode && filters.declineReasonCode !== 'all') {
    params.append('declineReasonCode', filters.declineReasonCode);
  }
  
  const queryString = params.toString();
  const url = `${API_BASE_URL}/transactions/summary${queryString ? `?${queryString}` : ''}`;
  
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error('Failed to fetch summary');
  }
  return response.json();
}

/**
 * Fetches raw transaction records with optional filters.
 * Not currently used in the UI but available for future features
 * like a detailed transaction table view.
 * 
 * @param {Object} filters - { cardBrand, status, declineReasonCode }
 * @returns {Promise<Object>} { success, count, data: Transaction[] }
 */
export async function fetchTransactions(filters = {}) {
  const params = new URLSearchParams();
  
  if (filters.cardBrand && filters.cardBrand !== 'all') {
    params.append('cardBrand', filters.cardBrand);
  }
  if (filters.status && filters.status !== 'all') {
    params.append('status', filters.status);
  }
  if (filters.declineReasonCode && filters.declineReasonCode !== 'all') {
    params.append('declineReasonCode', filters.declineReasonCode);
  }
  
  const queryString = params.toString();
  const url = `${API_BASE_URL}/transactions${queryString ? `?${queryString}` : ''}`;
  
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error('Failed to fetch transactions');
  }
  return response.json();
}

/**
 * Fetches available filter options from the backend.
 * Called once on app mount to populate filter dropdowns.
 * 
 * @returns {Promise<Object>} { success, data: { cardBrands, statuses, declineReasonCodes } }
 */
export async function fetchFilterOptions() {
  const response = await fetch(`${API_BASE_URL}/transactions/filters`);
  if (!response.ok) {
    throw new Error('Failed to fetch filter options');
  }
  return response.json();
}
