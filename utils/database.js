import { Pool } from 'pg';
import dotenv from 'dotenv';

dotenv.config();

// Use connection pooling for efficient management of database connections
const pool = new Pool({
    connectionString: process.env.DB_CONNECTION_STRING, // Neon PostgreSQL connection string
    max: 10,  // Maximum number of clients in the pool (adjust if needed)
    idleTimeoutMillis: 30000,  // Close idle clients after 30 seconds
    connectionTimeoutMillis: 2000,  // Timeout for connecting to the database
});

// Export the pool, which is used to query the database
export default pool;
