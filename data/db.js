const fs = require('fs');
const path = require('path');
const {
  defaultMenu,
  defaultHotelInfo,
  defaultOnlineOrders,
  defaultOfflineOrders
} = require('./defaultData');

const DATA_DIR = __dirname;
const DB_PATH = path.join(DATA_DIR, 'db.json');
const FOODS_PATH = path.join(DATA_DIR, 'foods.json');
const CUSTOMERS_PATH = path.join(DATA_DIR, 'customers.json');
const ORDERS_PATH = path.join(DATA_DIR, 'orders.json');
const BILLS_PATH = path.join(DATA_DIR, 'bills.json');

// Helper to safely read JSON file
function readJson(filePath, defaultValue) {
  try {
    if (!fs.existsSync(filePath)) {
      fs.writeFileSync(filePath, JSON.stringify(defaultValue, null, 2), 'utf-8');
      return defaultValue;
    }
    const raw = fs.readFileSync(filePath, 'utf-8');
    return JSON.parse(raw);
  } catch (err) {
    console.error(`Error reading ${filePath}:`, err);
    return defaultValue;
  }
}

// Helper to write JSON file safely
function writeJson(filePath, data) {
  try {
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf-8');
  } catch (err) {
    console.error(`Error writing ${filePath}:`, err);
  }
}

// Initialize all 4 JSON files if missing
function initAllJson() {
  if (!fs.existsSync(FOODS_PATH)) {
    writeJson(FOODS_PATH, defaultMenu);
  }
  if (!fs.existsSync(CUSTOMERS_PATH)) {
    writeJson(CUSTOMERS_PATH, []);
  }
  if (!fs.existsSync(ORDERS_PATH)) {
    writeJson(ORDERS_PATH, [...defaultOnlineOrders, ...defaultOfflineOrders]);
  }
  if (!fs.existsSync(BILLS_PATH)) {
    writeJson(BILLS_PATH, []);
  }
}

initAllJson();

// --- 1. HOTEL INFO & TIMING (OPEN / CLOSED STATUS) ---
function getHotelTimingStatus() {
  const hotel = getHotelInfo();
  // Standard opening hours: 10:30 AM to 11:00 PM (10:30 to 23:00)
  const now = new Date();
  const currentHours = now.getHours();
  const currentMins = now.getMinutes();
  const currentTimeVal = currentHours * 60 + currentMins;

  // 10:30 AM = 10 * 60 + 30 = 630
  // 11:00 PM = 23 * 60 = 1380
  const openTimeVal = 10 * 60 + 30;
  const closeTimeVal = 23 * 60;

  const isOpen = currentTimeVal >= openTimeVal && currentTimeVal < closeTimeVal;

  return {
    isOpen,
    statusText: isOpen ? 'OPEN NOW' : 'CLOSED NOW',
    badgeClass: isOpen ? 'bg-emerald-500 text-white' : 'bg-rose-500 text-white',
    openTime: '10:30 AM',
    closeTime: '11:00 PM',
    timings: hotel.timings || '10:30 AM – 11:00 PM',
    nextChange: isOpen ? 'Closes at 11:00 PM' : 'Opens tomorrow at 10:30 AM',
    hotelName: hotel.name,
    address: hotel.address,
    phone: hotel.phone
  };
}

function getHotelInfo() {
  const db = readJson(DB_PATH, { hotelInfo: defaultHotelInfo });
  return db.hotelInfo || defaultHotelInfo;
}

function updateHotelInfo(info) {
  const db = readJson(DB_PATH, { hotelInfo: defaultHotelInfo });
  db.hotelInfo = { ...db.hotelInfo, ...info };
  writeJson(DB_PATH, db);
  return db.hotelInfo;
}

// --- 2. FOODS DATABASE (foods.json) ---
function getFoods() {
  return readJson(FOODS_PATH, defaultMenu);
}

function getMenu() {
  return getFoods();
}

function addMenuItem(item) {
  const foods = getFoods();
  const newItem = {
    id: 'item-' + Date.now(),
    name: item.name,
    category: item.category || 'Main Course',
    price: Number(item.price),
    isVeg: Boolean(item.isVeg),
    description: item.description || '',
    image: item.image || 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?auto=format&fit=crop&w=600&q=80',
    prepTime: item.prepTime || '15 mins',
    available: item.available !== undefined ? item.available : true,
    tags: item.tags || [item.isVeg ? 'veg' : 'non veg', (item.category || '').toLowerCase()]
  };
  foods.push(newItem);
  writeJson(FOODS_PATH, foods);
  return newItem;
}

