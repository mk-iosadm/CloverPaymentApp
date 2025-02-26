import pg from 'pg';
const { Pool } = pg;

const pool = new Pool({
  user: 'postgres',
  password: 'A|)mFascom123!',
  host: 'localhost',
  port: 7861,
  database: 'testDB'
});

export const initializeDatabase = async () => {
  const client = await pool.connect();
  try {
    await client.query(`
      CREATE TABLE IF NOT EXISTS payments (
        id SERIAL PRIMARY KEY,
        order_id VARCHAR(255) NOT NULL,
        clover_order_id VARCHAR(255),
        amount DECIMAL(10,2) NOT NULL,
        currency VARCHAR(3) NOT NULL DEFAULT 'USD',
        status VARCHAR(50) NOT NULL,
        payment_link VARCHAR(255),
        transaction_id VARCHAR(255),
        customer_name VARCHAR(255),
        customer_email VARCHAR(255),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        metadata JSONB
      );

      CREATE INDEX IF NOT EXISTS idx_payments_order_id ON payments(order_id);
      CREATE INDEX IF NOT EXISTS idx_payments_clover_order_id ON payments(clover_order_id);
      CREATE INDEX IF NOT EXISTS idx_payments_status ON payments(status);
    `);
    console.log('Database initialized successfully');
  } catch (error) {
    console.error('Error initializing database:', error);
    throw error;
  } finally {
    client.release();
  }
};

export const query = (text, params) => pool.query(text, params);

export default pool;
