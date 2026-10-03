// Admin Portal Order Management Logic
const Admin = {
  activeTab: 'online', // 'online', 'offline', 'settings'
  onlineOrders: [],
  offlineOrders: [],
  stats: null,
  onlineFilter: 'all',
  offlineFilter: 'all',
  searchQuery: '',
  selectedOfflineOrderForPay: null,

  async init() {
    // Initial fetch
    await this.refreshAll();
  },

  async refreshAll() {
    await Promise.all([
      this.fetchStats(),
      this.fetchOnlineOrders(),
      this.fetchOfflineOrders(),
      this.loadSettingsForm()
    ]);
  },

  // 1. Fetch & Render Dashboard KPI Stats
  async fetchStats() {
    try {
      const res = await API.getDashboardStats();
      if (res.success && res.data) {
        this.stats = res.data;
        this.renderStats();
      }
    } catch (err) {
      console.error('Error fetching admin stats:', err);
    }
  },

  renderStats() {
    if (!this.stats) return;
    const s = this.stats;

    // 5 KPIs
    const elOnline = document.getElementById('kpi-online-orders');
    const elOffline = document.getElementById('kpi-offline-orders');
    const elPending = document.getElementById('kpi-pending-orders');
    const elCompleted = document.getElementById('kpi-completed-orders');
    const elSales = document.getElementById('kpi-today-sales');

    if (elOnline) elOnline.textContent = s.totalOnlineOrders;
    if (elOffline) elOffline.textContent = s.totalOfflineOrders;
    if (elPending) elPending.textContent = s.pendingOrders;
    if (elCompleted) elCompleted.textContent = s.completedOrders;
    if (elSales) elSales.textContent = Number(s.todaySales || 0).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

    // Badges in tabs
    const bOnline = document.getElementById('admin-online-badge');
    const bOffline = document.getElementById('admin-offline-badge');
    if (bOnline) bOnline.textContent = s.totalOnlineOrders;
    if (bOffline) bOffline.textContent = s.totalOfflineOrders;
  },

  // 2. Tab Navigation
  switchTab(tab) {
    this.activeTab = tab;

    const secOnline = document.getElementById('admin-online-section');
    const secOffline = document.getElementById('admin-offline-section');
    const secSettings = document.getElementById('admin-settings-section');

    const tabOnline = document.getElementById('admin-tab-online');
    const tabOffline = document.getElementById('admin-tab-offline');
    const tabSettings = document.getElementById('admin-tab-settings');

    // Reset styles
    [tabOnline, tabOffline, tabSettings].forEach(btn => {
      btn.className = 'flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold text-slate-400 hover:text-white transition-all';
    });

    secOnline.classList.add('hidden');
    secOffline.classList.add('hidden');
    secSettings.classList.add('hidden');

    if (tab === 'online') {
      secOnline.classList.remove('hidden');
      tabOnline.className = 'flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all bg-amber-500 text-slate-950 shadow-sm';
    } else if (tab === 'offline') {
      secOffline.classList.remove('hidden');
      tabOffline.className = 'flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all bg-indigo-500 text-white shadow-sm';
    } else if (tab === 'settings') {
      secSettings.classList.remove('hidden');
      tabSettings.className = 'flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all bg-slate-700 text-white shadow-sm';
      this.loadSettingsForm();
    }
  },

  // 3. ONLINE ORDERS MANAGEMENT
  async fetchOnlineOrders() {
    try {
      const res = await API.getOnlineOrders();
      if (res.success && res.data) {
        this.onlineOrders = res.data;
        this.renderOnlineTable();
      }
    } catch (err) {
      console.error('Error fetching online orders:', err);
    }
  },

  setOnlineFilter(status) {
    this.onlineFilter = status;
    document.querySelectorAll('.admin-of-pill').forEach(btn => {
      if (btn.dataset.status === status) {
        btn.className = 'admin-of-pill active px-3 py-1.5 rounded-lg bg-amber-500 text-slate-950 font-bold';
      } else {
        btn.className = 'admin-of-pill px-3 py-1.5 rounded-lg bg-slate-800 text-slate-300 hover:bg-slate-700';
      }
    });
    this.renderOnlineTable();
  },

  renderOnlineTable() {
    const tbody = document.getElementById('admin-online-table-body');
    const empty = document.getElementById('admin-online-empty');
    if (!tbody) return;

    let orders = this.onlineOrders.filter(order => {
      if (this.onlineFilter !== 'all' && order.deliveryStatus !== this.onlineFilter) return false;
      if (this.searchQuery) {
        const q = this.searchQuery;
        const matchId = order.id.toLowerCase().includes(q);
        const matchName = (order.customerName || '').toLowerCase().includes(q);
        const matchPhone = (order.customerPhone || '').includes(q);
        if (!matchId && !matchName && !matchPhone) return false;
      }
      return true;
    });

    if (orders.length === 0) {
      tbody.innerHTML = '';
      empty.classList.remove('hidden');
      return;
    }

    empty.classList.add('hidden');

    tbody.innerHTML = orders.map(order => {
      const statusColors = {
        'Order Placed': 'bg-amber-500/10 text-amber-400 border border-amber-500/30',
        'Preparing': 'bg-blue-500/10 text-blue-400 border border-blue-500/30',
        'Out for Delivery': 'bg-purple-500/10 text-purple-400 border border-purple-500/30',
        'Delivered': 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30',
        'Cancelled': 'bg-rose-500/10 text-rose-400 border border-rose-500/30'
      };

      const payColors = order.paymentStatus === 'Paid'
        ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
        : 'bg-amber-500/20 text-amber-300 border border-amber-500/30';

      const itemsSummary = (order.items || []).map(i => `${i.name} (×${i.quantity})`).join(', ');

      // Next status action button
      let nextStatusBtn = '';
      if (order.deliveryStatus === 'Order Placed') {
        nextStatusBtn = `
          <button onclick="Admin.advanceOnlineStatus('${order.id}', 'Preparing')" class="px-2.5 py-1 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-semibold text-[11px] shadow-xs">
            Start Preparing
          </button>
        `;
      } else if (order.deliveryStatus === 'Preparing') {
        nextStatusBtn = `
          <button onclick="Admin.advanceOnlineStatus('${order.id}', 'Out for Delivery')" class="px-2.5 py-1 rounded-lg bg-purple-600 hover:bg-purple-500 text-white font-semibold text-[11px] shadow-xs">
            Dispatch Rider
          </button>
        `;
      } else if (order.deliveryStatus === 'Out for Delivery') {
        nextStatusBtn = `
          <button onclick="Admin.advanceOnlineStatus('${order.id}', 'Delivered')" class="px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-[11px] shadow-xs">
            Mark Delivered
          </button>
        `;
      }

      return `
        <tr class="hover:bg-slate-900/60 transition-colors">
          <!-- Order ID & Time -->
          <td class="py-3 px-4">
            <span class="font-mono font-bold text-amber-400 text-xs block">${order.id}</span>
            <span class="text-[10px] text-slate-400">
              ${new Date(order.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </span>
          </td>

          <!-- Customer Details -->
          <td class="py-3 px-4">
            <span class="font-bold text-slate-200 block">${order.customerName}</span>
            <span class="text-[11px] text-slate-400 flex items-center gap-1 mt-0.5">
              <i class="fa-solid fa-phone text-[9px] text-slate-500"></i> ${order.customerPhone}
            </span>
          </td>

          <!-- Delivery Address -->
          <td class="py-3 px-4 max-w-xs">
            <p class="text-[11px] text-slate-300 line-clamp-2 leading-relaxed" title="${order.deliveryAddress}">
              ${order.deliveryAddress}
            </p>
            ${order.specialInstructions ? `
              <span class="text-[10px] text-amber-300 italic block mt-0.5">Note: ${order.specialInstructions}</span>
            ` : ''}
          </td>

          <!-- Ordered Items -->
          <td class="py-3 px-4 max-w-xs">
            <p class="text-[11px] text-slate-300 line-clamp-2" title="${itemsSummary}">
              ${itemsSummary || 'No items'}
            </p>
            <span class="text-[10px] text-slate-500">(${order.items ? order.items.length : 0} items)</span>
          </td>

          <!-- Bill Amount -->
          <td class="py-3 px-4 whitespace-nowrap">
            <span class="font-bold text-slate-100 text-xs block">₹${(order.grandTotal || 0).toFixed(2)}</span>
            <span class="text-[10px] text-slate-400">
              ${order.deliveryCharge === 0 ? 'Free Delivery' : `Del: ₹${order.deliveryCharge}`}
            </span>
          </td>

          <!-- Payment -->
          <td class="py-3 px-4 whitespace-nowrap">
            <span class="text-[11px] text-slate-300 block font-medium">${order.paymentMethod}</span>
            <button onclick="Admin.toggleOnlinePaymentStatus('${order.id}')" 
              title="Click to toggle payment status"
              class="mt-1 px-2 py-0.5 rounded-full text-[10px] font-bold ${payColors} hover:opacity-80 transition-opacity">
              ${order.paymentStatus}
            </button>
          </td>

          <!-- Delivery Status -->
          <td class="py-3 px-4 whitespace-nowrap">
            <span class="px-2.5 py-1 rounded-full text-[11px] font-bold ${statusColors[order.deliveryStatus] || 'bg-slate-800 text-slate-300'}">
              ${order.deliveryStatus}
            </span>
          </td>

          <!-- Actions -->
          <td class="py-3 px-4 text-right whitespace-nowrap">
            <div class="flex items-center justify-end gap-1.5">
              ${nextStatusBtn}
              
              <!-- Direct status dropdown menu -->
              <select onchange="Admin.advanceOnlineStatus('${order.id}', this.value)" 
                class="bg-slate-900 border border-slate-700 text-slate-300 rounded-lg text-[10px] py-1 px-1.5 focus:outline-none">
                <option value="" disabled selected>Status</option>
                <option value="Order Placed">Order Placed</option>
                <option value="Preparing">Preparing</option>
                <option value="Out for Delivery">Out for Delivery</option>
                <option value="Delivered">Delivered</option>
                <option value="Cancelled">Cancelled</option>
              </select>

              <!-- Track/Preview button -->
              <button onclick="App.openTrackModal(); App.renderOnlineTracking(${JSON.stringify(order).replace(/"/g, '&quot;')})" 
                title="View customer tracker"
                class="w-7 h-7 rounded-lg bg-slate-800 hover:bg-slate-700 flex items-center justify-center text-slate-300 text-xs">
                <i class="fa-solid fa-eye"></i>
              </button>
            </div>
          </td>
        </tr>
      `;
    }).join('');
  },

  async advanceOnlineStatus(orderId, newStatus) {
    try {
      const res = await API.updateOnlineOrderStatus(orderId, newStatus);
      if (res.success) {
        App.showToast(`Order ${orderId} marked as "${newStatus}"`, '🛵');
        await this.refreshAll();
      }
    } catch (err) {
      console.error('Error updating status:', err);
    }
  },

  async toggleOnlinePaymentStatus(orderId) {
    const order = this.onlineOrders.find(o => o.id === orderId);
    if (!order) return;

    const newPaymentStatus = order.paymentStatus === 'Paid' ? 'Pending' : 'Paid';
    try {
      const res = await API.updateOnlineOrderStatus(orderId, order.deliveryStatus, newPaymentStatus);
      if (res.success) {
        App.showToast(`Order ${orderId} payment marked as "${newPaymentStatus}"`, '💳');
        await this.refreshAll();
      }
    } catch (err) {
      console.error('Error updating payment status:', err);
    }
  },

  // 4. OFFLINE / HOTEL DIRECT ORDERS MANAGEMENT
  async fetchOfflineOrders() {
    try {
      const res = await API.getOfflineOrders();
      if (res.success && res.data) {
        this.offlineOrders = res.data;
        this.renderOfflineTable();
      }
    } catch (err) {
      console.error('Error fetching offline orders:', err);
    }
  },

  setOfflineFilter(status) {
    this.offlineFilter = status;
    document.querySelectorAll('.admin-off-pill').forEach(btn => {
      if (btn.dataset.status === status) {
        btn.className = 'admin-off-pill active px-3 py-1.5 rounded-lg bg-indigo-500 text-white font-bold';
      } else {
        btn.className = 'admin-off-pill px-3 py-1.5 rounded-lg bg-slate-800 text-slate-300 hover:bg-slate-700';
      }
    });
    this.renderOfflineTable();
  },

  renderOfflineTable() {
    const tbody = document.getElementById('admin-offline-table-body');
    const empty = document.getElementById('admin-offline-empty');
    if (!tbody) return;

    let orders = this.offlineOrders.filter(token => {
      if (this.offlineFilter !== 'all' && token.status !== this.offlineFilter) return false;
      if (this.searchQuery) {
        const q = this.searchQuery;
        const matchId = token.id.toLowerCase().includes(q);
        const matchName = (token.customerName || '').toLowerCase().includes(q);
        const matchPhone = (token.customerPhone || '').includes(q);
        if (!matchId && !matchName && !matchPhone) return false;
      }
      return true;
    });

    if (orders.length === 0) {
      tbody.innerHTML = '';
      empty.classList.remove('hidden');
      return;
    }

    empty.classList.add('hidden');

    tbody.innerHTML = orders.map(token => {
      const statusColors = {
        'Token Issued': 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/30',
        'Order Taken': 'bg-blue-500/10 text-blue-400 border border-blue-500/30',
        'Preparing': 'bg-amber-500/10 text-amber-400 border border-amber-500/30',
        'Ready for Pickup': 'bg-purple-500/10 text-purple-400 border border-purple-500/30',
        'Completed': 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30',
        'Cancelled': 'bg-rose-500/10 text-rose-400 border border-rose-500/30'
      };

      const payColors = token.paymentStatus === 'Paid'
        ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
        : 'bg-amber-500/20 text-amber-300 border border-amber-500/30';

      const itemsSummary = token.items && token.items.length > 0
        ? token.items.map(i => `${i.name} (×${i.quantity})`).join(', ')
        : 'Walk-in Counter Order (No pre-select)';

      // Action buttons based on status
      let nextStatusBtn = '';
      if (token.status === 'Token Issued') {
        nextStatusBtn = `
          <button onclick="Admin.advanceOfflineStatus('${token.id}', 'Preparing')" class="px-2.5 py-1 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-semibold text-[11px] shadow-xs">
            Start Prep
          </button>
        `;
      } else if (token.status === 'Preparing') {
        nextStatusBtn = `
          <button onclick="Admin.advanceOfflineStatus('${token.id}', 'Ready for Pickup')" class="px-2.5 py-1 rounded-lg bg-purple-600 hover:bg-purple-500 text-white font-semibold text-[11px] shadow-xs">
            Ready for Pickup
          </button>
        `;
      } else if (token.status === 'Ready for Pickup') {
        nextStatusBtn = `
          <button onclick="Admin.advanceOfflineStatus('${token.id}', 'Completed')" class="px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-[11px] shadow-xs">
            Complete
          </button>
        `;
      }

      return `
        <tr class="hover:bg-slate-900/60 transition-colors">
          <!-- Token # & Time -->
          <td class="py-3 px-4">
            <span class="font-mono font-bold text-indigo-400 text-sm block">${token.id}</span>
            <span class="text-[10px] text-slate-400">
              ${new Date(token.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </span>
          </td>

          <!-- Customer Details -->
          <td class="py-3 px-4">
            <span class="font-bold text-slate-200 block">${token.customerName}</span>
            <span class="text-[11px] text-slate-400 flex items-center gap-1 mt-0.5">
              <i class="fa-solid fa-phone text-[9px] text-slate-500"></i> ${token.customerPhone}
            </span>
          </td>

          <!-- Visit Type & Arrival -->
          <td class="py-3 px-4 whitespace-nowrap">
            <span class="px-2 py-0.5 rounded text-[10px] font-bold ${token.visitType === 'Dine-in' ? 'bg-amber-500/20 text-amber-300' : 'bg-cyan-500/20 text-cyan-300'}">
              ${token.visitType || 'Takeaway'}
            </span>
            <span class="text-[11px] text-slate-400 block mt-1">
              <i class="fa-solid fa-clock text-[10px] text-slate-500"></i> ${token.visitTiming || 'Visiting Now'}
            </span>
          </td>

          <!-- Pre-selected Items -->
          <td class="py-3 px-4 max-w-xs">
            <p class="text-[11px] text-slate-300 line-clamp-2" title="${itemsSummary}">
              ${itemsSummary}
            </p>
            <span class="text-[10px] text-slate-500">(${token.items ? token.items.length : 0} items)</span>
          </td>

          <!-- Estimated Total -->
          <td class="py-3 px-4 whitespace-nowrap">
            <span class="font-bold text-slate-100 text-xs block">₹${(token.grandTotal || 0).toFixed(2)}</span>
            <span class="text-[10px] text-slate-400">${token.grandTotal > 0 ? 'Pre-estimated' : 'At counter'}</span>
          </td>

          <!-- Hotel Payment Method (Cash, UPI, Card) -->
          <td class="py-3 px-4 whitespace-nowrap">
            <div class="flex items-center gap-1.5">
              <span class="text-[11px] text-slate-200 font-medium">${token.paymentMethod || 'At Counter'}</span>
            </div>
            <div class="mt-1 flex items-center gap-2">
              <span class="px-2 py-0.5 rounded-full text-[10px] font-bold ${payColors}">
                ${token.paymentStatus === 'Paid' ? 'Paid at Hotel' : 'Pending'}
              </span>
              <button onclick="Admin.openPaymentModal('${token.id}')" 
                class="text-[10px] text-emerald-400 hover:text-emerald-300 underline font-semibold">
                ${token.paymentStatus === 'Paid' ? 'Change' : 'Collect Pay'}
              </button>
            </div>
          </td>

          <!-- Order / Pickup Status -->
          <td class="py-3 px-4 whitespace-nowrap">
            <span class="px-2.5 py-1 rounded-full text-[11px] font-bold ${statusColors[token.status] || 'bg-slate-800 text-slate-300'}">
              ${token.status}
            </span>
          </td>

          <!-- Actions -->
          <td class="py-3 px-4 text-right whitespace-nowrap">
            <div class="flex items-center justify-end gap-1.5">
              ${nextStatusBtn}

              <!-- Direct status dropdown menu -->
              <select onchange="Admin.advanceOfflineStatus('${token.id}', this.value)" 
                class="bg-slate-900 border border-slate-700 text-slate-300 rounded-lg text-[10px] py-1 px-1.5 focus:outline-none">
                <option value="" disabled selected>Status</option>
                <option value="Token Issued">Token Issued</option>
                <option value="Preparing">Preparing</option>
                <option value="Ready for Pickup">Ready for Pickup</option>
                <option value="Completed">Completed</option>
                <option value="Cancelled">Cancelled</option>
              </select>

              <!-- Track/Preview button -->
              <button onclick="App.openTrackModal(); App.renderOfflineTracking(${JSON.stringify(token).replace(/"/g, '&quot;')})" 
                title="View customer token view"
                class="w-7 h-7 rounded-lg bg-slate-800 hover:bg-slate-700 flex items-center justify-center text-slate-300 text-xs">
                <i class="fa-solid fa-eye"></i>
              </button>
            </div>
          </td>
        </tr>
      `;
    }).join('');
  },

  async advanceOfflineStatus(tokenId, newStatus) {
    try {
      const res = await API.updateOfflineOrderStatus(tokenId, newStatus);
      if (res.success) {
        App.showToast(`Token ${tokenId} updated to "${newStatus}"`, '🏬');
        await this.refreshAll();
      }
    } catch (err) {
      console.error('Error updating offline order:', err);
    }
  },

  // Collect Payment Modal (Cash / UPI / Card)
  openPaymentModal(tokenId) {
    this.selectedOfflineOrderForPay = tokenId;
    const token = this.offlineOrders.find(t => t.id === tokenId);
    const modal = document.getElementById('modal-admin-payment');
    const desc = document.getElementById('modal-pay-desc');

    if (token && desc) {
      desc.innerHTML = `Token: <strong class="text-amber-400 font-mono">${token.id}</strong> (${token.customerName})<br>Amount: <strong>₹${(token.grandTotal || 0).toFixed(2)}</strong>`;
    }

    // Default selection
    this.selectedMethod = 'Cash';
    document.querySelectorAll('.pay-opt-btn').forEach(btn => {
      if (btn.dataset.method === 'Cash') {
        btn.classList.add('border-emerald-500', 'bg-emerald-950/40');
      } else {
        btn.classList.remove('border-emerald-500', 'bg-emerald-950/40');
      }
    });

    modal.classList.remove('hidden');
  },

  closePaymentModal() {
    document.getElementById('modal-admin-payment').classList.add('hidden');
    this.selectedOfflineOrderForPay = null;
  },

  selectPaymentMethodOption(method) {
    this.selectedMethod = method;
    document.querySelectorAll('.pay-opt-btn').forEach(btn => {
      if (btn.dataset.method === method) {
        btn.classList.add('border-emerald-500', 'bg-emerald-950/40');
      } else {
        btn.classList.remove('border-emerald-500', 'bg-emerald-950/40');
      }
    });
  },

  async confirmPaymentCollection() {
    if (!this.selectedOfflineOrderForPay) return;
    const tokenId = this.selectedOfflineOrderForPay;
    const method = this.selectedMethod || 'Cash';

    try {
      const token = this.offlineOrders.find(t => t.id === tokenId);
      const res = await API.updateOfflineOrderStatus(tokenId, token ? token.status : undefined, 'Paid', method);
      if (res.success) {
        this.closePaymentModal();
        App.showToast(`Recorded ${method} payment for ${tokenId}!`, '💰');
        await this.refreshAll();
      }
    } catch (err) {
      console.error('Error recording payment:', err);
    }
  },

  // 5. Global Search in Admin
  handleSearch() {
    const input = document.getElementById('admin-search-input');
    this.searchQuery = input ? input.value.trim().toLowerCase() : '';
    this.renderOnlineTable();
    this.renderOfflineTable();
  },

  // 6. Hotel Settings & Add Dish Form
  async loadSettingsForm() {
    if (!App.hotelInfo) await App.fetchHotelInfo();
    const h = App.hotelInfo;
    if (!h) return;

    const elName = document.getElementById('cfg-hotel-name');
    const elAddr = document.getElementById('cfg-hotel-address');
    const elTimings = document.getElementById('cfg-hotel-timings');
    const elPhone = document.getElementById('cfg-hotel-phone');
    const elDel = document.getElementById('cfg-del-charge');
    const elFree = document.getElementById('cfg-free-thresh');
    const elEst = document.getElementById('cfg-est-time');

    if (elName) elName.value = h.name || '';
    if (elAddr) elAddr.value = h.address || '';
    if (elTimings) elTimings.value = h.timings || '';
    if (elPhone) elPhone.value = h.phone || '';
    if (elDel) elDel.value = h.deliveryCharge || 40;
    if (elFree) elFree.value = h.freeDeliveryThreshold || 500;
    if (elEst) elEst.value = h.estimatedDeliveryMins || 35;
  },

  async saveHotelSettings(event) {
    event.preventDefault();
    const payload = {
      name: document.getElementById('cfg-hotel-name').value.trim(),
      address: document.getElementById('cfg-hotel-address').value.trim(),
      timings: document.getElementById('cfg-hotel-timings').value.trim(),
      phone: document.getElementById('cfg-hotel-phone').value.trim(),
      deliveryCharge: Number(document.getElementById('cfg-del-charge').value),
      freeDeliveryThreshold: Number(document.getElementById('cfg-free-thresh').value),
      estimatedDeliveryMins: Number(document.getElementById('cfg-est-time').value)
    };

    try {
      const res = await API.updateHotelInfo(payload);
      if (res.success && res.data) {
        App.hotelInfo = res.data;
        App.renderHotelInfo();
        App.showToast('Hotel details updated successfully!', '🏨');
      }
    } catch (err) {
      console.error('Error saving hotel settings:', err);
    }
  },

  async addNewDish(event) {
    event.preventDefault();
    const name = document.getElementById('new-dish-name').value.trim();
    const category = document.getElementById('new-dish-category').value;
    const price = Number(document.getElementById('new-dish-price').value);
    const prepTime = document.getElementById('new-dish-prep').value.trim() || '15 mins';
    const isVeg = document.getElementById('new-dish-veg').checked;
    const description = document.getElementById('new-dish-desc').value.trim();
    const image = document.getElementById('new-dish-image').value.trim();

    if (!name || isNaN(price)) {
      alert('Please provide valid dish name and price.');
      return;
    }

    try {
      const res = await API.addMenuItem({
        name,
        category,
        price,
        prepTime,
        isVeg,
        description,
        image
      });

      if (res.success) {
        document.getElementById('add-dish-form').reset();
        await App.fetchMenu();
        App.showToast(`Added "${name}" to hotel menu!`, '🍽️');
      }
    } catch (err) {
      console.error('Error adding dish:', err);
    }
  }
};
