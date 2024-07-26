import pg from "pg";
import dotenv from "dotenv";
import createUsersTable from "../models/user.js";
import createURLtable from "../models/url.js";

dotenv.config(); // Load environment variables first

const { Client } = pg;

const database = new Client({
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  host: process.env.DB_HOST || "127.0.0.1",
  port: process.env.DB_PORT,
  database: process.env.DB_DATABASE,
});

async function initializeDatabase() {
  try {
    await database.connect();
    const queryTime = await database.query("SELECT NOW()");
    const dbName = await database.query("SELECT current_database()");
    const currentTime = queryTime.rows[0].now;
    const currentDB = dbName.rows[0].current_database;
    console.log("Connected to database", currentDB, "at", currentTime);

    // Create tables if they don't exist
    await createUsersTable();
    await createURLtable();
  } catch (error) {
    console.error("Error connecting to the database:", error);
    process.exit(1); // Exit the process with an error code
  }
}

initializeDatabase();

export default database;
