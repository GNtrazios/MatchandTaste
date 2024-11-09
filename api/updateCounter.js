import pkg from 'pg';
const { Client } = pkg;

// Connect to PostgreSQL with SSL enabled
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

export default async (req, res) => {
  if (req.method !== 'POST') {
    res.status(405).send({ message: 'Only POST requests allowed' });
    return;
  }

  const { question, answer } = req.body;

  try {
    // Update count if the record exists
    const query = `
      UPDATE click_counts
      SET count = count + 1
      WHERE question = $1 AND answer = $2
      RETURNING *;
    `;

    const result = await client.query(query, [question, answer]);

    if (result.rowCount === 0) {
      res.status(404).send({ message: 'No matching record found to update' });
    } else {
      res.status(200).send({ message: 'Count updated successfully' });
    }
  } catch (error) {
    console.error('Error updating count:', error);
    res.status(500).send({ message: 'Failed to update count' });
  } finally {
    client.end(); // Close the database connection
  }
};
