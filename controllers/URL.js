import database from "../database/connection.js";
import { Parser } from "json2csv";
import path from "path";
import crypto from "crypto";

async function createShortURL(req, res) {
  const { url } = req.body;

  // Validate input
  if (!url) {
    return res.status(400).json({ error: "'url' is required." });
  }

  const short_url = crypto.randomBytes(4).toString("hex");
  const user_id = req.user.id;

  const createURLSQL = `
    INSERT INTO urls (url, short_url, user_id) 
    VALUES ($1, $2, $3) RETURNING *;
  `;

  try {
    const resDb = await database.query(createURLSQL, [url, short_url, user_id]);
    res.status(201).json(resDb.rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message || "Internal Server Error" });
  }
}

async function editShortURL(req, res) {
  const { short_url, url } = req.body;
  const user_id = req.user.id;
  const is_admin = req.user.is_admin;

  // Validate input
  if (!short_url || !url) {
    return res.status(400).json({ error: "Both 'short_url' and 'url' are required." });
  }

  console.log('User ID:', user_id);
  console.log('Is Admin:', is_admin);

  let editURLSQL;
  let values;

  if (is_admin) {
    // Admin can edit any URL
    editURLSQL = `
      UPDATE urls 
      SET url = $1 
      WHERE short_url = $2 
      RETURNING *;
    `;
    values = [url, short_url];
  } else {
    // Regular user can only edit their own URLs
    editURLSQL = `
      UPDATE urls 
      SET url = $1 
      WHERE short_url = $2 AND user_id = $3 
      RETURNING *;
    `;
    values = [url, short_url, user_id];
  }

  console.log('Executing SQL:', editURLSQL);
  console.log('With values:', values);

  try {
    const resDb = await database.query(editURLSQL, values);
    if (resDb.rows.length === 0) {
      console.error('No matching URL found or user not authorized. SQL:', editURLSQL, 'Values:', values);
      return res.status(404).json({ error: "Short URL not found or not authorized" });
    }
    res.status(200).json(resDb.rows[0]);
  } catch (error) {
    console.error('Database query error:', error, 'SQL:', editURLSQL, 'Values:', values);
    res.status(500).json({ error: error.message || "Internal Server Error" });
  }
}

async function deleteShortURL(req, res) {
  const { short_url } = req.body;
  const user_id = req.user.id;
  const is_admin = req.user.is_admin;

  // Validate input
  if (!short_url) {
    return res.status(400).json({ error: "'short_url' is required." });
  }

  let deleteURLSQL;
  let values;

  if (is_admin) {
    // Admin can delete any URL
    deleteURLSQL = `
      DELETE FROM urls 
      WHERE short_url = $1 
      RETURNING *;
    `;
    values = [short_url];
  } else {
    // Regular user can only delete their own URLs
    deleteURLSQL = `
      DELETE FROM urls 
      WHERE short_url = $1 AND user_id = $2 
      RETURNING *;
    `;
    values = [short_url, user_id];
  }

  try {
    const resDb = await database.query(deleteURLSQL, values);
    if (resDb.rows.length === 0) {
      return res.status(404).json({ error: "Short URL not found or not authorized" });
    }
    res.status(200).json(resDb.rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message || "Internal Server Error" });
  }
}

async function redirectURL(req, res) {
  const { short_url } = req.params;
  const getURLSQL = `SELECT url FROM urls WHERE short_url = $1 AND is_active = true;`;
  
  try {
    const resDb = await database.query(getURLSQL, [short_url]);
    if (resDb.rows.length === 0) {
      res.status(404);
      return res.sendFile(path.resolve("path/to/404.html"));
    }
    await database.query(`UPDATE urls SET visit_count = visit_count + 1 WHERE short_url = $1;`, [short_url]);
    res.redirect(resDb.rows[0].url);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message || "Internal Server Error" });
  }
}

async function changeURLStatus(req, res) {
  const { short_url, is_active } = req.body;
  const user_id = req.user.id; // Assuming req.user contains authenticated user's data

  const changeStatusSQL = `
    UPDATE urls 
    SET is_active = $1 
    WHERE short_url = $2 AND user_id = $3 
    RETURNING *;
  `;

  try {
    const resDb = await database.query(changeStatusSQL, [is_active, short_url, user_id]);
    if (resDb.rows.length === 0) {
      return res.status(404).json({ error: "Short URL not found or not authorized" });
    }
    res.status(200).json(resDb.rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message || "Internal Server Error" });
  }
}

async function generateReport(req, res) {
  const getAllURLsSQL = `
    SELECT * FROM urls;
  `;

  try {
    const resDb = await database.query(getAllURLsSQL);
    const urls = resDb.rows;

    const fields = ["id", "url", "short_url", "destination_url", "visit_count", "user_id", "is_active", "created_at"];
    const json2csvParser = new Parser({ fields });
    const csv = json2csvParser.parse(urls);

    res.header("Content-Type", "text/csv");
    res.attachment("urls_report.csv");
    return res.send(csv);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message || "Internal Server Error" });
  }
}

async function getUserURLs(req, res) {
  const user_id = req.user.id;

  const getUserURLsSQL = `
    SELECT * FROM urls WHERE user_id = $1;
  `;

  try {
    const resDb = await database.query(getUserURLsSQL, [user_id]);
    res.status(200).json(resDb.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message || "Internal Server Error" });
  }
}

const URL = {
  createShortURL,
  editShortURL,
  deleteShortURL,
  redirectURL,
  changeURLStatus,
  generateReport,
  getUserURLs, // Ensure this function is defined and exported
  // other functions...
};

export default URL;
