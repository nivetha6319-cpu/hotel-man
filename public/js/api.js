// API Client for Indian Food Hotel Management System
const API = {
  // Hotel Info & Live Opening/Closing Status
  async getHotelInfo() {
    const res = await fetch('/api/hotel');
    return res.json();
  },
  async getHotelStatus() {
    const res = await fetch('/api/hotel/status');
    return res.json();
  },
  async updateHotelInfo(data) {
    const res = await fetch('/api/hotel', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    return res.json();
  },

  // Foods JSON Database
  async getFoods() {
    const res = await fetch('/api/foods');
    return res.json();
  },
  async getMenu() {
    const res = await fetch('/api/menu');
    return res.json();
  },
  async addMenuItem(data) {
    const res = await fetch('/api/menu', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    return res.json();
  },
  async updateMenuItem(id, data) {
    const res = await fetch(`/api/menu/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    return res.json();
  },
  async deleteMenuItem(id) {
    const res = await fetch(`/api/menu/${id}`, {
      method: 'DELETE'
    });
    return res.json();
  },

  // Photo Search AI / Recognition
  async searchByPhoto(data) {
    const res = await fetch('/api/search/photo', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    return res.json();
  },

  // Customers
  async getCustomers() {
    const res = await fetch('/api/customers');
    return res.json();
  },

  // Bills JSON Database
  async getBills() {
    const res = await fetch('/api/bills');
    return res.json();
  },
  async getBill(id) {
    const res = await fetch(`/api/bills/${encodeURIComponent(id)}`);
    return res.json();
  },

  // Online Orders
  async getOnlineOrders() {
    const res = await fetch('/api/orders/online');
    return res.json();
  },
  async getOnlineOrder(id) {
    const res = await fetch(`/api/orders/online/${encodeURIComponent(id)}`);
    return res.json();
  },
  async createOnlineOrder(data) {
    const res = await fetch('/api/orders/online', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    return res.json();
  },
  async updateOnlineOrderStatus(id, status, paymentStatus) {
    const res = await fetch(`/api/orders/online/${encodeURIComponent(id)}/status`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status, paymentStatus })
    });
    return res.json();
  },

  // Offline Orders / Hotel Direct Tokens
  async getOfflineOrders() {
    const res = await fetch('/api/orders/offline');
    return res.json();
  },
  async getOfflineOrder(id) {
    const res = await fetch(`/api/orders/offline/${encodeURIComponent(id)}`);
    return res.json();
  },
  async createOfflineOrder(data) {
    const res = await fetch('/api/orders/offline', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    return res.json();
  },
  async updateOfflineOrderStatus(id, status, paymentStatus, paymentMethod) {
    const res = await fetch(`/api/orders/offline/${encodeURIComponent(id)}/status`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status, paymentStatus, paymentMethod })
    });
    return res.json();
  },

  // Admin Dashboard Stats
  async getDashboardStats() {
    const res = await fetch('/api/admin/dashboard');
    return res.json();
  },

  // Universal Tracking (both ORD-... and TKN-...)
  async track(code) {
    const res = await fetch(`/api/track/${encodeURIComponent(code)}`);
    return res.json();
  }
};
