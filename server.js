const express = require('express');
const mysql = require('mysql2');
const path = require('path');
const session = require('express-session');
const app = express();

// Middleware to parse JSON and form data
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Session management setup
app.use(session({
  secret: 'your_secret_key', // Change this to a secure key
  resave: false,
  saveUninitialized: true,
  cookie: { secure: false } // Set to true if using HTTPS
}));

// MySQL database connection
const db = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: 'root', // Change this to your MySQL password
  database: 'budget_tracker_db' // Ensure this database exists
});

db.connect(err => {
  if (err) throw err;
  console.log('Connected to MySQL database');
});

// Serve static files (CSS, JS, etc.)
app.use(express.static(path.join(__dirname, 'public')));

// Route to serve the login page
app.get('/login', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'login.html'));
});

// Route to serve the registration page
app.get('/register', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'register.html'));
});

// Route to serve the dashboard (only if authenticated)
app.get('/', (req, res) => {
  if (req.session.userId) {
    return res.redirect('/login'); // Redirect to login if not authenticated
  }
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Handle user registration
app.post('/register', (req, res) => {
  const { username, email, password } = req.body;

  db.query('INSERT INTO users (username, password, email) VALUES (?, ?, ?)', 
    [username, password, email], (err, results) => {
      if (err) return res.status(500).json({ success: false, error: 'Registration failed' });
      res.json({ success: true });
    });
});

// Handle user login
app.post('/login', (req, res) => {
  const { username, password } = req.body;

  db.query('SELECT * FROM users WHERE username = ? AND password = ?', 
    [username, password], (err, results) => {
      if (err) return res.status(500).json({ success: false, error: 'Login failed' });
      if (results.length > 0) {
        req.session.userId = results[0].id; // Store user ID in session
        req.session.username = results[0].username; // Store username in session
        res.json({ success: true });
      } else {
        res.json({ success: false });
      }
    });
});

// Handle user logout
app.get('/logout', (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      return res.status(500).json({ success: false, error: 'Logout failed' });
    }
    res.redirect('/login'); // Redirect to login after logout
  });
});

// Fetch transactions for the logged-in user
app.get('/transactions', (req, res) => {
  if (!req.session.userId) {
    return res.status(401).json({ error: 'Not authenticated' });
  }

  db.query('SELECT * FROM transactions WHERE user_id = ?', 
    [req.session.userId], (err, results) => {
      if (err) return res.status(500).json({ error: 'Database query failed' });
      res.json(results);
    });
});

// Add a new transaction
app.post('/transactions', (req, res) => {
  const { amount, category, type } = req.body;
  const userId = req.session.userId;

  db.query('INSERT INTO transactions (user_id, category, amount, type) VALUES (?, ?, ?, ?)', 
    [userId, category, amount, type], (err, results) => {
      if (err) return res.status(500).json({ success: false, error: 'Failed to add transaction' });
      res.json({ success: true });
    });
});

// Update a transaction
app.put('/transactions/:id', (req, res) => {
  const transactionId = req.params.id;
  const { amount, category } = req.body;

  db.query('UPDATE transactions SET amount = ?, category = ? WHERE id = ? AND user_id = ?', 
    [amount, category, transactionId, req.session.userId], (err, results) => {
      if (err) return res.status(500).json({ success: false, error: 'Failed to update transaction' });
      res.json({ success: true });
    });
});

// Delete a transaction
app.delete('/transactions/:id', (req, res) => {
  const transactionId = req.params.id;

  db.query('DELETE FROM transactions WHERE id = ? AND user_id = ?', 
    [transactionId, req.session.userId], (err, results) => {
      if (err) return res.status(500).json({ success: false, error: 'Failed to delete transaction' });
      res.json({ success: true });
    });
});

// Start the server
app.listen(3000, () => {
  console.log('Server is running on http://localhost:3000');
});