import database from "../database/connection.js";

const createURLtableSQL = `
CREATE TABLE IF NOT EXISTS urls (
    id serial PRIMARY KEY,
    url varchar(255) NOT NULL,
    short_url varchar(255) UNIQUE NOT NULL,
    destination_url varchar(255),
    visit_count int DEFAULT 0,
    user_id int REFERENCES users(id) ON DELETE CASCADE,
    is_active BOOLEAN DEFAULT true,
    created_at timestamp DEFAULT NOW()
);
`;

async function createURLtable() {
  try {
    await database.query(createURLtableSQL);
    console.log("URLs table created or already exists.");
  } catch (error) {
    console.error("Error creating URLs table:", error);
    throw error;
  }
}

export default createURLtable;
