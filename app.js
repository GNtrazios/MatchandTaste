const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const fs = require('fs');
const app = express();
const PORT = process.env.PORT || 3000;

// Middleware to parse JSON bodies
app.use(bodyParser.json());

// Serve static files from the 'public' directory
app.use(express.static(path.join(__dirname, 'public')));

// Path to the data.json file
const dataPath = path.join(__dirname, 'public', 'data.json');

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