function updateMenuItem(id, updateData) {
  const foods = getFoods();
  const idx = foods.findIndex(m => m.id === id);
  if (idx === -1) return null;
  foods[idx] = { ...foods[idx], ...updateData };
  writeJson(FOODS_PATH, foods);
  return foods[idx];
}

function deleteMenuItem(id) {
  const foods = getFoods();
  const updated = foods.filter(m => m.id !== id);
  writeJson(FOODS_PATH, updated);
  return true;
}

// --- 3. CUSTOMERS DATABASE (customers.json) ---
function getCustomers() {
  return readJson(CUSTOMERS_PATH, []);
}

function upsertCustomer(name, phone, address) {
  const customers = getCustomers();
  let cust = customers.find(c => c.phone === phone);
  if (cust) {
    cust.name = name || cust.name;
    cust.address = address || cust.address;
    cust.totalOrders = (cust.totalOrders || 0) + 1;
    cust.lastOrderAt = new Date().toISOString();
  } else {
    cust = {
      id: `CUST-${1000 + customers.length + 1}`,
      name,
      phone,
      address: address || '',
      totalOrders: 1,
      createdAt: new Date().toISOString(),
      lastOrderAt: new Date().toISOString()
    };
    customers.push(cust);
  }
  writeJson(CUSTOMERS_PATH, customers);
  return cust;
}

// --- 4. BILLS DATABASE (bills.json) ---
function getBills() {
  return readJson(BILLS_PATH, []);
}

function getBillById(billId) {
  const bills = getBills();
  return bills.find(b => b.billId.toLowerCase() === billId.trim().toLowerCase()) || null;
}

function generateBillForOrder(order) {
  const bills = getBills();
  const billId = `BILL-${new Date().getFullYear()}-${1000 + bills.length + 1}`;

  const bill = {
    billId,
    orderId: order.id,
    orderType: order.orderType || (order.id.startsWith('ORD') ? 'Online Delivery' : 'Offline Hotel Pickup'),
    customer: {
      name: order.customerName || (order.customer && order.customer.name),
      phone: order.customerPhone || (order.customer && order.customer.phone),
      address: order.deliveryAddress || (order.customer && order.customer.address) || 'Hotel Collection'
    },
    items: (order.items || []).map(it => ({
      name: it.name,
      price: it.price,
      quantity: it.quantity,
      total: it.price * it.quantity,
      isVeg: it.isVeg
    })),
    subtotal: order.itemTotal || order.subtotal || 0,
    tax: order.tax || 0,
    deliveryCharge: order.deliveryCharge || 0,
    grandTotal: order.grandTotal || 0,
    paymentMethod: order.paymentMethod || 'Cash',
    paymentStatus: order.paymentStatus || 'Pending',
    generatedAt: new Date().toISOString()
  };

  bills.unshift(bill);
  writeJson(BILLS_PATH, bills);
  return bill;
}

// --- 5. ORDERS DATABASE (orders.json) ---
function getAllOrders() {
  const orders = readJson(ORDERS_PATH, []);
  if (!Array.isArray(orders)) return [];

  const normalizedOrders = orders.map(order => {
    const isOnline = order.id && order.id.startsWith('ORD');
    const customer = order.customer || {};
    return {
      ...order,
      customerName: order.customerName || customer.name || '',
      customerPhone: order.customerPhone || customer.phone || '',
      deliveryAddress: order.deliveryAddress || customer.address || '',
      ...(isOnline ? {
        deliveryStatus: order.deliveryStatus || order.status || order.trackingStatus || 'Order Placed'
      } : {})
    };
  });

  if (JSON.stringify(orders) !== JSON.stringify(normalizedOrders)) {
    writeJson(ORDERS_PATH, normalizedOrders);
  }
  return normalizedOrders;
}

function getOnlineOrders() {
  const all = getAllOrders();
  return all
    .filter(o => o.id.startsWith('ORD') || o.orderType === 'Online Delivery')
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
}

function getOfflineOrders() {
  const all = getAllOrders();
  return all
    .filter(o => o.id.startsWith('TKN') || o.orderType === 'Offline Hotel Pickup')
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
}

function getOrderById(id) {
  const all = getAllOrders();
  return all.find(o => o.id.toLowerCase() === id.trim().toLowerCase()) || null;
}

function getOnlineOrderById(id) {
  return getOrderById(id);
}

function getOfflineOrderById(id) {
  return getOrderById(id);
}

