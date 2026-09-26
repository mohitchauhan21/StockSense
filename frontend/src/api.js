const API_BASE = '/api/v1';

async function fetchJSON(url, options = {}) {
  try {
    const res = await fetch(url, {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ detail: 'API Error' }));
      throw new Error(err.detail || `Error ${res.status}`);
    }
    return await res.json();
  } catch (err) {
    console.error(`API Fetch Error [${url}]:`, err);
    throw err;
  }
}

export const api = {
  // Dashboard
  getDashboardKPIs: () => fetchJSON(`${API_BASE}/dashboard/kpis`),
  getLowStockAlerts: () => fetchJSON(`${API_BASE}/dashboard/low-stock`),
  
  // Products
  getProducts: () => fetchJSON(`${API_BASE}/products`),
  createProduct: (data) => fetchJSON(`${API_BASE}/products`, { method: 'POST', body: JSON.stringify(data) }),
  
  // Warehouses
  getWarehouses: () => fetchJSON(`${API_BASE}/warehouses`),
  createWarehouse: (data) => fetchJSON(`${API_BASE}/warehouses`, { method: 'POST', body: JSON.stringify(data) }),
  
  // Receipts
  getReceipts: () => fetchJSON(`${API_BASE}/receipts`),
  createReceipt: (data) => fetchJSON(`${API_BASE}/receipts`, { method: 'POST', body: JSON.stringify(data) }),
  validateReceipt: (id) => fetchJSON(`${API_BASE}/receipts/${id}/validate`, { method: 'POST' }),

  // Deliveries
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
    return fetchJSON(`${API_BASE}/ledger?${query}`);
  },
};
