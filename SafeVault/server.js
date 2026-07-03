const express = require('express');
const jwt = require('jsonwebtoken');
const sqlite3 = require('sqlite3').verbose();

const app = express();
app.use(express.json());

const db = new sqlite3.Database(':memory:');
const SECRET_KEY = 'super_secret_safevault_key';

// Initialize DB
db.serialize(() => {
    db.run("CREATE TABLE users (id INTEGER PRIMARY KEY, username TEXT, role TEXT, password TEXT)");
    db.run("INSERT INTO users (username, role, password) VALUES ('admin_user', 'admin', 'admin123')");
    db.run("INSERT INTO users (username, role, password) VALUES ('regular_user', 'user', 'user123')");
});

// Authentication Endpoint
app.post('/login', (req, res) => {
    const { username, password } = req.body;
    
    // Input validation (mitigating XSS and basic SQLi attempts)
    if (!username || !password || typeof username !== 'string' || typeof password !== 'string') {
        return res.status(400).json({ error: 'Invalid input' });
    }

    // SQL Injection Prevention: Using Parameterized Queries
    const query = "SELECT * FROM users WHERE username = ? AND password = ?";
    db.get(query, [username, password], (err, user) => {
        if (err) return res.status(500).json({ error: 'Database error' });
        if (!user) return res.status(401).json({ error: 'Invalid credentials' });

        const token = jwt.sign({ id: user.id, role: user.role }, SECRET_KEY, { expiresIn: '1h' });
        res.json({ token });
    });
});

// Authorization Middleware (RBAC)
const authorize = (roles = []) => {
    return (req, res, next) => {
        const token = req.headers.authorization?.split(' ')[1];
        if (!token) return res.status(403).json({ error: 'No token provided' });

        jwt.verify(token, SECRET_KEY, (err, decoded) => {
            if (err) return res.status(401).json({ error: 'Unauthorized' });
            
            if (roles.length && !roles.includes(decoded.role)) {
                return res.status(403).json({ error: 'Forbidden: Insufficient role' });
            }
            req.user = decoded;
            next();
        });
    };
};

// Protected Routes
app.get('/vault/public', authorize(['admin', 'user']), (req, res) => {
    res.json({ message: 'Access granted to public vault' });
});

app.get('/vault/secret', authorize(['admin']), (req, res) => {
    res.json({ message: 'Access granted to admin secret vault' });
});

module.exports = app;

if (require.main === module) {
    app.listen(3000, () => console.log('SafeVault Server running on port 3000'));
}
