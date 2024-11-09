import { Client } from 'pg';

const client = new Client({
    host: process.env.POSTGRES_HOST,
    user: process.env.POSTGRES_USER,
    database: process.env.POSTGRES_DATABASE,
    password: process.env.POSTGRES_PASSWORD,
    port: process.env.POSTGRES_PORT,
    ssl: { rejectUnauthorized: false },  // Ensure SSL connection if needed
});

client.connect();

// Example API to get the counter data
export default async (req, res) => {
    if (req.method !== 'GET') {
        return res.status(405).send({ message: 'Only GET requests allowed' });
    }

    try {
        const query = 'SELECT * FROM click_counts order by count desc';  // Adjust to your table and fields
        const result = await client.query(query);

        // Return the result as JSON
        res.status(200).json(result.rows);
    } catch (error) {
        console.error('Error fetching data:', error);
        res.status(500).send({ message: 'Failed to fetch data' });
    } finally {
        client.end();
    }
};
