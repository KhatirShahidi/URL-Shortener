import database from "../database/connection.js";

const createNewUserSQL = `
CREATE TABLE IF NOT EXISTS users (
    id serial PRIMARY KEY,
    username varchar(255) UNIQUE NOT NULL,
    email varchar(255) UNIQUE NOT NULL,
    password varchar(255) NOT NULL,
    is_verified BOOLEAN DEFAULT false,
    is_admin BOOLEAN DEFAULT false,
    created_at timestamp DEFAULT NOW()
);
`;

async function createUsersTable() {
  try {
    await database.query(createNewUserSQL);
    console.log("Users table created or already exists.");
  } catch (error) {
    console.error("Error creating users table:", error);
    throw error;
  }
}

export default createUsersTable;
