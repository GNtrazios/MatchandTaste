import pkg from 'pg';
const { Client } = pkg;

const client = new Client({
  host: process.env.POSTGRES_HOST,
  user: process.env.POSTGRES_USER,
  database: process.env.POSTGRES_DATABASE,
  password: process.env.POSTGRES_PASSWORD,
  port: process.env.POSTGRES_PORT,
  ssl: {
    rejectUnauthorized: false, // This bypasses SSL certificate validation
  },
});

client.connect();

// Define the API to get the counter data
export default async (req, res) => {
  if (req.method !== 'GET') {
    return res.status(405).send({ message: 'Only GET requests allowed' });
  }

  try {
    // Query to get all the data from the 'click_counts' table
    const query = 'SELECT * FROM click_counts order by count desc';

    const result = await client.query(query);

    // Return the result as JSON
    res.status(200).json(result.rows);
  } catch (error) {
    console.error('Error fetching data:', error);
    res.status(500).send({ message: 'Failed to fetch data' });
  }
};
