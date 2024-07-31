const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const mysql = require('mysql2');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware to parse JSON bodies
app.use(bodyParser.json());

// Serve static files from the 'public' directory
app.use(express.static(path.join(__dirname, 'public')));

// Database connection setup (replace with your own credentials)
const db = mysql.createConnection({
  host: '127.0.0.1',
  user: 'root',
  password: '01032001Gr!',
  database: 'cocktails'
});

db.connect(err => {
  if (err) {
    console.error('Database connection error:', err.stack);
    return;
  }
  console.log('Connected to the database.');
}); 

// Test database connection
app.get('/check-connection', (req, res) => {
    db.query('SELECT 1', (err, results) => {
      if (err) {
        console.error('Database query error:', err);
        res.status(500).json({ message: 'Database connection failed', error: err.message });
      } else {
        res.json({ message: 'Database connection is successful' });
      }
    });
});

app.get('/get-cocktails', (req, res) => {
    // Get the 'flavor' parameter from the query string
    const flavor = req.query.flavor;
  
    // Use the parameter in the SQL query
    const query = "SELECT DISTINCT o.drink FROM oubi o LEFT JOIN (SELECT DISTINCT drink FROM oubi WHERE flavor = ?) s ON o.drink = s.drink WHERE s.drink IS NULL";

    db.query(query, [flavor], (err, results) => {
      if (err) {
        console.error('Database query error:', err);
        res.status(500).json({ message: 'Database query failed', error: err.message });
      } else {
        res.json({ message: 'Query successful', data: results });
      }
    });
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
