const defaultMenu = [
  // --- VEG MAIN COURSE ---
  {
    id: "item-1",
    name: "Paneer Butter Masala",
    category: "Main Course",
    price: 280,
    isVeg: true,
    description: "Tender cottage cheese cubes simmered in a rich, buttery tomato gravy with aromatic Indian spices.",
    image: "https://images.unsplash.com/photo-1631452180519-c014fe946bc7?auto=format&fit=crop&w=600&q=80",
    prepTime: "20 mins",
    available: true,
    tags: ["veg", "pure veg", "paneer", "curry", "north indian", "main course"]
  },
  {
    id: "item-3",
    name: "Dal Makhani",
    category: "Main Course",
    price: 240,
    isVeg: true,
    description: "Slow-cooked black lentils and kidney beans simmered overnight with pure churned butter and fresh cream.",
    image: "https://images.unsplash.com/photo-1546833999-b9f581a1996d?auto=format&fit=crop&w=600&q=80",
    prepTime: "15 mins",
    available: true,
    tags: ["veg", "pure veg", "dal", "lentils", "north indian", "main course"]
  },
  {
    id: "item-15",
    name: "Shahi Paneer",
    category: "Main Course",
    price: 290,
    isVeg: true,
    description: "Royal cottage cheese preparation in a silky cashew nut and saffron infused aromatic white-golden gravy.",
    image: "https://images.unsplash.com/photo-1567184109411-b28f2703e1cc?auto=format&fit=crop&w=600&q=80",
    prepTime: "20 mins",
    available: true,
    tags: ["veg", "pure veg", "paneer", "shahi", "curry", "north indian"]
  },
  {
    id: "item-16",
    name: "Palak Paneer",
    category: "Main Course",
    price: 270,
    isVeg: true,
    description: "Fresh spinach puree slow cooked with garlic, cumin, and soft paneer cubes garnished with cream.",
    image: "https://images.unsplash.com/photo-1613292443284-c770c0c66bf7?auto=format&fit=crop&w=600&q=80",
    prepTime: "20 mins",
    available: true,
    tags: ["veg", "pure veg", "palak", "spinach", "paneer", "healthy"]
  },
  {
    id: "item-17",
    name: "Amritsari Chole Masala",
    category: "Main Course",
    price: 220,
    isVeg: true,
    description: "Authentic Punjabi chickpeas cooked in a dark, robust tea-decoction spice blend with ginger juliennes.",
    image: "https://images.unsplash.com/photo-1589301760014-d929f3979dbc?auto=format&fit=crop&w=600&q=80",
    prepTime: "15 mins",
    available: true,
    tags: ["veg", "pure veg", "chole", "chana", "punjabi", "curry"]
  },

  // --- NON-VEG MAIN COURSE ---
  {
    id: "item-2",
    name: "Murgh Butter Chicken",
    category: "Main Course",
    price: 360,
    isVeg: false,
    description: "Tender tandoori-grilled boneless chicken steeped in a rich, velvety tomato and cashew nut makhani gravy.",
    image: "https://images.unsplash.com/photo-1603894584373-5ac82b2ae398?auto=format&fit=crop&w=600&q=80",
    prepTime: "25 mins",
    available: true,
    tags: ["non veg", "nonveg", "chicken", "murgh", "butter chicken", "curry", "north indian"]
  },
  {
    id: "item-18",
    name: "Chicken Tikka Masala",
    category: "Main Course",
    price: 350,
    isVeg: false,
    description: "Charred chicken tikka chunks cooked in a spicy onion-tomato gravy with bell peppers and fresh herbs.",
    image: "https://images.unsplash.com/photo-1565557623262-b51c2513a641?auto=format&fit=crop&w=600&q=80",
    prepTime: "22 mins",
    available: true,
    tags: ["non veg", "nonveg", "chicken", "tikka", "spicy", "curry"]
  },
  {
    id: "item-19",
    name: "Mutton Rogan Josh",
    category: "Main Course",
    price: 440,
    isVeg: false,
    description: "Authentic Kashmiri tender lamb curry slow-cooked with aromatic rattan jot, fennel seeds and dry ginger.",
    image: "https://images.unsplash.com/photo-1545247181-516773cae754?auto=format&fit=crop&w=600&q=80",
    prepTime: "30 mins",
    available: true,
    tags: ["non veg", "nonveg", "mutton", "lamb", "kashmiri", "rogan josh", "curry"]
  },
  {
    id: "item-20",
    name: "Home Style Egg Curry (2 Eggs)",
    category: "Main Course",
    price: 210,
    isVeg: false,
    description: "Pan-fried boiled eggs simmered in a spiced onion-tomato and whole garam masala gravy.",
    image: "https://images.unsplash.com/photo-1589301760014-d929f3979dbc?auto=format&fit=crop&w=600&q=80",
    prepTime: "15 mins",
    available: true,
    tags: ["non veg", "nonveg", "egg", "curry", "home style"]
  },

  // --- BIRYANI & RICE (VEG & NON-VEG) ---
  {
    id: "item-7",
    name: "Royal Chicken Dum Biryani",
    category: "Biryani & Rice",
    price: 340,
    isVeg: false,
    description: "Fragrant long-grain basmati rice slow-cooked in handi with marinated chicken, saffron and caramelized onions.",
    image: "https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?auto=format&fit=crop&w=600&q=80",
    prepTime: "25 mins",
    available: true,
    tags: ["non veg", "nonveg", "biryani", "chicken", "dum biryani", "hyderabadi", "rice"]
  },
  {
    id: "item-21",
    name: "Hyderabadi Mutton Dum Biryani",
    category: "Biryani & Rice",
    price: 430,
    isVeg: false,
    description: "Authentic royal Nizami biryani with juicy tender mutton pieces layered with aged basmati rice and fresh mint.",
    image: "https://images.unsplash.com/photo-1633945274405-b6c8069047b0?auto=format&fit=crop&w=600&q=80",
    prepTime: "30 mins",
    available: true,
    tags: ["non veg", "nonveg", "biryani", "mutton", "lamb", "hyderabadi", "dum biryani"]
  },
  {
    id: "item-8",
    name: "Shahi Veg Dum Biryani",
    category: "Biryani & Rice",
    price: 270,
    isVeg: true,
    description: "Garden fresh carrots, beans, peas and paneer dum-cooked with fragrant spices, kewra water and basmati rice.",
    image: "https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?auto=format&fit=crop&w=600&q=80",
    prepTime: "20 mins",
    available: true,
    tags: ["veg", "pure veg", "biryani", "veg biryani", "dum biryani", "rice"]
  },
  {
    id: "item-22",
    name: "Jeera Basmati Rice",
    category: "Biryani & Rice",
    price: 160,
    isVeg: true,
    description: "Aged long-grain basmati rice tempered with roasted cumin seeds and desi cow ghee.",
    image: "https://images.unsplash.com/photo-1512058564366-18510be2db19?auto=format&fit=crop&w=600&q=80",
    prepTime: "10 mins",
    available: true,
    tags: ["veg", "pure veg", "rice", "jeera rice", "ghee"]
  },

  // --- STARTERS & APPETIZERS (VEG & NON-VEG) ---
  {
    id: "item-4",
    name: "Tandoori Paneer Tikka",
    category: "Starters",
    price: 260,
    isVeg: true,
    description: "Succulent cottage cheese cubes marinated in yogurt and ajwain spices, skewered with peppers and charred in clay oven.",
    image: "https://images.unsplash.com/photo-1599488615731-7e5c2823ff28?auto=format&fit=crop&w=600&q=80",
    prepTime: "15 mins",
    available: true,
    tags: ["veg", "pure veg", "starter", "paneer", "tikka", "tandoori"]
  },
  {
    id: "item-6",
    name: "Crispy Golden Corn Pepper Fry",
    category: "Starters",
    price: 190,
    isVeg: true,
    description: "Crunchy sweet corn kernels tossed with crushed black pepper, capsicum and chatpata spices.",
    image: "https://images.unsplash.com/photo-1551782450-a2132b4ba21d?auto=format&fit=crop&w=600&q=80",
    prepTime: "12 mins",
    available: true,
    tags: ["veg", "pure veg", "starter", "corn", "crispy"]
  },
  {
    id: "item-23",
    name: "Punjabi Samosa Platter (2 pcs)",
    category: "Starters",
    price: 90,
    isVeg: true,
    description: "Flaky golden triangular pastries stuffed with spicy potato and green peas, served with mint & saunth chutneys.",
    image: "https://images.unsplash.com/photo-1601050690597-df0568f70950?auto=format&fit=crop&w=600&q=80",
    prepTime: "10 mins",
    available: true,
    tags: ["veg", "pure veg", "samosa", "starter", "snacks", "chaat"]
  },
  {
    id: "item-24",
    name: "Chicken 65 (South Indian Style)",
    category: "Starters",
    price: 290,
    isVeg: false,
    description: "Spicy and tangy boneless chicken bites deep fried with curry leaves, red chilies, mustard seeds and garlic.",
    image: "https://images.unsplash.com/photo-1610057099443-fde8c4d50f91?auto=format&fit=crop&w=600&q=80",
    prepTime: "15 mins",
    available: true,
    tags: ["non veg", "nonveg", "chicken", "chicken 65", "starter", "south indian", "spicy"]
  },
  {
    id: "item-5",
    name: "Chicken Tandoori Wings (6 pcs)",
    category: "Starters",
    price: 310,
    isVeg: false,
    description: "Crispy chargrilled chicken wings coated in a smoky red tandoori marinade and chaat masala.",
    image: "https://images.unsplash.com/photo-1527477378408-1bc097a911e5?auto=format&fit=crop&w=600&q=80",
    prepTime: "20 mins",
    available: true,
    tags: ["non veg", "nonveg", "chicken", "wings", "tandoori", "starter"]
  },
  {
    id: "item-25",
    name: "Amritsari Crispy Fish Fry",
    category: "Starters",
    price: 360,
    isVeg: false,
    description: "Boneless fish fillets marinated with ajwain, lime and gram flour batter, deep fried till crisp.",
    image: "https://images.unsplash.com/photo-1534422298391-e4f8c172dddb?auto=format&fit=crop&w=600&q=80",
    prepTime: "18 mins",
    available: true,
    tags: ["non veg", "nonveg", "fish", "seafood", "fish fry", "amritsari", "starter"]
  },

  // --- BREADS ---
  {
    id: "item-9",
    name: "Butter Garlic Naan",
    category: "Breads",
    price: 65,
    isVeg: true,
    description: "Clay-oven baked leavened refined flour bread generously brushed with minced garlic and melted butter.",
    image: "https://images.unsplash.com/photo-1601050690597-df0568f70950?auto=format&fit=crop&w=600&q=80",
    prepTime: "10 mins",
    available: true,
    tags: ["veg", "pure veg", "naan", "bread", "garlic naan", "roti"]
  },
  {
    id: "item-10",
    name: "Tandoori Roti (Butter)",
    category: "Breads",
    price: 35,
    isVeg: true,
    description: "Crisp and wholesome 100% whole wheat flatbread prepared fresh in the clay tandoor with pure butter.",
    image: "https://images.unsplash.com/photo-1509722747041-616f39b57569?auto=format&fit=crop&w=600&q=80",
    prepTime: "8 mins",
    available: true,
    tags: ["veg", "pure veg", "roti", "bread", "tandoori roti"]
  },
  {
    id: "item-26",
    name: "Laccha Paratha (Crispy Layered)",
    category: "Breads",
    price: 55,
    isVeg: true,
    description: "Multi-layered flaky whole wheat paratha baked in tandoor with desi ghee.",
    image: "https://images.unsplash.com/photo-1509722747041-616f39b57569?auto=format&fit=crop&w=600&q=80",
    prepTime: "10 mins",
    available: true,
    tags: ["veg", "pure veg", "paratha", "bread", "laccha"]
  },

  // --- DESSERTS ---
  {
    id: "item-11",
    name: "Gulab Jamun (2 pcs)",
    category: "Desserts",
    price: 110,
    isVeg: true,
    description: "Warm golden brown khoya dumplings soaked in fragrant rosewater, saffron and cardamom syrup.",
    image: "https://images.unsplash.com/photo-1589301760014-d929f3979dbc?auto=format&fit=crop&w=600&q=80",
    prepTime: "5 mins",
    available: true,
    tags: ["veg", "pure veg", "sweet", "dessert", "gulab jamun", "indian sweet"]
  },
  {
    id: "item-12",
    name: "Kesari Rasmalai (2 pcs)",
    category: "Desserts",
    price: 140,
    isVeg: true,
    description: "Velvety cottage cheese discs steeped in reduced saffron milk garnished with chopped almonds and pistachios.",
    image: "https://images.unsplash.com/photo-1617806118233-18e1de247200?auto=format&fit=crop&w=600&q=80",
    prepTime: "5 mins",
    available: true,
    tags: ["veg", "pure veg", "sweet", "dessert", "rasmalai", "indian sweet"]
  },

  // --- BEVERAGES ---
  {
    id: "item-13",
    name: "Mango Kesar Lassi",
    category: "Beverages",
    price: 120,
    isVeg: true,
    description: "Rich chilled churned curd smoothie blended with Alphonso mango pulp, saffron strands and cardamom.",
    image: "https://images.unsplash.com/photo-1546173159-315724a31696?auto=format&fit=crop&w=600&q=80",
    prepTime: "5 mins",
    available: true,
    tags: ["veg", "pure veg", "beverage", "drink", "lassi", "mango lassi"]
  },
  {
    id: "item-14",
    name: "Special Masala Chai",
    category: "Beverages",
    price: 50,
    isVeg: true,
    description: "Freshly brewed Indian tea simmered with milk, crushed fresh ginger, green cardamom and cloves.",
    image: "https://images.unsplash.com/photo-1576092768241-dec231879fc3?auto=format&fit=crop&w=600&q=80",
    prepTime: "5 mins",
    available: true,
    tags: ["veg", "pure veg", "beverage", "tea", "chai", "masala chai"]
  }
];

const defaultHotelInfo = {
  name: "The Grand Pavilion & Bistro",
  tagline: "Fine Dining, Authentic Flavours & Quick Direct Service",
  address: "Plot 42, Heritage Avenue, Near Central Park, Connaught Place, New Delhi - 110001",
  timings: "Monday - Sunday: 10:30 AM to 11:00 PM",
  phone: "+91 98765 43210",
  email: "support@grandpavilionhotel.com",
  deliveryCharge: 40,
  freeDeliveryThreshold: 500,
  estimatedDeliveryMins: 35,
  taxPercent: 5
};

const defaultOnlineOrders = [];
const defaultOfflineOrders = [];

module.exports = {
  defaultMenu,
  defaultHotelInfo,
  defaultOnlineOrders,
  defaultOfflineOrders
};
