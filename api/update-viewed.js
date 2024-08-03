import fs from 'fs';
import path from 'path';

export default async function handler(req, res) {
    if (req.method === 'POST') {
        const { name } = req.body;

        if (!name) {
            return res.status(400).json({ error: 'No cocktail name provided' });
        }

        const dataPath = path.join(process.cwd(), 'data.json');

        try {
            // Read and parse the JSON data
            const data = JSON.parse(fs.readFileSync(dataPath, 'utf8'));

            // Find the cocktail and update its "Viewed" property
            const cocktail = data.find(c => c.name === name);
            if (cocktail) {
                cocktail.Viewed = 1;
                fs.writeFileSync(dataPath, JSON.stringify(data, null, 2));
                res.status(200).json({ message: 'Viewed status updated' });
            } else {
                res.status(404).json({ error: 'Cocktail not found' });
            }
        } catch (error) {
            res.status(500).json({ error: 'Error reading or writing data' });
        }
    } else {
        res.setHeader('Allow', ['POST']);
        res.status(405).end(`Method ${req.method} Not Allowed`);
    }
}
