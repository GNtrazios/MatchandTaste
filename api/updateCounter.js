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

export default async (req, res) => {
  if (req.method !== 'POST') {
    res.status(405).send({ message: 'Only POST requests are allowed' });
    return;
  }

  const { question, answer } = req.body;

  if (!question || !answer) {
    res.status(400).send({ message: 'Both "question" and "answer" are required' });
    return;
  }

  try {
    // Query to update count
    const query = `
      UPDATE click_counts
      SET count = count + 1
      WHERE question = $1 AND answer = $2
      RETURNING *;
    `;

    // Execute the query with parameters
    const result = await pool.query(query, [question, answer]);

    if (result.rowCount === 0) {
      res.status(404).send({ message: 'No matching record found to update' });
    } else {
      res.status(200).send({ message: 'Count updated successfully', data: result.rows[0] });
    }
  } catch (error) {
    console.error('Error updating count:', error.message, error.stack);

    // Log detailed error to Vercel for debugging
    console.error({
      type: 'PostgreSQL_Error',
      message: error.message,
      stack: error.stack,
    });

    res.status(500).send({ message: 'Failed to update count' });
  }
};