function createOnlineOrder(orderData) {
  const all = getAllOrders();
  const onlineCount = all.filter(o => o.id.startsWith('ORD')).length;
  const orderId = `ORD-${new Date().getFullYear()}-${1001 + onlineCount}`;

  const hotel = getHotelInfo();
  const items = orderData.items || [];
  const itemTotal = items.reduce((sum, it) => sum + (it.price * it.quantity), 0);
  const tax = Math.round((itemTotal * (hotel.taxPercent || 5) / 100) * 100) / 100;
  const deliveryCharge = itemTotal >= (hotel.freeDeliveryThreshold || 500) ? 0 : (hotel.deliveryCharge || 40);
  const grandTotal = Math.round((itemTotal + tax + deliveryCharge) * 100) / 100;

  // Upsert Customer in customers.json
  upsertCustomer(orderData.customerName, orderData.customerPhone, orderData.deliveryAddress);

  const newOrder = {
    id: orderId,
    orderType: 'Online Delivery',
    customerName: orderData.customerName,
    customerPhone: orderData.customerPhone,
    deliveryAddress: orderData.deliveryAddress,
    customer: {
      name: orderData.customerName,
      phone: orderData.customerPhone,
      address: orderData.deliveryAddress
    },
    items,
    itemTotal,
    subtotal: itemTotal,
    tax,
    deliveryCharge,
    grandTotal,
    paymentMethod: orderData.paymentMethod || 'Cash on Delivery',
    paymentStatus: (orderData.paymentMethod === 'UPI' || orderData.paymentMethod === 'Online' || orderData.paymentMethod === 'Online Payment') ? 'Paid' : 'Pending',
    trackingStatus: 'Order Placed',
    deliveryStatus: 'Order Placed',
    estimatedTime: `${hotel.estimatedDeliveryMins || 35} mins`,
    specialInstructions: orderData.specialInstructions || '',
    createdAt: new Date().toISOString(),
    statusHistory: [
      { status: 'Order Placed', time: new Date().toISOString() }
    ]
  };

  // Generate official bill in bills.json
  const bill = generateBillForOrder(newOrder);
  newOrder.billId = bill.billId;

  all.unshift(newOrder);
  writeJson(ORDERS_PATH, all);

  // Sync to db.json for backwards compatibility
  syncToLegacyDb();

  return { ...newOrder, bill };
}

function createOfflineOrder(orderData) {
  const all = getAllOrders();
  const offlineCount = all.filter(o => o.id.startsWith('TKN')).length;
  const tokenId = `TKN-${101 + offlineCount}`;

  const hotel = getHotelInfo();
  const items = orderData.items || [];
  const itemTotal = items.reduce((sum, it) => sum + (it.price * it.quantity), 0);
  const tax = itemTotal > 0 ? Math.round((itemTotal * (hotel.taxPercent || 5) / 100) * 100) / 100 : 0;
  const grandTotal = Math.round((itemTotal + tax) * 100) / 100;

  // Upsert Customer
  upsertCustomer(orderData.customerName, orderData.customerPhone, 'Hotel Counter Pickup');

  const newOfflineOrder = {
    id: tokenId,
    orderType: 'Offline Hotel Pickup',
    customerName: orderData.customerName,
    customerPhone: orderData.customerPhone,
    customer: {
      name: orderData.customerName,
      phone: orderData.customerPhone,
      address: 'Hotel Counter Collection'
    },
    visitType: orderData.visitType || 'Takeaway',
    visitTiming: orderData.visitTiming || 'Visiting Now',
    items,
    itemTotal,
    subtotal: itemTotal,
    tax,
    deliveryCharge: 0,
    grandTotal,
    paymentMethod: orderData.paymentMethod || 'Cash at Hotel',
    paymentStatus: orderData.paymentStatus || 'Pending',
    trackingStatus: 'Order Placed',
    status: 'Token Issued',
    createdAt: new Date().toISOString(),
    statusHistory: [
      { status: 'Order Placed', time: new Date().toISOString() }
    ]
  };

  // Generate bill in bills.json
  const bill = generateBillForOrder(newOfflineOrder);
  newOfflineOrder.billId = bill.billId;

  all.unshift(newOfflineOrder);
  writeJson(ORDERS_PATH, all);

  syncToLegacyDb();

  return { ...newOfflineOrder, bill };
}

