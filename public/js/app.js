// Customer Portal Application Logic
const App = {
  currentMode: 'online', // 'online' or 'offline'
  currentPortal: 'customer', // 'customer' or 'admin'
  hotelInfo: null,
  menu: [],
  onlineCart: [],
  offlineCart: [],
  selectedCategory: 'All',
  dietaryFilter: 'all', // 'all', 'veg', or 'nonveg'
  searchQuery: '',
  voiceLang: 'ta-IN', // 'ta-IN' or 'en-IN'
  speechRecognition: null,
  hotelTimingStatus: null,
  activeBill: null,

  async init() {
    this.loadCartFromStorage();
    await this.fetchHotelInfo();
    await this.fetchHotelStatus();
    setInterval(() => this.fetchHotelStatus(), 30000); // Live status update every 30s
    await this.fetchMenu();
    this.updateCartUI();
  },

  // Storage Persistence for Cart
  loadCartFromStorage() {
    try {
      const storedOnline = localStorage.getItem('grand_online_cart');
      if (storedOnline) this.onlineCart = JSON.parse(storedOnline);
      const storedOffline = localStorage.getItem('grand_offline_cart');
      if (storedOffline) this.offlineCart = JSON.parse(storedOffline);
    } catch (e) {
      console.warn('Could not load cart from storage', e);
    }
  },

  saveCartToStorage() {
    try {
      localStorage.setItem('grand_online_cart', JSON.stringify(this.onlineCart));
      localStorage.setItem('grand_offline_cart', JSON.stringify(this.offlineCart));
    } catch (e) {
      console.warn('Could not save cart to storage', e);
    }
  },

  // 1. Hotel Info & Live Opening/Closing Status
  async fetchHotelInfo() {
    try {
      const res = await API.getHotelInfo();
      if (res.success && res.data) {
        this.hotelInfo = res.data;
        this.renderHotelInfo();
      }
    } catch (err) {
      console.error('Failed to fetch hotel info:', err);
    }
  },

  async fetchHotelStatus() {
    try {
      const res = await API.getHotelStatus();
      if (res.success && res.data) {
        this.hotelTimingStatus = res.data;
        this.renderHotelStatus();
      }
    } catch (err) {
      console.error('Failed to fetch hotel timing status:', err);
    }
  },

  renderHotelStatus() {
    if (!this.hotelTimingStatus) return;
    const st = this.hotelTimingStatus;

    // Header badge & timings
    const navBadge = document.getElementById('nav-status-badge');
    const navText = document.getElementById('nav-status-text');
    const navTimings = document.getElementById('nav-hotel-timings');

    if (navBadge) {
      navBadge.className = `inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold shadow-xs ${
        st.isOpen ? 'bg-emerald-500 text-white' : 'bg-rose-500 text-white'
      }`;
    }
    if (navText) navText.textContent = st.statusText;
    if (navTimings) navTimings.textContent = `Opens: ${st.openTime} • Closes: ${st.closeTime}`;

    // Offline banner status
    const bannerBadge = document.getElementById('offline-banner-status-badge');
    const bannerText = document.getElementById('offline-banner-status-text');
    const bannerDetail = document.getElementById('offline-banner-timing-detail');

    if (bannerBadge) {
      bannerBadge.className = `inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold shadow-2xs ${
        st.isOpen ? 'bg-emerald-500 text-white' : 'bg-rose-500 text-white'
      }`;
    }
    if (bannerText) bannerText.textContent = st.statusText;
    if (bannerDetail) bannerDetail.textContent = st.nextChange;
  },

  renderHotelInfo() {
    if (!this.hotelInfo) return;
    const h = this.hotelInfo;

    // Header & Navigation
    const navName = document.getElementById('nav-hotel-name');
    if (navName) navName.textContent = h.name;
    const navTimings = document.getElementById('nav-hotel-timings');
    if (navTimings) navTimings.textContent = h.timings;

    // Hero Banners
    const bannerEst = document.getElementById('banner-est-time');
    if (bannerEst) bannerEst.textContent = `${h.estimatedDeliveryMins || 35} - ${(h.estimatedDeliveryMins || 35) + 10} Mins`;
    const bannerDel = document.getElementById('banner-del-charge');
    if (bannerDel) bannerDel.textContent = h.deliveryCharge;

    const offAddr = document.getElementById('offline-banner-address');
    if (offAddr) offAddr.textContent = h.address;
    const offTimings = document.getElementById('offline-banner-timings');
    if (offTimings) offTimings.textContent = h.timings;

    // Offline Modal Address
    const modalAddr = document.getElementById('offline-token-modal-address');
    if (modalAddr) modalAddr.textContent = h.address;
    const modalTimings = document.getElementById('offline-token-modal-timings');
    if (modalTimings) modalTimings.textContent = h.timings;

    // Footer
    const footerName = document.getElementById('footer-hotel-name');
    if (footerName) footerName.textContent = h.name;
    const footerAddr = document.getElementById('footer-hotel-address');
    if (footerAddr) footerAddr.textContent = h.address;
  },

  // 2. Mode Switching (Online vs Offline / Visit Hotel)
  switchMode(mode) {
    this.currentMode = mode;

    const onlineBanner = document.getElementById('online-hero-banner');
    const offlineBanner = document.getElementById('offline-hero-banner');
    const btnOnline = document.getElementById('btn-mode-online');
    const btnOffline = document.getElementById('btn-mode-offline');
    const btnMOnline = document.getElementById('btn-m-mode-online');
    const btnMOffline = document.getElementById('btn-m-mode-offline');
    const menuModeBadge = document.getElementById('menu-mode-badge');

    if (mode === 'online') {
      onlineBanner.classList.remove('hidden');
      offlineBanner.classList.add('hidden');

      // Desktop switcher classes
      btnOnline.className = 'flex items-center gap-2 px-5 py-2 rounded-xl text-sm font-semibold transition-all duration-200 bg-white text-slate-900 shadow-sm';
      btnOffline.className = 'flex items-center gap-2 px-5 py-2 rounded-xl text-sm font-semibold transition-all duration-200 text-slate-600 hover:text-slate-900';

      // Mobile switcher classes
      if (btnMOnline && btnMOffline) {
        btnMOnline.className = 'py-2 text-center rounded-lg font-semibold bg-white text-slate-900 shadow-xs';
        btnMOffline.className = 'py-2 text-center rounded-lg text-slate-600';
      }

      menuModeBadge.className = 'bg-amber-100 text-amber-800 text-xs px-2.5 py-0.5 rounded-full font-semibold';
      menuModeBadge.innerHTML = '🛵 Online Delivery Menu';
    } else {
      onlineBanner.classList.add('hidden');
      offlineBanner.classList.remove('hidden');

      // Desktop switcher classes
      btnOnline.className = 'flex items-center gap-2 px-5 py-2 rounded-xl text-sm font-semibold transition-all duration-200 text-slate-600 hover:text-slate-900';
      btnOffline.className = 'flex items-center gap-2 px-5 py-2 rounded-xl text-sm font-semibold transition-all duration-200 bg-indigo-600 text-white shadow-sm';

      // Mobile switcher classes
      if (btnMOnline && btnMOffline) {
        btnMOnline.className = 'py-2 text-center rounded-lg text-slate-600';
        btnMOffline.className = 'py-2 text-center rounded-lg font-semibold bg-indigo-600 text-white shadow-xs';
      }

      menuModeBadge.className = 'bg-indigo-100 text-indigo-800 text-xs px-2.5 py-0.5 rounded-full font-semibold';
      menuModeBadge.innerHTML = '🏬 Hotel Direct Visit / Pre-order Menu';
    }

    this.renderMenuGrid();
    this.updateCartUI();
  },

  // 3. Portal Switching (Customer Storefront vs Admin Dashboard)
  switchPortal(portal) {
    this.currentPortal = portal;
    const customerPortal = document.getElementById('customer-portal');
    const adminPortal = document.getElementById('admin-portal');
    const adminToggleText = document.getElementById('admin-toggle-text');
    const modeSwitcher = document.getElementById('customer-mode-switcher');
    const mobileModeSwitcher = document.getElementById('mobile-mode-switcher');
    const navCartBtn = document.getElementById('nav-cart-btn');

    if (portal === 'admin') {
      customerPortal.classList.add('hidden');
      adminPortal.classList.remove('hidden');
      adminToggleText.textContent = 'Storefront View';
      modeSwitcher.classList.add('hidden');
      if (mobileModeSwitcher) mobileModeSwitcher.classList.add('hidden');
      navCartBtn.classList.add('hidden');
      Admin.refreshAll();
    } else {
      adminPortal.classList.add('hidden');
      customerPortal.classList.remove('hidden');
      adminToggleText.textContent = 'Admin Panel';
      modeSwitcher.classList.remove('hidden');
      if (mobileModeSwitcher) mobileModeSwitcher.classList.remove('hidden');
      navCartBtn.classList.remove('hidden');
    }
  },

  toggleAdminPortal() {
    if (this.currentPortal === 'customer') {
      this.switchPortal('admin');
    } else {
      this.switchPortal('customer');
    }
  },

  // 4. Menu Fetching & Filtering
  async fetchMenu() {
    try {
      const res = await API.getMenu();
      if (res.success && res.data) {
        this.menu = res.data;
        this.renderCategoryPills();
        this.renderMenuGrid();
      }
    } catch (err) {
      console.error('Failed to fetch menu:', err);
    }
  },

  renderCategoryPills() {
    const container = document.getElementById('category-pills');
    if (!container) return;

    const categories = ['All', ...new Set(this.menu.map(m => m.category))];

    container.innerHTML = categories.map(cat => {
      const isActive = this.selectedCategory === cat;
      const activeClass = isActive
        ? 'bg-slate-900 text-white shadow-sm'
        : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200';
      return `
        <button onclick="App.setCategory('${cat}')" 
          class="px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${activeClass}">
          ${cat === 'All' ? '<i class="fa-solid fa-list mr-1.5 text-amber-500"></i>' : ''}
          ${cat}
        </button>
      `;
    }).join('');
  },

  setCategory(category) {
    this.selectedCategory = category;
    this.renderCategoryPills();
    this.renderMenuGrid();
  },

  setDietaryFilter(type) {
    this.dietaryFilter = type;

    // Update dietary pills styling
    const btnAll = document.getElementById('diet-filter-all');
    const btnVeg = document.getElementById('diet-filter-veg');
    const btnNonVeg = document.getElementById('diet-filter-nonveg');

    const defaultClass = 'diet-pill px-3 py-1.5 rounded-lg font-medium text-slate-600 hover:text-slate-900 transition-all flex items-center gap-1.5';

    if (btnAll) {
      btnAll.className = type === 'all'
        ? 'diet-pill px-3 py-1.5 rounded-lg font-bold bg-white text-slate-900 shadow-xs transition-all'
        : defaultClass;
    }

    if (btnVeg) {
      btnVeg.className = type === 'veg'
        ? 'diet-pill px-3 py-1.5 rounded-lg font-bold bg-emerald-600 text-white shadow-xs transition-all flex items-center gap-1.5'
        : defaultClass;
    }

    if (btnNonVeg) {
      btnNonVeg.className = type === 'nonveg'
        ? 'diet-pill px-3 py-1.5 rounded-lg font-bold bg-rose-600 text-white shadow-xs transition-all flex items-center gap-1.5'
        : defaultClass;
    }

    this.renderMenuGrid();
  },

  clearSearch() {
    const input = document.getElementById('menu-search-input');
    if (input) input.value = '';
    this.searchQuery = '';
    const clearBtn = document.getElementById('search-clear-btn');
    if (clearBtn) clearBtn.classList.add('hidden');
    this.renderMenuGrid();
  },

  resetAllFilters() {
    this.selectedCategory = 'All';
    this.dietaryFilter = 'all';
    this.searchQuery = '';
    const input = document.getElementById('menu-search-input');
    if (input) input.value = '';
    const clearBtn = document.getElementById('search-clear-btn');
    if (clearBtn) clearBtn.classList.add('hidden');
    this.setDietaryFilter('all');
    this.renderCategoryPills();
    this.renderMenuGrid();
  },

  filterMenu() {
    const input = document.getElementById('menu-search-input');
    this.searchQuery = input ? input.value.trim().toLowerCase() : '';
    const clearBtn = document.getElementById('search-clear-btn');
    if (clearBtn) {
      if (this.searchQuery) {
        clearBtn.classList.remove('hidden');
      } else {
        clearBtn.classList.add('hidden');
      }
    }
    this.renderMenuGrid();
  },

  renderMenuGrid() {
    const grid = document.getElementById('menu-items-grid');
    const emptyState = document.getElementById('menu-empty-state');
    const feedbackBar = document.getElementById('filter-feedback-bar');
    const feedbackText = document.getElementById('filter-feedback-text');
    if (!grid) return;

    const rawQuery = (this.searchQuery || '').trim().toLowerCase();

    // Smart Dietary detection from search keywords
    let effectiveDiet = this.dietaryFilter; // 'all', 'veg', or 'nonveg'
    let textQuery = rawQuery;

    const nonVegPatterns = ['non veg', 'nonveg', 'non-veg', 'non vegetarian', 'non-vegetarian'];
    const vegPatterns = ['pure veg', 'pureveg', 'pure-veg', 'veg', 'vegetarian'];

    let matchedNonVegInQuery = false;
    for (const p of nonVegPatterns) {
      if (textQuery.includes(p)) {
        effectiveDiet = 'nonveg';
        matchedNonVegInQuery = true;
        textQuery = textQuery.replace(p, '').trim();
        break;
      }
    }

    if (!matchedNonVegInQuery) {
      for (const p of vegPatterns) {
        if (textQuery.includes(p)) {
          effectiveDiet = 'veg';
          textQuery = textQuery.replace(p, '').trim();
          break;
        }
      }
    }

    let items = this.menu.filter(item => {
      if (!item.available) return false;

      // Category filter
      if (this.selectedCategory !== 'All' && item.category !== this.selectedCategory) {
        return false;
      }

      // Dietary filter (Pure Veg vs Non-Veg)
      if (effectiveDiet === 'veg' && !item.isVeg) return false;
      if (effectiveDiet === 'nonveg' && item.isVeg) return false;

      // Text query match (against name, description, category, tags)
      if (textQuery) {
        const words = textQuery.split(/\s+/).filter(Boolean);
        const name = (item.name || '').toLowerCase();
        const desc = (item.description || '').toLowerCase();
        const cat = (item.category || '').toLowerCase();
        const tags = (item.tags || []).join(' ').toLowerCase();

        const matches = words.every(w =>
          name.includes(w) || desc.includes(w) || cat.includes(w) || tags.includes(w)
        );

        if (!matches) return false;
      }

      return true;
    });

    // Update Filter Feedback Bar
    const hasFilterActive = this.selectedCategory !== 'All' || effectiveDiet !== 'all' || rawQuery;
    if (feedbackBar && feedbackText) {
      if (hasFilterActive) {
        feedbackBar.classList.remove('hidden');
        const parts = [];
        if (effectiveDiet === 'veg') parts.push('🟢 Pure Veg Only');
        else if (effectiveDiet === 'nonveg') parts.push('🔴 Non-Veg Only');

        if (this.selectedCategory !== 'All') parts.push(`Category: "${this.selectedCategory}"`);
        if (rawQuery) parts.push(`Search: "${rawQuery}"`);

        feedbackText.innerHTML = `Showing <strong>${items.length}</strong> Indian dish${items.length === 1 ? '' : 'es'} (${parts.join(' • ')})`;
      } else {
        feedbackBar.classList.add('hidden');
      }
    }

    if (items.length === 0) {
      grid.innerHTML = '';
      emptyState.classList.remove('hidden');
      return;
    }

    emptyState.classList.add('hidden');
    const currentCart = this.currentMode === 'online' ? this.onlineCart : this.offlineCart;

    grid.innerHTML = items.map(item => {
      const cartItem = currentCart.find(c => c.id === item.id);
      const qty = cartItem ? cartItem.quantity : 0;
      const isOnline = this.currentMode === 'online';

      // Safe fallback image for Veg vs Non-Veg in case network or Unsplash is slow
      const fallbackImg = item.isVeg
        ? 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?auto=format&fit=crop&w=600&q=80'
        : 'https://images.unsplash.com/photo-1603894584373-5ac82b2ae398?auto=format&fit=crop&w=600&q=80';

      const actionButton = qty > 0
        ? `
          <div class="flex items-center justify-between bg-slate-900 text-white rounded-xl px-2 py-1 shadow-sm">
            <button onclick="App.updateCartItemQuantity('${item.id}', -1)" class="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-slate-800 text-amber-400 font-bold transition-colors">
              <i class="fa-solid fa-minus text-xs"></i>
            </button>
            <span class="text-xs font-bold px-2">${qty}</span>
            <button onclick="App.updateCartItemQuantity('${item.id}', 1)" class="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-slate-800 text-amber-400 font-bold transition-colors">
              <i class="fa-solid fa-plus text-xs"></i>
            </button>
          </div>
        `
        : `
          <button onclick="App.addToCart('${item.id}')" 
            class="w-full py-2 px-3 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 transition-all shadow-xs ${
              isOnline
                ? 'bg-amber-500 hover:bg-amber-600 text-white shadow-amber-500/20'
                : 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-indigo-600/20'
            }">
            <i class="fa-solid fa-plus text-[10px]"></i>
            <span>${isOnline ? 'Add to Delivery' : 'Pre-select Dish'}</span>
          </button>
        `;

      return `
        <div class="bg-white rounded-3xl border border-slate-200/90 shadow-sm hover:shadow-md transition-all duration-200 flex flex-col overflow-hidden group">
          <!-- Food Image with safe fallback -->
          <div class="relative h-44 overflow-hidden bg-slate-100">
            <img src="${item.image}" alt="${item.name}" 
              loading="lazy"
              onerror="this.onerror=null; this.src='${fallbackImg}';"
              class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300">
            
            <!-- Veg / Non-Veg Indicator -->
            <div class="absolute top-3 left-3 bg-white/90 backdrop-blur-md p-1.5 rounded-lg shadow-sm">
              <span class="${item.isVeg ? 'veg-indicator' : 'non-veg-indicator'}"></span>
            </div>

            <!-- Dietary Badge -->
            <div class="absolute top-3 right-3 ${item.isVeg ? 'bg-emerald-950/80 text-emerald-300' : 'bg-rose-950/80 text-rose-300'} backdrop-blur-md text-[10px] font-bold px-2.5 py-1 rounded-full">
              ${item.isVeg ? 'Veg' : 'Non-Veg'} • ${item.category}
            </div>

            <!-- Prep Time -->
            <div class="absolute bottom-2.5 left-3 bg-white/90 backdrop-blur-md text-slate-700 text-[10px] font-medium px-2 py-0.5 rounded-md flex items-center gap-1">
              <i class="fa-solid fa-stopwatch text-amber-500"></i> ${item.prepTime || '15 mins'}
            </div>
          </div>

          <!-- Card Details -->
          <div class="p-4 flex-1 flex flex-col justify-between">
            <div>
              <div class="flex items-baseline justify-between gap-2 mb-1">
                <h4 class="font-bold text-slate-900 text-sm leading-snug line-clamp-1">${item.name}</h4>
                <span class="font-extrabold text-slate-900 text-sm whitespace-nowrap">₹${item.price}</span>
              </div>
              <p class="text-xs text-slate-500 line-clamp-2 leading-relaxed mb-4">${item.description || 'Prepared fresh with pure Indian spices and premium ingredients.'}</p>
            </div>

            <div class="pt-2">
              ${actionButton}
            </div>
          </div>
        </div>
      `;
    }).join('');
  },

  // 5. Cart Management
  addToCart(itemId) {
    const item = this.menu.find(m => m.id === itemId);
    if (!item) return;

    const currentCart = this.currentMode === 'online' ? this.onlineCart : this.offlineCart;
    const existing = currentCart.find(c => c.id === itemId);

    if (existing) {
      existing.quantity += 1;
    } else {
      currentCart.push({
        id: item.id,
        name: item.name,
        price: item.price,
        isVeg: item.isVeg,
        image: item.image,
        quantity: 1
      });
    }

    this.saveCartToStorage();
    this.updateCartUI();
    this.renderMenuGrid();
    this.showToast(`Added "${item.name}" to ${this.currentMode === 'online' ? 'Delivery Cart' : 'Pre-order list'}`);
  },

  updateCartItemQuantity(itemId, delta) {
    const currentCart = this.currentMode === 'online' ? this.onlineCart : this.offlineCart;
    const idx = currentCart.findIndex(c => c.id === itemId);
    if (idx === -1) return;

    currentCart[idx].quantity += delta;
    if (currentCart[idx].quantity <= 0) {
      currentCart.splice(idx, 1);
    }

    this.saveCartToStorage();
    this.updateCartUI();
    this.renderMenuGrid();
  },

  updateCartUI() {
    const currentCart = this.currentMode === 'online' ? this.onlineCart : this.offlineCart;
    const totalCount = currentCart.reduce((sum, it) => sum + it.quantity, 0);

    // Navbar Badge & Label
    const navBadge = document.getElementById('nav-cart-badge');
    const navLabel = document.getElementById('nav-cart-label');
    if (navBadge) navBadge.textContent = totalCount;
    if (navLabel) navLabel.textContent = this.currentMode === 'online' ? 'Delivery Cart' : 'Pre-order Bag';

    // Drawer Titles
    const drawerTitle = document.getElementById('drawer-title');
    const drawerSub = document.getElementById('drawer-subtitle');
    if (drawerTitle) drawerTitle.textContent = this.currentMode === 'online' ? 'Online Delivery Bag' : 'Hotel Pre-order Bag';
    if (drawerSub) drawerSub.textContent = this.currentMode === 'online' ? 'Doorstep Delivery' : 'Pickup / Dine-in at Hotel';

    // Free delivery progress bar (online only)
    const freeDelBar = document.getElementById('drawer-free-del-bar');
    const h = this.hotelInfo || { deliveryCharge: 40, freeDeliveryThreshold: 500 };
    const subtotal = currentCart.reduce((sum, it) => sum + (it.price * it.quantity), 0);

    if (this.currentMode === 'online' && freeDelBar) {
      freeDelBar.classList.remove('hidden');
      const thresh = h.freeDeliveryThreshold || 500;
      if (subtotal >= thresh) {
        document.getElementById('free-del-text').innerHTML = '🎉 You unlocked <strong>FREE Delivery!</strong>';
        document.getElementById('free-del-percent').textContent = '100%';
        document.getElementById('free-del-progress').style.width = '100%';
        document.getElementById('free-del-progress').className = 'h-full bg-emerald-500 rounded-full transition-all duration-300';
      } else {
        const remaining = thresh - subtotal;
        const percent = Math.min(100, Math.round((subtotal / thresh) * 100));
        document.getElementById('free-del-text').innerHTML = `Add <strong>₹${remaining}</strong> more for FREE delivery`;
        document.getElementById('free-del-percent').textContent = `${percent}%`;
        const bar = document.getElementById('free-del-progress');
        bar.style.width = `${percent}%`;
        bar.className = 'h-full bg-amber-500 rounded-full transition-all duration-300';
      }
    } else if (freeDelBar) {
      freeDelBar.classList.add('hidden');
    }

    // Bill row for delivery
    const delRow = document.getElementById('bill-del-row');
    let deliveryFee = 0;
    if (this.currentMode === 'online') {
      delRow.classList.remove('hidden');
      deliveryFee = (subtotal >= (h.freeDeliveryThreshold || 500) || subtotal === 0) ? 0 : (h.deliveryCharge || 40);
      document.getElementById('bill-delivery').textContent = deliveryFee === 0 ? 'FREE' : `₹${deliveryFee.toFixed(2)}`;
    } else {
      delRow.classList.add('hidden');
      deliveryFee = 0;
    }

    // Taxes & Total
    const tax = subtotal > 0 ? Math.round((subtotal * (h.taxPercent || 5) / 100) * 100) / 100 : 0;
    const grandTotal = Math.round((subtotal + tax + deliveryFee) * 100) / 100;

    document.getElementById('bill-subtotal').textContent = `₹${subtotal.toFixed(2)}`;
    document.getElementById('bill-tax').textContent = `₹${tax.toFixed(2)}`;
    document.getElementById('bill-grand-total').textContent = `₹${grandTotal.toFixed(2)}`;

    // Drawer Items container
    const container = document.getElementById('cart-items-container');
    const checkoutBtn = document.getElementById('cart-checkout-btn');

    if (currentCart.length === 0) {
      container.innerHTML = `
        <div class="text-center py-16 text-slate-400">
          <div class="w-14 h-14 rounded-full bg-slate-100 flex items-center justify-center mx-auto text-xl mb-3">
            <i class="fa-solid fa-bag-shopping text-slate-300"></i>
          </div>
          <p class="text-xs font-semibold text-slate-600">Your bag is currently empty</p>
          <p class="text-[11px] text-slate-400 mt-0.5">Explore our menu and add items to order</p>
        </div>
      `;
      checkoutBtn.disabled = this.currentMode === 'online'; // In offline mode, they can still generate a walk-in token without pre-selecting dishes!
      if (this.currentMode === 'online') {
        checkoutBtn.className = 'w-full py-3 bg-slate-300 text-slate-500 font-bold rounded-xl text-sm flex items-center justify-center gap-2 cursor-not-allowed';
        checkoutBtn.innerHTML = '<span>Bag is Empty</span>';
      } else {
        checkoutBtn.className = 'w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl text-sm flex items-center justify-center gap-2';
        checkoutBtn.innerHTML = '<span>Generate Walk-in Token</span> <i class="fa-solid fa-arrow-right"></i>';
      }
      return;
    }

    checkoutBtn.disabled = false;
    if (this.currentMode === 'online') {
      checkoutBtn.className = 'w-full py-3 bg-amber-500 hover:bg-amber-600 text-white font-bold rounded-xl shadow-lg shadow-amber-500/25 transition-all text-sm flex items-center justify-center gap-2';
      checkoutBtn.innerHTML = `<span>Proceed to Delivery (₹${grandTotal})</span> <i class="fa-solid fa-arrow-right"></i>`;
    } else {
      checkoutBtn.className = 'w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl shadow-lg shadow-indigo-600/25 transition-all text-sm flex items-center justify-center gap-2';
      checkoutBtn.innerHTML = `<span>Generate Token with Items</span> <i class="fa-solid fa-arrow-right"></i>`;
    }

    container.innerHTML = currentCart.map(it => `
      <div class="flex items-center justify-between p-3 rounded-2xl bg-slate-50 border border-slate-100">
        <div class="flex items-center gap-3">
          <span class="${it.isVeg ? 'veg-indicator' : 'non-veg-indicator'} scale-75"></span>
          <div>
            <h5 class="text-xs font-bold text-slate-800 line-clamp-1">${it.name}</h5>
            <p class="text-[11px] font-semibold text-slate-500">₹${it.price} × ${it.quantity} = ₹${it.price * it.quantity}</p>
          </div>
        </div>
        
        <div class="flex items-center gap-2 bg-white rounded-xl border border-slate-200 px-1 py-0.5">
          <button onclick="App.updateCartItemQuantity('${it.id}', -1)" class="w-6 h-6 flex items-center justify-center text-slate-500 hover:text-slate-800 text-xs">
            <i class="fa-solid fa-minus text-[10px]"></i>
          </button>
          <span class="text-xs font-bold w-4 text-center">${it.quantity}</span>
          <button onclick="App.updateCartItemQuantity('${it.id}', 1)" class="w-6 h-6 flex items-center justify-center text-slate-500 hover:text-slate-800 text-xs">
            <i class="fa-solid fa-plus text-[10px]"></i>
          </button>
        </div>
      </div>
    `).join('');
  },

  toggleCartDrawer() {
    const drawer = document.getElementById('cart-drawer');
    const overlay = document.getElementById('cart-drawer-overlay');
    if (!drawer) return;

    if (drawer.classList.contains('translate-x-full')) {
      drawer.classList.remove('translate-x-full');
      overlay.classList.remove('hidden');
    } else {
      drawer.classList.add('translate-x-full');
      overlay.classList.add('hidden');
    }
  },

  // 6. Checkout Dispatcher
  proceedToCheckout() {
    this.toggleCartDrawer(); // Close drawer
    if (this.currentMode === 'online') {
      this.openOnlineCheckoutModal();
    } else {
      this.openOfflineTokenModal(true);
    }
  },

  // 7. ONLINE DELIVERY CHECKOUT MODAL
  openOnlineCheckoutModal() {
    if (this.onlineCart.length === 0) {
      this.showToast('Please add food items to order delivery', '⚠️');
      return;
    }

    const modal = document.getElementById('modal-online-checkout');
    const h = this.hotelInfo || { deliveryCharge: 40, freeDeliveryThreshold: 500, estimatedDeliveryMins: 35 };
    const subtotal = this.onlineCart.reduce((sum, it) => sum + (it.price * it.quantity), 0);
    const delCharge = subtotal >= (h.freeDeliveryThreshold || 500) ? 0 : (h.deliveryCharge || 40);
    const tax = Math.round((subtotal * 0.05) * 100) / 100;
    const grandTotal = Math.round((subtotal + delCharge + tax) * 100) / 100;

    document.getElementById('chk-est-time').textContent = `${h.estimatedDeliveryMins || 35} - ${(h.estimatedDeliveryMins || 35) + 10} mins`;
    document.getElementById('chk-del-charge').textContent = delCharge === 0 ? 'FREE' : `₹${delCharge.toFixed(2)}`;
    document.getElementById('chk-grand-total').textContent = `₹${grandTotal.toFixed(2)}`;

    modal.classList.remove('hidden');
  },

  closeCheckoutModal() {
    document.getElementById('modal-online-checkout').classList.add('hidden');
  },

  async submitOnlineOrder(event) {
    event.preventDefault();
    const name = document.getElementById('chk-name').value.trim();
    const phone = document.getElementById('chk-phone').value.trim();
    const address = document.getElementById('chk-address').value.trim();
    const instructions = document.getElementById('chk-instructions').value.trim();

    const selectedPayRadio = document.querySelector('input[name="paymentMethod"]:checked');
    const paymentMethod = selectedPayRadio ? selectedPayRadio.value : 'Cash on Delivery';

    if (!name || !phone || !address) {
      alert('Please fill in your name, 10-digit mobile number, and delivery address.');
      return;
    }

    try {
      const orderPayload = {
        customerName: name,
        customerPhone: phone,
        deliveryAddress: address,
        specialInstructions: instructions,
        paymentMethod,
        items: this.onlineCart.map(it => ({
          id: it.id,
          name: it.name,
          price: it.price,
          quantity: it.quantity
        }))
      };

      const res = await API.createOnlineOrder(orderPayload);
      if (res.success && res.data) {
        // Clear online cart
        this.onlineCart = [];
        this.saveCartToStorage();
        this.updateCartUI();
        this.renderMenuGrid();
        this.closeCheckoutModal();

        // Show Tracking View for this order
        this.openTrackModal();
        this.renderOnlineTracking(res.data, true);
        this.showToast(`Order Placed Successfully! ID: ${res.data.id}`, '🎉');

        // Auto-show bill receipt if available
        if (res.data.bill) {
          setTimeout(() => this.openBillModal(res.data.bill), 800);
        }
      } else {
        alert(res.message || 'Could not place online order.');
      }
    } catch (err) {
      console.error('Order submit error:', err);
      alert('Failed to place order. Please try again.');
    }
  },

  // 8. OFFLINE / VISIT HOTEL TOKEN MODAL
  openOfflineTokenModal(withPreselected = false) {
    const modal = document.getElementById('modal-offline-token');
    const countSpan = document.getElementById('off-preselected-count');
    const listDiv = document.getElementById('off-preselected-list');

    if (withPreselected && this.offlineCart.length > 0) {
      countSpan.textContent = `${this.offlineCart.length} dishes selected`;
      listDiv.innerHTML = this.offlineCart.map(it => `
        <div class="py-1 flex justify-between">
          <span>${it.name} (×${it.quantity})</span>
          <span class="font-bold">₹${it.price * it.quantity}</span>
        </div>
      `).join('');
    } else {
      countSpan.textContent = 'None (Direct Counter Ordering)';
      listDiv.innerHTML = `
        <p class="py-1 text-slate-400 italic">No dishes pre-selected. You can order directly at the hotel counter.</p>
      `;
    }

    modal.classList.remove('hidden');
  },

  closeOfflineTokenModal() {
    document.getElementById('modal-offline-token').classList.add('hidden');
  },

  async submitOfflineToken(event) {
    event.preventDefault();
    const name = document.getElementById('off-name').value.trim();
    const phone = document.getElementById('off-phone').value.trim();
    const visitType = document.getElementById('off-visit-type').value;
    const visitTiming = document.getElementById('off-visit-timing').value;

    if (!name || !phone) {
      alert('Please enter your name and mobile number.');
      return;
    }

    try {
      const tokenPayload = {
        customerName: name,
        customerPhone: phone,
        visitType,
        visitTiming,
        items: this.offlineCart.map(it => ({
          id: it.id,
          name: it.name,
          price: it.price,
          quantity: it.quantity
        }))
      };

      const res = await API.createOfflineOrder(tokenPayload);
      if (res.success && res.data) {
        // Clear offline pre-order cart
        this.offlineCart = [];
        this.saveCartToStorage();
        this.updateCartUI();
        this.renderMenuGrid();
        this.closeOfflineTokenModal();

        // Show Tracking View for this token
        this.openTrackModal();
        this.renderOfflineTracking(res.data, true);
        this.showToast(`Token Generated: ${res.data.id}!`, '🎫');

        // Auto-show bill receipt if available
        if (res.data.bill) {
          setTimeout(() => this.openBillModal(res.data.bill), 800);
        }
      } else {
        alert(res.message || 'Could not generate token.');
      }
    } catch (err) {
      console.error('Token submit error:', err);
      alert('Failed to generate token. Please try again.');
    }
  },

  // 9. TRACKING MODAL & VISUAL STEPPERS
  openTrackModal() {
    const modal = document.getElementById('modal-track');
    const container = document.getElementById('track-result-container');
    modal.classList.remove('hidden');

    if (!container.innerHTML.trim()) {
      container.innerHTML = `
        <div class="text-center py-10 text-slate-400">
          <i class="fa-solid fa-qrcode text-4xl mb-3 text-slate-300"></i>
          <p class="text-xs font-semibold text-slate-600">Enter your code above to track status</p>
          <p class="text-[11px] text-slate-400 mt-1">Examples: <code class="bg-slate-100 px-1 py-0.5 rounded text-slate-700">ORD-2026-1001</code> or <code class="bg-slate-100 px-1 py-0.5 rounded text-slate-700">TKN-101</code></p>
        </div>
      `;
    }
  },

  closeTrackModal() {
    document.getElementById('modal-track').classList.add('hidden');
  },

  async handleTrackSubmit(event) {
    if (event) event.preventDefault();
    const input = document.getElementById('track-search-input');
    const code = input ? input.value.trim() : '';
    if (!code) return;

    const container = document.getElementById('track-result-container');
    container.innerHTML = `
      <div class="text-center py-10 text-slate-500">
        <i class="fa-solid fa-circle-notch fa-spin text-2xl text-amber-500 mb-2"></i>
        <p class="text-xs">Looking up details for ${code}...</p>
      </div>
    `;

    try {
      const res = await API.track(code);
      if (res.success && res.data) {
        if (res.type === 'online') {
          this.renderOnlineTracking(res.data);
        } else {
          this.renderOfflineTracking(res.data);
        }
      } else {
        container.innerHTML = `
          <div class="text-center py-10 text-rose-500">
            <i class="fa-solid fa-triangle-exclamation text-3xl mb-2"></i>
            <p class="text-sm font-bold">No Records Found</p>
            <p class="text-xs text-slate-500 mt-1">Could not find any order or token with identifier "${code}".</p>
          </div>
        `;
      }
    } catch (err) {
      container.innerHTML = `
        <div class="text-center py-10 text-rose-500">
          <p class="text-xs">Error connecting to server. Please try again.</p>
        </div>
      `;
    }
  },

  renderOnlineTracking(order, isNew = false) {
    const container = document.getElementById('track-result-container');
    const input = document.getElementById('track-search-input');
    if (input) input.value = order.id;

    // Online delivery steps: Order Placed -> Preparing -> Out for Delivery -> Delivered
    const steps = ['Order Placed', 'Preparing', 'Out for Delivery', 'Delivered'];
    const currentStepIdx = steps.indexOf(order.deliveryStatus);

    const stepIcons = {
      'Order Placed': 'fa-solid fa-receipt',
      'Preparing': 'fa-solid fa-kitchen-set',
      'Out for Delivery': 'fa-solid fa-motorcycle',
      'Delivered': 'fa-solid fa-circle-check'
    };

    container.innerHTML = `
      <div class="space-y-6">
        
        ${isNew ? `
          <div class="p-3 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-center gap-3 text-emerald-800 text-xs">
            <i class="fa-solid fa-circle-check text-emerald-600 text-lg"></i>
            <div>
              <p class="font-bold">Thank you for your order!</p>
              <p class="text-[11px] text-emerald-700">We have received your order and the kitchen has begun preparation.</p>
            </div>
          </div>
        ` : ''}

        <!-- Top Order Info Card -->
        <div class="bg-amber-500/10 border border-amber-500/20 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div class="flex items-center gap-2">
              <span class="bg-amber-500 text-white font-mono text-xs font-bold px-2.5 py-0.5 rounded-lg">${order.id}</span>
              <span class="text-xs font-semibold text-slate-600">Online Delivery</span>
            </div>
            <p class="text-xs text-slate-500 mt-1">Placed on: ${new Date(order.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
          </div>
          
          <div class="flex items-center gap-2">
            <span class="text-xs font-semibold text-slate-600">Est. Arrival:</span>
            <span class="text-sm font-extrabold text-amber-700 bg-white px-3 py-1 rounded-xl border border-amber-200">
              <i class="fa-solid fa-stopwatch mr-1"></i> ${order.estimatedDeliveryTime || '35 mins'}
            </span>
            <button onclick="App.handleTrackSubmit(null)" title="Refresh status" class="w-8 h-8 rounded-xl bg-white border border-slate-200 hover:bg-slate-50 flex items-center justify-center text-slate-600">
              <i class="fa-solid fa-rotate-right text-xs"></i>
            </button>
          </div>
        </div>

        <!-- 4-STEP DELIVERY TRACKER -->
        <div class="py-2">
          <p class="text-xs font-bold text-slate-800 mb-4 flex items-center gap-2">
            <i class="fa-solid fa-route text-amber-600"></i> Live Delivery Progress
          </p>
          <div class="flex items-start justify-between relative">
            ${steps.map((step, idx) => {
              const isCompleted = idx < currentStepIdx;
              const isCurrent = idx === currentStepIdx;
              const circleClass = isCompleted 
                ? 'bg-emerald-500 text-white border-emerald-500' 
                : isCurrent 
                  ? 'bg-amber-500 text-white border-amber-500 ring-4 ring-amber-100 animate-pulse'
                  : 'bg-white text-slate-300 border-slate-200';

              return `
                <div class="step-item ${isCompleted ? 'completed active' : isCurrent ? 'active' : ''}">
                  <div class="step-circle ${circleClass}">
                    <i class="${stepIcons[step]} text-sm"></i>
                  </div>
                  <span class="text-[11px] font-bold mt-2 text-center ${isCurrent ? 'text-amber-700' : isCompleted ? 'text-emerald-700' : 'text-slate-400'}">
                    ${step}
                  </span>
                </div>
              `;
            }).join('')}
          </div>
        </div>

        <!-- Details Grid -->
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          
          <!-- Customer & Address -->
          <div class="p-3.5 bg-slate-50 border border-slate-200 rounded-2xl space-y-2">
            <p class="font-bold text-slate-800 flex items-center gap-1.5">
              <i class="fa-solid fa-user text-amber-600"></i> Customer & Address
            </p>
            <div class="text-slate-600 space-y-0.5 text-[11px]">
              <p><strong>Name:</strong> ${order.customerName}</p>
              <p><strong>Mobile:</strong> ${order.customerPhone}</p>
              <p class="pt-1"><strong>Deliver To:</strong> ${order.deliveryAddress}</p>
              ${order.specialInstructions ? `<p class="italic text-slate-500">Note: ${order.specialInstructions}</p>` : ''}
            </div>
          </div>

          <!-- Payment Info -->
          <div class="p-3.5 bg-slate-50 border border-slate-200 rounded-2xl space-y-2">
            <p class="font-bold text-slate-800 flex items-center gap-1.5">
              <i class="fa-solid fa-credit-card text-amber-600"></i> Payment Details
            </p>
            <div class="text-slate-600 space-y-1 text-[11px]">
              <div class="flex justify-between">
                <span>Method:</span>
                <span class="font-bold text-slate-800">${order.paymentMethod}</span>
              </div>
              <div class="flex justify-between items-center">
                <span>Payment Status:</span>
                <span class="px-2 py-0.5 rounded-full font-bold text-[10px] ${order.paymentStatus === 'Paid' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'}">
                  ${order.paymentStatus}
                </span>
              </div>
              <div class="flex justify-between pt-1 border-t border-slate-200 font-bold text-slate-900 text-xs">
                <span>Grand Total:</span>
                <span class="text-amber-700">₹${(order.grandTotal || 0).toFixed(2)}</span>
              </div>
            </div>
          </div>

        </div>

        <!-- Ordered Items Summary -->
        <div class="border border-slate-200 rounded-2xl p-3.5 bg-white">
          <p class="text-xs font-bold text-slate-800 mb-2">Ordered Dishes (${order.items ? order.items.length : 0})</p>
          <div class="divide-y divide-slate-100 text-xs">
            ${(order.items || []).map(it => `
              <div class="py-1.5 flex justify-between">
                <span>${it.name} × ${it.quantity}</span>
                <span class="font-semibold text-slate-700">₹${it.price * it.quantity}</span>
              </div>
            `).join('')}
          </div>
        </div>

      </div>
    `;
  },

  renderOfflineTracking(token, isNew = false) {
    const container = document.getElementById('track-result-container');
    const input = document.getElementById('track-search-input');
    if (input) input.value = token.id;

    // Offline steps: Token Issued -> Preparing -> Ready for Pickup -> Completed
    const steps = ['Token Issued', 'Preparing', 'Ready for Pickup', 'Completed'];
    const currentStepIdx = steps.indexOf(token.status);

    const stepIcons = {
      'Token Issued': 'fa-solid fa-ticket',
      'Preparing': 'fa-solid fa-kitchen-set',
      'Ready for Pickup': 'fa-solid fa-bell-concierge',
      'Completed': 'fa-solid fa-circle-check'
    };

    container.innerHTML = `
      <div class="space-y-6">
        
        <!-- Big Digital Token Pass -->
        <div class="bg-gradient-to-br from-indigo-950 via-slate-900 to-indigo-900 text-white rounded-3xl p-6 shadow-xl relative overflow-hidden text-center border-2 border-indigo-700/60">
          <div class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-500/20 text-indigo-300 text-[11px] font-bold uppercase tracking-wider mb-2">
            <i class="fa-solid fa-hotel"></i> Hotel Direct Visit Pass
          </div>

          <div class="my-2">
            <p class="text-xs text-indigo-200 uppercase tracking-widest">Your Token Number</p>
            <h2 class="text-5xl font-black font-mono tracking-wider text-amber-400 my-1 drop-shadow-md">
              ${token.id}
            </h2>
          </div>

          <div class="flex items-center justify-center gap-3 text-xs text-indigo-100 mt-2">
            <span class="px-2.5 py-1 bg-white/10 rounded-lg">👤 ${token.customerName}</span>
            <span class="px-2.5 py-1 bg-white/10 rounded-lg">🏷️ ${token.visitType || 'Takeaway'}</span>
            <span class="px-2.5 py-1 bg-white/10 rounded-lg">🕒 ${token.visitTiming || 'Visiting Now'}</span>
          </div>

          <p class="text-xs text-indigo-200/90 mt-4 max-w-sm mx-auto leading-relaxed border-t border-indigo-800/80 pt-3">
            Please show this Token Number at the hotel counter upon arrival. 
            Payment can be made directly via <strong>Cash</strong>, <strong>UPI</strong>, or <strong>Card</strong>.
          </p>
        </div>

        <!-- 4-STEP TOKEN PROGRESS TRACKER -->
        <div class="py-2">
          <p class="text-xs font-bold text-slate-800 mb-4 flex items-center gap-2">
            <i class="fa-solid fa-clock-rotate-left text-indigo-600"></i> Counter Status
          </p>
          <div class="flex items-start justify-between relative">
            ${steps.map((step, idx) => {
              const isCompleted = idx < currentStepIdx;
              const isCurrent = idx === currentStepIdx;
              const circleClass = isCompleted 
                ? 'bg-emerald-500 text-white border-emerald-500' 
                : isCurrent 
                  ? 'bg-indigo-600 text-white border-indigo-600 ring-4 ring-indigo-100 animate-pulse'
                  : 'bg-white text-slate-300 border-slate-200';

              return `
                <div class="step-item ${isCompleted ? 'completed active' : isCurrent ? 'active' : ''}">
                  <div class="step-circle ${circleClass}">
                    <i class="${stepIcons[step]} text-sm"></i>
                  </div>
                  <span class="text-[11px] font-bold mt-2 text-center ${isCurrent ? 'text-indigo-700' : isCompleted ? 'text-emerald-700' : 'text-slate-400'}">
                    ${step}
                  </span>
                </div>
              `;
            }).join('')}
          </div>
        </div>

        <!-- Hotel Location & Payment Support -->
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          
          <div class="p-3.5 bg-slate-50 border border-slate-200 rounded-2xl space-y-1.5">
            <p class="font-bold text-slate-800 flex items-center gap-1.5">
              <i class="fa-solid fa-location-dot text-indigo-600"></i> Hotel Collection Counter
            </p>
            <p class="text-slate-600 text-[11px] leading-relaxed">
              ${(this.hotelInfo && this.hotelInfo.address) || 'Plot 42, Heritage Avenue, Connaught Place, New Delhi'}
            </p>
            <p class="text-[11px] text-slate-500">
              Timings: ${(this.hotelInfo && this.hotelInfo.timings) || '10:30 AM – 11:00 PM'}
            </p>
          </div>

          <div class="p-3.5 bg-slate-50 border border-slate-200 rounded-2xl space-y-1.5">
            <p class="font-bold text-slate-800 flex items-center gap-1.5">
              <i class="fa-solid fa-wallet text-indigo-600"></i> Counter Payment
            </p>
            <div class="text-[11px] text-slate-600 space-y-1">
              <div class="flex justify-between">
                <span>Selected Method:</span>
                <span class="font-bold text-slate-800">${token.paymentMethod || 'At Hotel (Cash/UPI/Card)'}</span>
              </div>
              <div class="flex justify-between items-center">
                <span>Payment Status:</span>
                <span class="px-2 py-0.5 rounded-full font-bold text-[10px] ${token.paymentStatus === 'Paid' ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-200 text-slate-700'}">
                  ${token.paymentStatus === 'Paid' ? 'Paid at Hotel' : 'Pending at Counter'}
                </span>
              </div>
              <div class="flex justify-between font-bold text-slate-900 pt-1 border-t border-slate-200">
                <span>Est. Amount:</span>
                <span class="text-indigo-600">₹${(token.grandTotal || 0).toFixed(2)}</span>
              </div>
            </div>
          </div>

        </div>

        ${token.items && token.items.length > 0 ? `
          <div class="border border-slate-200 rounded-2xl p-3.5 bg-white">
            <p class="text-xs font-bold text-slate-800 mb-2">Pre-selected Dishes (${token.items.length})</p>
            <div class="divide-y divide-slate-100 text-xs">
              ${token.items.map(it => `
                <div class="py-1.5 flex justify-between">
                  <span>${it.name} × ${it.quantity}</span>
                  <span class="font-semibold text-slate-700">₹${it.price * it.quantity}</span>
                </div>
              `).join('')}
            </div>
          </div>
        ` : ''}

        <button onclick="window.print()" class="w-full py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition-colors flex items-center justify-center gap-2">
          <i class="fa-solid fa-print"></i> Print Digital Token Pass
        </button>

      </div>
    `;
  },

  // ===== VOICE SEARCH (Tamil / English) =====
  openVoiceModal() {
    const modal = document.getElementById('modal-voice-search');
    modal.classList.remove('hidden');
    this.setVoiceLanguage(this.voiceLang || 'ta-IN');
    setTimeout(() => this.startSpeechListening(), 300);
  },

  closeVoiceModal() {
    this.stopSpeechListening();
    document.getElementById('modal-voice-search').classList.add('hidden');
  },

  setVoiceLanguage(lang) {
    this.voiceLang = lang;
    const taBtn = document.getElementById('voice-lang-ta');
    const enBtn = document.getElementById('voice-lang-en');
    if (lang === 'ta-IN') {
      taBtn.className = 'px-3 py-1 rounded-lg font-bold bg-white text-slate-900 shadow-2xs transition-all';
      enBtn.className = 'px-3 py-1 rounded-lg font-semibold text-slate-600 transition-all';
    } else {
      enBtn.className = 'px-3 py-1 rounded-lg font-bold bg-white text-slate-900 shadow-2xs transition-all';
      taBtn.className = 'px-3 py-1 rounded-lg font-semibold text-slate-600 transition-all';
    }
    if (this.speechRecognition) {
      this.stopSpeechListening();
      setTimeout(() => this.startSpeechListening(), 200);
    }
  },

  toggleSpeechListening() {
    if (this.speechRecognition) {
      this.stopSpeechListening();
    } else {
      this.startSpeechListening();
    }
  },

  startSpeechListening() {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      document.getElementById('voice-transcript-box').textContent = '⚠️ Voice search not supported in this browser. Use Chrome.';
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = this.voiceLang || 'ta-IN';
    recognition.interimResults = true;
    recognition.continuous = false;
    recognition.maxAlternatives = 3;

    const statusEl = document.getElementById('voice-status-heading');
    const transcriptBox = document.getElementById('voice-transcript-box');
    const pulseCircle = document.getElementById('voice-pulse-circle');
    const actionBtn = document.getElementById('voice-toggle-action-btn');

    statusEl.textContent = this.voiceLang === 'ta-IN' ? 'கேட்கிறது... பேசுங்கள்...' : 'Listening... Speak now...';
    pulseCircle.className = 'w-20 h-20 rounded-full bg-red-500/30 text-red-600 flex items-center justify-center mx-auto text-3xl shadow-lg ring-8 ring-red-100 animate-pulse transition-all';
    actionBtn.textContent = 'Stop Listening';

    recognition.onresult = (event) => {
      let finalTranscript = '';
      let interimTranscript = '';
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcript = event.results[i][0].transcript;
        if (event.results[i].isFinal) {
          finalTranscript += transcript;
        } else {
          interimTranscript += transcript;
        }
      }

      transcriptBox.innerHTML = finalTranscript
        ? `<span class="text-emerald-700 font-bold">"${finalTranscript}"</span>`
        : `<span class="text-amber-600 italic">"${interimTranscript}..."</span>`;

      if (finalTranscript) {
        const searchInput = document.getElementById('menu-search-input');
        if (searchInput) {
          searchInput.value = finalTranscript.trim();
          this.searchQuery = finalTranscript.trim();
          this.renderMenuGrid();
        }
        statusEl.textContent = '✅ ' + (this.voiceLang === 'ta-IN' ? 'குரல் கண்டறியப்பட்டது!' : 'Voice detected!');
        pulseCircle.className = 'w-20 h-20 rounded-full bg-emerald-500/20 text-emerald-600 flex items-center justify-center mx-auto text-3xl shadow-lg ring-8 ring-emerald-100 transition-all';
        actionBtn.textContent = 'Search Again';

        setTimeout(() => {
          this.closeVoiceModal();
          this.showToast(`Voice: "${finalTranscript.trim()}"`, '🎤');
        }, 1200);
      }
    };

    recognition.onerror = (event) => {
      console.warn('Speech recognition error:', event.error);
      if (event.error === 'no-speech') {
        statusEl.textContent = this.voiceLang === 'ta-IN' ? '🔇 குரல் கேட்கவில்லை, மீண்டும் முயற்சிக்கவும்' : '🔇 No speech detected. Try again.';
      } else if (event.error === 'not-allowed') {
        statusEl.textContent = '⚠️ Microphone access denied. Please allow mic permission.';
      } else {
        statusEl.textContent = `Error: ${event.error}`;
      }
      pulseCircle.className = 'w-20 h-20 rounded-full bg-amber-500/20 text-amber-600 flex items-center justify-center mx-auto text-3xl shadow-lg ring-8 ring-amber-100 transition-all';
      actionBtn.textContent = 'Restart Listening';
      this.speechRecognition = null;
    };

    recognition.onend = () => {
      this.speechRecognition = null;
      actionBtn.textContent = 'Restart Listening';
      pulseCircle.className = 'w-20 h-20 rounded-full bg-amber-500/20 text-amber-600 flex items-center justify-center mx-auto text-3xl shadow-lg ring-8 ring-amber-100 animate-pulse transition-all';
    };

    recognition.start();
    this.speechRecognition = recognition;
  },

  stopSpeechListening() {
    if (this.speechRecognition) {
      try { this.speechRecognition.stop(); } catch(e) { /* ignore */ }
      this.speechRecognition = null;
    }
    const actionBtn = document.getElementById('voice-toggle-action-btn');
    if (actionBtn) actionBtn.textContent = 'Restart Listening';
  },

  // ===== PHOTO SEARCH (Camera / Upload) =====
  openPhotoSearchModal() {
    const modal = document.getElementById('modal-photo-search');
    document.getElementById('photo-search-results').classList.add('hidden');
    document.getElementById('photo-matched-foods-list').innerHTML = '';
    const fileInput = document.getElementById('photo-file-input');
    if (fileInput) fileInput.value = '';
    // Reset upload zone
    const uploadZone = document.getElementById('photo-upload-zone');
    uploadZone.innerHTML = `
      <input type="file" id="photo-file-input" accept="image/*" class="hidden" onchange="App.handlePhotoUpload(event)">
      <div class="w-12 h-12 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center mx-auto text-xl mb-2">
        <i class="fa-solid fa-cloud-arrow-up"></i>
      </div>
      <p class="font-bold text-slate-800 text-sm">Click to Upload Photo or Snap Camera</p>
      <p class="text-[11px] text-slate-400 mt-0.5">Supports JPG, PNG, WEBP (Photo of any Indian food)</p>
    `;
    uploadZone.onclick = () => document.getElementById('photo-file-input').click();
    modal.classList.remove('hidden');
  },

  closePhotoSearchModal() {
    document.getElementById('modal-photo-search').classList.add('hidden');
  },

  async handlePhotoUpload(event) {
    const file = event.target.files[0];
    if (!file) return;

    const uploadZone = document.getElementById('photo-upload-zone');
    uploadZone.innerHTML = `
      <div class="flex items-center justify-center gap-3 py-2">
        <div class="w-8 h-8 border-3 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
        <span class="text-sm font-bold text-indigo-700">Analyzing photo...</span>
      </div>
    `;

    try {
      const queryHint = file.name.replace(/\.[^/.]+$/, '').replace(/[_-]/g, ' ');
      const res = await API.searchByPhoto({ queryHint });

      if (res.success && res.data) {
        this.renderPhotoSearchResults(res.data, file);
      } else {
        uploadZone.innerHTML = `
          <p class="text-red-600 font-bold">❌ Could not identify food. Try another photo.</p>
          <button onclick="document.getElementById('photo-file-input').click()" class="mt-2 px-4 py-2 bg-indigo-600 text-white rounded-xl text-xs font-bold">Try Again</button>
        `;
      }
    } catch (err) {
      console.error('Photo search error:', err);
      uploadZone.innerHTML = `
        <p class="text-red-600 font-bold">❌ Photo search failed. Please try again.</p>
        <button onclick="document.getElementById('photo-file-input').click()" class="mt-2 px-4 py-2 bg-indigo-600 text-white rounded-xl text-xs font-bold">Try Again</button>
      `;
    }
  },

  async testSamplePhoto(name, imgUrl) {
    const uploadZone = document.getElementById('photo-upload-zone');
    uploadZone.innerHTML = `
      <div class="flex items-center justify-center gap-3 py-2">
        <div class="w-8 h-8 border-3 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
        <span class="text-sm font-bold text-indigo-700">Detecting: ${name}...</span>
      </div>
    `;

    try {
      const res = await API.searchByPhoto({ queryHint: name });
      if (res.success && res.data) {
        this.renderPhotoSearchResults(res.data, null, imgUrl, name);
      }
    } catch (err) {
      console.error('Sample photo search error:', err);
      uploadZone.innerHTML = `<p class="text-red-600 font-bold">Search failed. Try again.</p>`;
    }
  },

  renderPhotoSearchResults(data, file, sampleImgUrl, sampleName) {
    const resultsDiv = document.getElementById('photo-search-results');
    const previewImg = document.getElementById('photo-preview-img');
    const detectedLabel = document.getElementById('photo-detected-label');
    const confidenceEl = document.getElementById('photo-confidence');
    const matchedList = document.getElementById('photo-matched-foods-list');
    const uploadZone = document.getElementById('photo-upload-zone');

    uploadZone.innerHTML = `
      <input type="file" id="photo-file-input" accept="image/*" class="hidden" onchange="App.handlePhotoUpload(event)">
      <div class="w-12 h-12 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto text-xl mb-2">
        <i class="fa-solid fa-check"></i>
      </div>
      <p class="font-bold text-emerald-800 text-sm">✅ Food Detected Successfully!</p>
      <p class="text-[11px] text-slate-400 mt-0.5 cursor-pointer underline" onclick="document.getElementById('photo-file-input').click()">Click to search another photo</p>
    `;

    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => { previewImg.src = e.target.result; };
      reader.readAsDataURL(file);
    } else if (sampleImgUrl) {
      previewImg.src = sampleImgUrl;
    }

    detectedLabel.textContent = data.detectedFood || sampleName || 'Indian Food';
    confidenceEl.textContent = `${data.confidence || 92}% Match`;

    const matches = data.matchedFoods || [];
    if (matches.length === 0) {
      matchedList.innerHTML = '<p class="text-slate-400 italic py-2">No matching items found in our menu.</p>';
    } else {
      matchedList.innerHTML = matches.map(food => `
        <div class="flex items-center justify-between p-2.5 rounded-xl border border-slate-200 bg-white hover:bg-amber-50 hover:border-amber-200 transition-all">
          <div class="flex items-center gap-2.5">
            <span class="${food.isVeg ? 'veg-indicator' : 'non-veg-indicator'} scale-75"></span>
            <div>
              <p class="text-xs font-bold text-slate-900">${food.name}</p>
              <p class="text-[10px] text-slate-500">${food.category || ''} • ₹${food.price}</p>
            </div>
          </div>
          <button onclick="App.addToCart('${food.id}'); App.showToast('${food.name} added!', '🛒')" 
            class="px-3 py-1.5 bg-amber-500 hover:bg-amber-600 text-white text-[10px] font-bold rounded-lg transition-all shadow-xs">
            + Add
          </button>
        </div>
      `).join('');
    }

    resultsDiv.classList.remove('hidden');
  },

  // ===== BILL RECEIPT MODAL =====
  openBillModal(bill) {
    if (!bill) return;
    this.activeBill = bill;
    this.renderBillReceipt(bill);
    document.getElementById('modal-bill-receipt').classList.remove('hidden');
  },

  closeBillModal() {
    document.getElementById('modal-bill-receipt').classList.add('hidden');
    this.activeBill = null;
  },

  renderBillReceipt(bill) {
    if (!bill) return;

    const hotel = this.hotelInfo || {};
    const hotelNameEl = document.getElementById('bill-hotel-name');
    const hotelAddrEl = document.getElementById('bill-hotel-address');
    if (hotelNameEl) hotelNameEl.textContent = hotel.name || 'The Grand Pavilion & Bistro';
    if (hotelAddrEl) hotelAddrEl.textContent = hotel.address || '';

    document.getElementById('bill-number').textContent = bill.billNumber || bill.billId || bill.id || 'N/A';
    document.getElementById('bill-date').textContent = bill.date || new Date(bill.createdAt || Date.now()).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });

    document.getElementById('bill-cust-name').textContent = bill.customerName || 'Customer';
    document.getElementById('bill-cust-phone').textContent = bill.customerPhone || '';
    document.getElementById('bill-cust-address').textContent = bill.deliveryAddress || bill.address || 'N/A';

    const isOnline = bill.orderType === 'online' || (bill.orderId && bill.orderId.startsWith('ORD'));
    document.getElementById('bill-order-type').textContent = isOnline ? 'Online Delivery' : 'Offline / Hotel Pickup';
    document.getElementById('bill-order-id').textContent = bill.orderId || bill.id || '';

    const payBadge = document.getElementById('bill-payment-badge');
    const payMethod = bill.paymentMethod || 'Cash';
    const payStatus = bill.paymentStatus || 'Pending';
    payBadge.textContent = `${payMethod} • ${payStatus}`;
    payBadge.className = payStatus === 'Paid'
      ? 'px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800'
      : 'px-2 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-800';

    const tbody = document.getElementById('bill-items-tbody');
    const items = bill.items || [];
    tbody.innerHTML = items.map((item, idx) => `
      <tr>
        <td class="py-2 px-3">
          <span class="${item.isVeg !== false ? 'text-emerald-600' : 'text-red-600'} mr-1">●</span>
          ${item.name || 'Item ' + (idx + 1)}
        </td>
        <td class="py-2 px-2 text-center font-semibold">${item.quantity || 1}</td>
        <td class="py-2 px-2 text-right">₹${(item.price || 0).toFixed(2)}</td>
        <td class="py-2 px-3 text-right font-bold">₹${((item.price || 0) * (item.quantity || 1)).toFixed(2)}</td>
      </tr>
    `).join('');

    const subtotal = bill.subtotal || items.reduce((sum, it) => sum + ((it.price || 0) * (it.quantity || 1)), 0);
    const deliveryCharge = bill.deliveryCharge || 0;
    const tax = bill.tax || bill.gst || 0;
    const grandTotal = bill.grandTotal || bill.total || (subtotal + deliveryCharge + tax);

    document.getElementById('bill-subtotal-val').textContent = `₹${subtotal.toFixed(2)}`;
    document.getElementById('bill-delivery-val').textContent = deliveryCharge === 0 ? 'FREE' : `₹${deliveryCharge.toFixed(2)}`;
    document.getElementById('bill-tax-val').textContent = `₹${tax.toFixed(2)}`;
    document.getElementById('bill-grand-total-val').textContent = `₹${grandTotal.toFixed(2)}`;

    const status = bill.status || bill.trackingStatus || 'Order Placed';
    const steps = isOnline
      ? ['Order Placed', 'Preparing', 'Out for Delivery', 'Delivered']
      : ['Order Placed', 'Preparing', 'Ready for Pickup', 'Completed'];
    const currentIdx = steps.findIndex(s => s.toLowerCase() === status.toLowerCase());
    const stepperRow = document.getElementById('bill-stepper-row');
    if (stepperRow) {
      stepperRow.innerHTML = steps.map((step, i) => {
        const done = i <= currentIdx;
        const current = i === currentIdx;
        let cls = 'text-slate-400';
        if (done) cls = 'text-emerald-700';
        if (current) cls = 'text-amber-700 font-black';
        const prefix = done && !current ? '✓ ' : '';
        return `<span class="${cls}">${prefix}${step}</span>`;
      }).join('<span class="text-slate-400">➔</span>');
    }
  },

  showToast(message, icon = '✨') {
    const toast = document.getElementById('toast');
    const toastMsg = document.getElementById('toast-msg');
    const toastIcon = document.getElementById('toast-icon');
    if (!toast) return;

    toastMsg.textContent = message;
    toastIcon.textContent = icon;

    toast.classList.remove('translate-y-20', 'opacity-0');
    toast.classList.add('translate-y-0', 'opacity-100');

    setTimeout(() => {
      toast.classList.remove('translate-y-0', 'opacity-100');
      toast.classList.add('translate-y-20', 'opacity-0');
    }, 2800);
  }
};
