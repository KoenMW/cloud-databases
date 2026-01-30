import { Pool } from "pg";

let pool: Pool | null = null;

export const getDbClient = async () => {
  if (!pool) {
    pool = new Pool({
      host: process.env.PG_HOST || "localhost",
      port: parseInt(process.env.PG_PORT || "5432", 10),
      database: process.env.PG_DATABASE || "buy_my_house",
      user: process.env.PG_USER || "postgres",
      password: process.env.PG_PASSWORD || "example",
      ssl: false,
    });
  }

  return await pool.connect();
};

let tableEnsured = false;

export const ensureTableExists = async () => {
  if (tableEnsured) {
    return;
  }

  const client = await getDbClient();
  try {
    await client.query(`
      CREATE TABLE IF NOT EXISTS processed_mortgages (
        id INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
        full_name VARCHAR(255) NOT NULL,
        email VARCHAR(255) NOT NULL,
        processed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        annual_income NUMERIC NOT NULL,
        loan_amount NUMERIC NOT NULL,
        loan_term_years INT NOT NULL,
        accepted BOOLEAN NOT NULL,
        notifications_sent BOOLEAN DEFAULT FALSE
      );
    `);
  } finally {
    client.release();
  }
  tableEnsured = true;
};

export const markNotificationsSent = async (id: number) => {
  const client = await getDbClient();
  try {
    await client.query(
      `
      UPDATE processed_mortgages
      SET notifications_sent = TRUE
      WHERE id = $1 AND notifications_sent = FALSE;
    `,
      [id],
    );
  } finally {
    client.release();
  }
};
