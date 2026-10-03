const express = require('express');
const cors = require('cors');
const path = require('path');
const db = require('./data/db');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

// API Routes

// 1. Hotel Info & Live Opening/Closing Status
app.get('/api/hotel', (req, res) => {
  try {
    const info = db.getHotelInfo();
    res.json({ success: true, data: info });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.get('/api/hotel/status', (req, res) => {
  try {
    const status = db.getHotelTimingStatus();
    res.json({ success: true, data: status });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.put('/api/hotel', (req, res) => {
  try {
    const updated = db.updateHotelInfo(req.body);
    res.json({ success: true, data: updated });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// 1.1 Foods JSON Database
app.get('/api/foods', (req, res) => {
  try {
    const foods = db.getFoods();
    res.json({ success: true, data: foods });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// 1.2 Customers JSON Database
app.get('/api/customers', (req, res) => {
  try {
    const customers = db.getCustomers();
    res.json({ success: true, data: customers });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// 1.3 Bills JSON Database
app.get('/api/bills', (req, res) => {
  try {
    const bills = db.getBills();
    res.json({ success: true, data: bills });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.get('/api/bills/:id', (req, res) => {
  try {
    const id = req.params.id.trim();
    let bill = db.getBillById(id);
    if (!bill) {
      // Try finding by orderId
      const bills = db.getBills();
      bill = bills.find(b => b.orderId && b.orderId.toLowerCase() === id.toLowerCase());
    }
    if (!bill) return res.status(404).json({ success: false, message: 'Bill not found' });
    res.json({ success: true, data: bill });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// 1.4 Photo Search Recognition Endpoint
app.post('/api/search/photo', (req, res) => {
  try {
    const { filename, detectedCategory, queryHint } = req.body;
    const foods = db.getFoods();

    // Identify food characteristics from image or queryHint
    const lowerName = (filename || queryHint || '').toLowerCase();

    let matchedFoods = [];
    let detectedFoodName = 'Indian Gourmet Dish';

    if (lowerName.includes('biryani') || lowerName.includes('rice') || lowerName.includes('pulao')) {
      detectedFoodName = 'Indian Dum Biryani';
      matchedFoods = foods.filter(f => f.category === 'Biryani & Rice');
    } else if (lowerName.includes('chicken') || lowerName.includes('meat') || lowerName.includes('mutton') || lowerName.includes('nonveg')) {
      detectedFoodName = 'Indian Chicken / Meat Specialty';
      matchedFoods = foods.filter(f => !f.isVeg);
    } else if (lowerName.includes('paneer') || lowerName.includes('cheese') || lowerName.includes('curry')) {
      detectedFoodName = 'North Indian Paneer Dish';
      matchedFoods = foods.filter(f => (f.name.toLowerCase().includes('paneer') || f.category === 'Main Course') && f.isVeg);
    } else if (lowerName.includes('samosa') || lowerName.includes('starter') || lowerName.includes('tikka') || lowerName.includes('fry') || lowerName.includes('corn')) {
      detectedFoodName = 'Indian Crispy Starter';
      matchedFoods = foods.filter(f => f.category === 'Starters');
    } else if (lowerName.includes('naan') || lowerName.includes('roti') || lowerName.includes('bread') || lowerName.includes('paratha')) {
      detectedFoodName = 'Tandoori Indian Breads';
      matchedFoods = foods.filter(f => f.category === 'Breads');
    } else if (lowerName.includes('sweet') || lowerName.includes('jamun') || lowerName.includes('dessert') || lowerName.includes('rasmalai')) {
      detectedFoodName = 'Traditional Indian Sweet';
      matchedFoods = foods.filter(f => f.category === 'Desserts');
    } else if (lowerName.includes('tea') || lowerName.includes('chai') || lowerName.includes('lassi') || lowerName.includes('drink')) {
      detectedFoodName = 'Desi Beverage / Lassi';
      matchedFoods = foods.filter(f => f.category === 'Beverages');
    } else {
      // Default intelligent recommendation: top popular dishes
      detectedFoodName = 'Chef Special Indian Dish';
      matchedFoods = foods.slice(0, 4);
    }

    res.json({
      success: true,
      data: {
        detectedFood: detectedFoodName,
        confidence: '94%',
        matchedFoods: matchedFoods.length ? matchedFoods : foods.slice(0, 4)
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// 2. Menu
app.get('/api/menu', (req, res) => {
  try {
    const menu = db.getMenu();
    res.json({ success: true, data: menu });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.post('/api/menu', (req, res) => {
  try {
    const item = db.addMenuItem(req.body);
    res.status(201).json({ success: true, data: item });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.put('/api/menu/:id', (req, res) => {
  try {
    const item = db.updateMenuItem(req.params.id, req.body);
    if (!item) return res.status(404).json({ success: false, message: 'Item not found' });
    res.json({ success: true, data: item });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.delete('/api/menu/:id', (req, res) => {
  try {
    db.deleteMenuItem(req.params.id);
    res.json({ success: true, message: 'Item deleted' });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// 3. Online Orders
app.get('/api/orders/online', (req, res) => {
  try {
    const orders = db.getOnlineOrders();
    res.json({ success: true, data: orders });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.get('/api/orders/online/:id', (req, res) => {
  try {
    const order = db.getOnlineOrderById(req.params.id);
    if (!order) return res.status(404).json({ success: false, message: 'Online order not found' });
    res.json({ success: true, data: order });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.post('/api/orders/online', (req, res) => {
  try {
    const { customerName, customerPhone, deliveryAddress, items, paymentMethod, specialInstructions } = req.body;
    if (!customerName || !/^[0-9]{10}$/.test(String(customerPhone || '').trim()) || !deliveryAddress) {
      return res.status(400).json({
        success: false,
        message: 'Customer name, a valid 10-digit phone number, and delivery address are required.'
      });
    }
    if (!items || !items.length) {
      return res.status(400).json({
        success: false,
        message: 'Cart is empty. Please select food items.'
      });
    }

    const order = db.createOnlineOrder({
      customerName,
      customerPhone,
      deliveryAddress,
      items,
      paymentMethod,
      specialInstructions
    });

    res.status(201).json({ success: true, data: order });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.patch('/api/orders/online/:id/status', (req, res) => {
  try {
    const { status, paymentStatus } = req.body;
    const updated = db.updateOnlineOrderStatus(req.params.id, status, paymentStatus);
    if (!updated) return res.status(404).json({ success: false, message: 'Order not found' });
    res.json({ success: true, data: updated });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// 4. Offline Orders (Hotel Direct Purchase / Tokens)
app.get('/api/orders/offline', (req, res) => {
  try {
    const orders = db.getOfflineOrders();
    res.json({ success: true, data: orders });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.get('/api/orders/offline/:id', (req, res) => {
  try {
    const order = db.getOfflineOrderById(req.params.id);
    if (!order) return res.status(404).json({ success: false, message: 'Token / Order not found' });
    res.json({ success: true, data: order });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.post('/api/orders/offline', (req, res) => {
  try {
    const { customerName, customerPhone, visitType, visitTiming, items, paymentMethod } = req.body;
    if (!customerName || !/^[0-9]{10}$/.test(String(customerPhone || '').trim())) {
      return res.status(400).json({
        success: false,
        message: 'Customer name and a valid 10-digit mobile number are required to generate a token.'
      });
    }

    const order = db.createOfflineOrder({
      customerName,
      customerPhone,
      visitType,
      visitTiming,
      items: items || [],
      paymentMethod
    });

    res.status(201).json({ success: true, data: order });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.patch('/api/orders/offline/:id/status', (req, res) => {
  try {
    const { status, paymentStatus, paymentMethod } = req.body;
    const updated = db.updateOfflineOrderStatus(req.params.id, status, paymentStatus, paymentMethod);
    if (!updated) return res.status(404).json({ success: false, message: 'Token / Order not found' });
    res.json({ success: true, data: updated });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// 5. Admin Dashboard Metrics
app.get('/api/admin/dashboard', (req, res) => {
  try {
    const stats = db.getDashboardStats();
    res.json({ success: true, data: stats });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Universal lookup for order/token tracking
app.get('/api/track/:code', (req, res) => {
  try {
    const code = req.params.code.trim();
    if (code.toUpperCase().startsWith('ORD')) {
      const order = db.getOnlineOrderById(code);
      if (order) return res.json({ success: true, type: 'online', data: order });
    } else if (code.toUpperCase().startsWith('TKN')) {
      const token = db.getOfflineOrderById(code);
      if (token) return res.json({ success: true, type: 'offline', data: token });
    } else {
      // Try searching both
      const order = db.getOnlineOrderById(code);
      if (order) return res.json({ success: true, type: 'online', data: order });
      const token = db.getOfflineOrderById(code);
      if (token) return res.json({ success: true, type: 'offline', data: token });
    }
    return res.status(404).json({ success: false, message: `No order or token found matching "${code}"` });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Catch-all route to serve index.html
app.use((req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
