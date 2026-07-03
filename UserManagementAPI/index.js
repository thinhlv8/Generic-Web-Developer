const express = require('express');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware for parsing JSON
app.use(express.json());

// Custom logging middleware
app.use((req, res, next) => {
    console.log(`[${new Date().toISOString()}] ${req.method} request to ${req.url}`);
    next();
});

// In-memory data store
let users = [
    { id: 1, name: 'Alice', email: 'alice@example.com' },
    { id: 2, name: 'Bob', email: 'bob@example.com' }
];

// Helper validation function
const validateUser = (user) => {
    if (!user.name || typeof user.name !== 'string' || user.name.trim() === '') {
        return 'Valid name is required';
    }
    if (!user.email || typeof user.email !== 'string' || !user.email.includes('@')) {
        return 'Valid email is required';
    }
    return null;
};

// GET all users
app.get('/api/users', (req, res) => {
    res.json(users);
});

// GET a specific user by id
app.get('/api/users/:id', (req, res) => {
    const user = users.find(u => u.id === parseInt(req.params.id));
    if (!user) {
        return res.status(404).json({ error: 'User not found' });
    }
    res.json(user);
});

// POST a new user
app.post('/api/users', (req, res) => {
    const error = validateUser(req.body);
    if (error) {
        return res.status(400).json({ error });
    }

    const newUser = {
        id: users.length > 0 ? Math.max(...users.map(u => u.id)) + 1 : 1,
        name: req.body.name,
        email: req.body.email
    };
    users.push(newUser);
    res.status(201).json(newUser);
});

// PUT to update an existing user
app.put('/api/users/:id', (req, res) => {
    const userIndex = users.findIndex(u => u.id === parseInt(req.params.id));
    if (userIndex === -1) {
        return res.status(404).json({ error: 'User not found' });
    }

    const error = validateUser(req.body);
    if (error) {
        return res.status(400).json({ error });
    }

    users[userIndex] = {
        id: users[userIndex].id,
        name: req.body.name,
        email: req.body.email
    };

    res.json(users[userIndex]);
});

// DELETE a user
app.delete('/api/users/:id', (req, res) => {
    const userIndex = users.findIndex(u => u.id === parseInt(req.params.id));
    if (userIndex === -1) {
        return res.status(404).json({ error: 'User not found' });
    }

    const deletedUser = users.splice(userIndex, 1);
    res.json(deletedUser[0]);
});

// Start the server
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
