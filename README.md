# 🏨 Grand Pavilion Hotel & Restaurant Management System

A full-stack Hotel & Food Order Management System providing two distinct ordering flows (**Online Doorstep Delivery** and **Offline / Hotel Direct Purchase**) with a dedicated, separated **Admin Order Management Dashboard**.

---

## 🌟 Key Features

### 1. 🛵 ONLINE DELIVERY
* **Browse Full Menu**: Categorized dishes (Starters, Main Course, Biryani, Breads, Desserts, Beverages) with Veg/Non-Veg indicators and pricing.
* **Interactive Cart & Delivery Calculation**:
  * Real-time cart calculations including 5% GST.
  * **Delivery Charge**: ₹40 (Automatically waived / **FREE delivery** on orders above ₹500).
  * **Estimated Delivery Time**: 30 – 40 minutes with countdown display.
* **Customer Details Form**:
  * Full Name
  * 10-digit Mobile Number
  * Delivery Address (House/Street/Landmark/City)
  * Special instructions for kitchen/rider
* **Payment Methods**:
  * **UPI** (Google Pay, PhonePe, Paytm QR simulation)
  * **Online Payment** (Credit / Debit Card / Net Banking)
  * **Cash on Delivery (COD)**
* **Unique Order Number Generation**: E.g., `ORD-2026-1005`.
* **Live 4-Step Delivery Status Tracker**:
  1. 📝 **Order Placed**
  2. 👨‍🍳 **Preparing**
  3. 🛵 **Out for Delivery**
  4. ✅ **Delivered**

---

### 2. 🏬 OFFLINE / HOTEL DIRECT PURCHASE
* **Switch with 1-Click**: Customers can select the **"Offline / Visit Hotel"** toggle on the navigation bar or mobile banner.
* **Hotel Information Card**:
  * **Hotel Address**: Plot 42, Heritage Avenue, Near Central Park, Connaught Place, New Delhi - 110001
  * **Available Timings**: Monday – Sunday: 10:30 AM to 11:00 PM
  * Dine-in and Express Takeaway counters
* **Browse Before Visiting**: Customers can view the entire menu with prices and photos before visiting the hotel.
* **Flexible Ordering**:
  * **Option A**: Pre-select food items and review estimated bill.
  * **Option B**: Quick Walk-in Token without pre-selecting dishes.
* **Token Generation**:
  * Customer Name and Mobile Number
  * Visit Type: **Dine-in** or **Express Takeaway**
  * Estimated Arrival: "Visiting Right Now", "In 15 minutes", "In 30 minutes", etc.
  * Generates Token Number: E.g., `TKN-105`.
* **Direct Hotel Payment Support**:
  * 💵 **Cash**
  * 📱 **UPI**
  * 💳 **Card**
  * Payment collected directly at the hotel counter upon collection.
* **Live 4-Step Token Progress Tracker**:
  1. 🎫 **Token Issued**
  2. 👨‍🍳 **Order Taken / Preparing**
  3. 🔔 **Ready for Pickup**
  4. ✅ **Completed**

---

### 3. 📊 ADMIN ORDER MANAGEMENT DASHBOARD
Accessible via the **"Admin Panel"** button in the top navigation bar.

#### 5 Core KPI Metrics
1. **Total Online Orders**: Total count of delivery orders placed.
2. **Total Offline Orders**: Total count of direct hotel purchase tokens.
3. **Pending Orders**: All active orders currently in progress.
4. **Completed Orders**: Orders delivered or collected.
5. **Today's Sales (₹)**: Real-time revenue collected today.

#### Clearly Separated Order Management
* **🛵 Online Orders Tab**:
  * Customer details (Name, Mobile)
  * Complete Delivery address
  * Ordered dishes & quantities
  * Grand total & delivery fee status
  * Payment method & Payment Status (Paid / Pending) with 1-click toggle
  * Delivery status stepper (`Order Placed` ➔ `Preparing` ➔ `Out for Delivery` ➔ `Delivered`)
  * Filter pills and search bar
* **🏬 Offline Orders Tab**:
  * Token # & arrival timestamp
  * Customer details (Name, Mobile)
  * Visit type (Dine-in / Takeaway) & Expected arrival
  * Pre-selected items or walk-in notice
  * Estimated bill total
  * Hotel payment method & status (with **"Collect Pay"** modal to record Cash / UPI / Card)
  * Pickup status stepper (`Token Issued` ➔ `Preparing` ➔ `Ready for Pickup` ➔ `Completed`)
  * Filter pills and search bar
* **🍽️ Hotel & Menu Settings Tab**:
  * Customize Hotel Address, Available Timings, Phone Number, Delivery Fee, and Free Delivery threshold.
  * Add new dishes to the menu with photos, descriptions, and Veg/Non-Veg tags.

---

## 🚀 Running the Application

### Start the Server
```bash
npm start
```
The server will start at:
```
http://localhost:3000
```

### File Structure
```
hotel management/
├── server.js              # Express REST API & static server
├── package.json
├── data/
│   ├── db.js              # Database helper methods
│   ├── defaultData.js     # Default menu, hotel info & pre-seeded orders
│   └── db.json            # Persistent JSON database
└── public/
    ├── index.html         # Main responsive UI
    ├── css/
    │   └── style.css      # Custom styling & animations
    └── js/
        ├── api.js         # REST API client
        ├── app.js         # Customer portal & tracking logic
        └── admin.js       # Admin dashboard & management logic
```

Runtime JSON files in `data/` are created automatically when the server starts.
They are ignored by Git so customer and order records stay local.
Sanitized order and bill examples are committed as `data/orders.example.json`
and `data/bills.example.json`; customer contact details are excluded.
