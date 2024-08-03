import fs from 'fs';
import path from 'path';

export default async function handler(req, res) {
    if (req.method === 'POST') {
        const { name } = req.body;

        if (!name) {
            return res.status(400).json({ error: 'No cocktail name provided in the request body.' });
        }

        // Get the current working directory
        const currentDir = process.cwd();
        console.log(`Current working directory: ${currentDir}`);

        // Construct the path to the data.json file
        const dataPath = process.env.DATA_PATH || path.join(currentDir, 'public', 'data.json');
        console.log(`Data path being used: ${dataPath}`);

        try {
            // Check if the file exists
            if (!fs.existsSync(dataPath)) {
                console.log(`File not found at path: ${dataPath}`);
                return res.status(404).json({ error: `File not found at path: ${dataPath}` });
            }

            // Read and parse the JSON data
            const fileContent = fs.readFileSync(dataPath, 'utf8');
            const data = JSON.parse(fileContent);

            // Find the cocktail and update its "Viewed" property
            const cocktail = data.find(c => c.name === name);
            if (cocktail) {
                cocktail.Viewed = 1;
                fs.writeFileSync(dataPath, JSON.stringify(data, null, 2));
                res.status(200).json({ message: 'Viewed status updated successfully.' });
            } else {
                res.status(404).json({ error: `Cocktail with name "${name}" not found in the data.` });
            }
        } catch (error) {
            console.error('Error occurred:', error);
            if (error.code === 'ENOENT') {
                // Specific error for file not found
                res.status(500).json({ error: `File not found or unable to read file at path: ${dataPath}` });
            } else if (error.name === 'SyntaxError') {
                // Specific error for JSON parsing issues
                res.status(500).json({ error: `Error parsing JSON from file at path: ${dataPath}`, details: error.message });
            } else {
                // Generic error
                res.status(500).json({ error: 'Unexpected error occurred while processing the request.', details: error.message });
            }
        }
    } else {
        res.setHeader('Allow', ['POST']);
        res.status(405).end(`Method ${req.method} Not Allowed. Please use POST method.`);
    }
}
