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

// Endpoint to update the "Viewed" count
app.post('/update-viewed', (req, res) => {
    const { name } = req.body;

    if (!name) {
        return res.status(400).json({ success: false, error: 'No cocktail name provided.' });
    }

    // Read the data file
    fs.readFile(dataPath, 'utf8', (err, data) => {
        if (err) {
            return res.status(500).json({ success: false, error: 'Error reading data file.' });
        }

        // Parse the JSON data
        let cocktails;
        try {
            cocktails = JSON.parse(data);
        } catch (parseError) {
            return res.status(500).json({ success: false, error: 'Error parsing data file.' });
        }

        // Find the cocktail to update
        let cocktail = cocktails.find(c => c.name === name);
        if (cocktail) {
            // Update the "Viewed" count
            cocktail.Viewed = (cocktail.Viewed || 0) + 1;

            // Write the updated data back to the file
            fs.writeFile(dataPath, JSON.stringify(cocktails, null, 2), (writeError) => {
                if (writeError) {
                    return res.status(500).json({ success: false, error: 'Error writing data file.' });
                }
                res.json({ success: true });
            });
        } else {
            res.status(404).json({ success: false, error: 'Cocktail not found.' });
        }
    });
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
