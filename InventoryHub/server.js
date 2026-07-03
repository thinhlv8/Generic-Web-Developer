const express = require('express');
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// In-memory data store using Map for optimized O(1) lookups
const inventoryDB = new Map();
let currentId = 1;

// Seed data
const seedData = [
    { name: 'Laptop', quantity: 10, price: 999.99 },
    { name: 'Mouse', quantity: 50, price: 19.99 },
    { name: 'Keyboard', quantity: 30, price: 49.99 }
];

seedData.forEach(item => {
    const itemWithId = { id: currentId, ...item };
    inventoryDB.set(currentId, itemWithId);
    currentId++;
});

// Cache for GET requests (Performance Optimization)
let cachedInventoryList = null;

const getInventoryList = () => {
    if (!cachedInventoryList) {
        cachedInventoryList = Array.from(inventoryDB.values());
    }
    return cachedInventoryList;
};

const invalidateCache = () => {
    cachedInventoryList = null;
};

// --- API Endpoints ---

// GET: Retrieve all inventory items
app.get('/api/inventory', (req, res) => {
    try {
        const data = getInventoryList();
        // Structured JSON response
        res.status(200).json({
            success: true,
            count: data.length,
            data: data
        });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server error', error: error.message });
    }
});

// POST: Add a new item
app.post('/api/inventory', (req, res) => {
    try {
        const { name, quantity, price } = req.body;
        
        // Basic validation
        if (!name || quantity == null || price == null) {
            return res.status(400).json({ success: false, message: 'Missing required fields' });
        }

        const newItem = {
            id: currentId++,
            name,
            quantity: Number(quantity),
            price: Number(price)
        };

        inventoryDB.set(newItem.id, newItem);
        invalidateCache(); // Invalidate cache on mutation

        res.status(201).json({ success: true, data: newItem });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server error', error: error.message });
    }
});

// PUT: Update an existing item
app.put('/api/inventory/:id', (req, res) => {
    try {
        const id = parseInt(req.params.id);
        if (!inventoryDB.has(id)) {
            return res.status(404).json({ success: false, message: 'Item not found' });
        }

        const { name, quantity, price } = req.body;
        const updatedItem = {
            ...inventoryDB.get(id),
            ...(name && { name }),
            ...(quantity != null && { quantity: Number(quantity) }),
            ...(price != null && { price: Number(price) })
        };

        inventoryDB.set(id, updatedItem);
        invalidateCache();

        res.status(200).json({ success: true, data: updatedItem });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server error', error: error.message });
    }
});

// DELETE: Remove an item
app.delete('/api/inventory/:id', (req, res) => {
    try {
        const id = parseInt(req.params.id);
        if (!inventoryDB.has(id)) {
            return res.status(404).json({ success: false, message: 'Item not found' });
        }

        inventoryDB.delete(id);
        invalidateCache();

        res.status(200).json({ success: true, message: 'Item deleted successfully' });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server error', error: error.message });
    }
});

app.listen(PORT, () => {
    console.log(`InventoryHub server running on port ${PORT}`);
});