function updateOnlineOrderStatus(id, newStatus, paymentStatus) {
  const all = getAllOrders();
  const order = all.find(o => o.id.toLowerCase() === id.trim().toLowerCase());
  if (!order) return null;

  if (newStatus && order.deliveryStatus !== newStatus) {
    order.deliveryStatus = newStatus;
    // Map trackingStatus pipeline: Order Placed -> Preparing -> Out for Delivery -> Completed
    order.trackingStatus = newStatus === 'Delivered' ? 'Completed' : newStatus;
    if (!order.statusHistory) order.statusHistory = [];
    order.statusHistory.push({ status: newStatus, time: new Date().toISOString() });
    if (newStatus === 'Delivered' && (order.paymentMethod === 'Cash on Delivery' || order.paymentMethod === 'Cash')) {
      order.paymentStatus = 'Paid';
    }
  }

  if (paymentStatus) {
    order.paymentStatus = paymentStatus;
  }

  writeJson(ORDERS_PATH, all);
  syncToLegacyDb();
  return order;
}

function updateOfflineOrderStatus(id, newStatus, paymentStatus, paymentMethod) {
  const all = getAllOrders();
  const order = all.find(o => o.id.toLowerCase() === id.trim().toLowerCase());
  if (!order) return null;

  if (newStatus && order.status !== newStatus) {
    order.status = newStatus;
    // Map trackingStatus pipeline: Order Placed -> Preparing -> Ready for Pickup -> Completed
    if (newStatus === 'Token Issued') order.trackingStatus = 'Order Placed';
    else if (newStatus === 'Preparing') order.trackingStatus = 'Preparing';
    else if (newStatus === 'Ready for Pickup') order.trackingStatus = 'Ready for Pickup';
    else if (newStatus === 'Completed') order.trackingStatus = 'Completed';

    if (!order.statusHistory) order.statusHistory = [];
    order.statusHistory.push({ status: newStatus, time: new Date().toISOString() });
  }

  if (paymentStatus) order.paymentStatus = paymentStatus;
  if (paymentMethod) order.paymentMethod = paymentMethod;

  writeJson(ORDERS_PATH, all);
  syncToLegacyDb();
  return order;
}

// Sync back to db.json so anything reading db.json directly remains 100% synchronized
function syncToLegacyDb() {
  try {
    const db = readJson(DB_PATH, {});
    db.menu = getFoods();
    db.onlineOrders = getOnlineOrders();
    db.offlineOrders = getOfflineOrders();
    db.bills = getBills();
    db.customers = getCustomers();
    writeJson(DB_PATH, db);
  } catch (e) {
    console.error('Sync error:', e);
  }
}

// --- 6. ADMIN DASHBOARD STATS ---
function getDashboardStats() {
  const onlineOrders = getOnlineOrders();
  const offlineOrders = getOfflineOrders();

  const totalOnlineOrders = onlineOrders.length;
  const totalOfflineOrders = offlineOrders.length;

  const pendingOnline = onlineOrders.filter(o => o.deliveryStatus !== 'Delivered' && o.deliveryStatus !== 'Cancelled').length;
  const pendingOffline = offlineOrders.filter(o => o.status !== 'Completed' && o.status !== 'Cancelled').length;
  const pendingOrders = pendingOnline + pendingOffline;

  const completedOnline = onlineOrders.filter(o => o.deliveryStatus === 'Delivered').length;
  const completedOffline = offlineOrders.filter(o => o.status === 'Completed').length;
  const completedOrders = completedOnline + completedOffline;

  const today = new Date().toISOString().split('T')[0];

  const onlineSalesToday = onlineOrders
    .filter(o => (o.createdAt || '').split('T')[0] === today && o.paymentStatus === 'Paid')
    .reduce((sum, o) => sum + (o.grandTotal || 0), 0);

  const offlineSalesToday = offlineOrders
    .filter(o => (o.createdAt || '').split('T')[0] === today && o.paymentStatus === 'Paid')
    .reduce((sum, o) => sum + (o.grandTotal || 0), 0);

  const todaySales = Math.round((onlineSalesToday + offlineSalesToday) * 100) / 100;

  return {
    totalOnlineOrders,
    totalOfflineOrders,
    pendingOrders,
    completedOrders,
    todaySales,
    breakdown: {
      pendingOnline,
      pendingOffline,
      completedOnline,
      completedOffline,
      onlineSalesToday,
      offlineSalesToday
    }
  };
}

module.exports = {
  getHotelTimingStatus,
  getHotelInfo,
  updateHotelInfo,
  getFoods,
  getMenu,
  addMenuItem,
  updateMenuItem,
  deleteMenuItem,
  getCustomers,
  upsertCustomer,
  getBills,
  getBillById,
  generateBillForOrder,
  getAllOrders,
  getOnlineOrders,
  getOnlineOrderById,
  createOnlineOrder,
  updateOnlineOrderStatus,
  getOfflineOrders,
  getOfflineOrderById,
  createOfflineOrder,
  updateOfflineOrderStatus,
  getDashboardStats
};
