import pkg from 'pg';
const { Pool } = pkg;

// Initialize a connection pool
const pool = new Pool({
  host: process.env.POSTGRES_HOST,
  user: process.env.POSTGRES_USER,
  database: process.env.POSTGRES_DATABASE,
  password: process.env.POSTGRES_PASSWORD,
  port: process.env.POSTGRES_PORT,
  ssl: {
    rejectUnauthorized: false, // Bypass SSL certificate validation
  },
});

// Define the API to get the counter data
export default async (req, res) => {
  if (req.method !== 'GET') {
    return res.status(405).send({ message: 'Only GET requests are allowed' });
  }

  try {
    // Query to get all the data from the 'click_counts' table, ordered by count descending
    const query = `SELECT * FROM click_counts ORDER BY count DESC`;

    // Execute the query
    const result = await pool.query(query);

    // Return the result as JSON
    res.status(200).json(result.rows);
  } catch (error) {
    // Detailed error logging for debugging
    console.error('Error fetching data:', error.message);
    console.error('Error stack:', error.stack);

    // Log error to Vercel for debugging purposes
    console.error({
      type: 'PostgreSQL_Error',
      message: error.message,
      stack: error.stack,
    });

    res.status(500).send({ message: 'Failed to fetch data' });
  }
};
