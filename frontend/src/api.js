const API_BASE = '/api/v1';

let authToken = localStorage.getItem('stocksense_token') || '';

export function setAuthToken(token) {
  authToken = token;
  if (token) {
    localStorage.setItem('stocksense_token', token);
  } else {
    localStorage.removeItem('stocksense_token');
  }
}

export function getAuthToken() {
  return authToken;
}

// Auto Demo Login Helper to get a manager token if missing
async function ensureAuthToken() {
  if (authToken) return authToken;
  try {
    const res = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'admin@stocksense.io', password: 'Password123' })
    });
    if (res.ok) {
      const data = await res.json();
      if (data.access_token) {
        setAuthToken(data.access_token);
        return data.access_token;
      }
    }
    // If login failed, try signup default admin
    const signupRes = await fetch(`${API_BASE}/auth/signup`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: 'System Admin', email: 'admin@stocksense.io', password: 'Password123', role: 'manager' })
    });
    if (signupRes.ok || signupRes.status === 409) {
      const retryLogin = await fetch(`${API_BASE}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: 'admin@stocksense.io', password: 'Password123' })
      });
      if (retryLogin.ok) {
        const data = await retryLogin.json();
        setAuthToken(data.access_token);
        return data.access_token;
      }
    }
  } catch (err) {
    console.warn('Auto-auth notice:', err);
  }
  return '';
}

async function fetchJSON(url, options = {}) {
  await ensureAuthToken();
  const headers = {
    'Content-Type': 'application/json',
    ...(authToken ? { 'Authorization': `Bearer ${authToken}` } : {}),
    ...options.headers,
  };

  try {
    const res = await fetch(url, { ...options, headers });
    if (!res.ok) {
      const errData = await res.json().catch(() => ({}));
      let msg = '';
      if (errData.message) {
        msg = errData.message;
      } else if (typeof errData.detail === 'string') {
        msg = errData.detail;
      } else if (Array.isArray(errData.detail)) {
        msg = errData.detail.map((e) => e.msg || e.message).join(', ');
      } else if (errData.errors) {
        msg = typeof errData.errors === 'string' ? errData.errors : JSON.stringify(errData.errors);
      } else {
        msg = `HTTP Error ${res.status}`;
      }
      throw new Error(msg);
    }
    return await res.json();
  } catch (err) {
    console.error(`API Error [${url}]:`, err.message);
    throw err;
  }
}

export const api = {
  // Auth
  login: async (email, password) => {
    const data = await fetchJSON(`${API_BASE}/auth/login`, {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
    if (data.access_token) setAuthToken(data.access_token);
    return data;
  },
  signup: async (userData) => {
    return fetchJSON(`${API_BASE}/auth/signup`, {
      method: 'POST',
      body: JSON.stringify(userData),
    });
  },

  // Dashboard
  getDashboardKPIs: () => fetchJSON(`${API_BASE}/dashboard/kpis`),
  getLowStockAlerts: () => fetchJSON(`${API_BASE}/dashboard/low-stock`),
  
  // Products
  getProducts: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return fetchJSON(`${API_BASE}/products?${query}`).then(res => res.items || res);
  },
  createProduct: (data) => fetchJSON(`${API_BASE}/products`, { method: 'POST', body: JSON.stringify(data) }),
  
  // Warehouses & Locations
  getWarehouses: () => fetchJSON(`${API_BASE}/warehouses`),
  createWarehouse: (data) => fetchJSON(`${API_BASE}/warehouses`, { method: 'POST', body: JSON.stringify(data) }),
  getLocations: (warehouseId) => fetchJSON(`${API_BASE}/warehouses/${warehouseId}/locations`),
  createLocation: (data) => fetchJSON(`${API_BASE}/locations`, { method: 'POST', body: JSON.stringify(data) }),

  // Categories
  getCategories: () => fetchJSON(`${API_BASE}/categories`),
  createCategory: (data) => fetchJSON(`${API_BASE}/categories`, { method: 'POST', body: JSON.stringify(data) }),

  // Receipts (GRN)
  getReceipts: () => fetchJSON(`${API_BASE}/receipts`),
  createReceipt: (data) => fetchJSON(`${API_BASE}/receipts`, { method: 'POST', body: JSON.stringify(data) }),
  validateReceipt: (id) => fetchJSON(`${API_BASE}/receipts/${id}/validate`, { method: 'POST' }),

  // Deliveries (Sales Out)
  getDeliveries: () => fetchJSON(`${API_BASE}/deliveries`),
  createDelivery: (data) => fetchJSON(`${API_BASE}/deliveries`, { method: 'POST', body: JSON.stringify(data) }),
  validateDelivery: (id) => fetchJSON(`${API_BASE}/deliveries/${id}/validate`, { method: 'POST' }),

  // Transfers
  getTransfers: () => fetchJSON(`${API_BASE}/transfers`),
  createTransfer: (data) => fetchJSON(`${API_BASE}/transfers`, { method: 'POST', body: JSON.stringify(data) }),
  validateTransfer: (id) => fetchJSON(`${API_BASE}/transfers/${id}/validate`, { method: 'POST' }),

  // Adjustments
  getAdjustments: () => fetchJSON(`${API_BASE}/adjustments`),
  createAdjustment: (data) => fetchJSON(`${API_BASE}/adjustments`, { method: 'POST', body: JSON.stringify(data) }),
  validateAdjustment: (id) => fetchJSON(`${API_BASE}/adjustments/${id}/validate`, { method: 'POST' }),

  // Ledger / Moves
  getLedgerMoves: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return fetchJSON(`${API_BASE}/ledger?${query}`).then(res => res.items || res);
  },
};
