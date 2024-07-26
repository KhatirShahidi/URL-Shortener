import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import database from "../database/connection.js";

dotenv.config();

const auth = async (req, res, next) => {
  const authHeader = req.header("Authorization");

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res
      .status(401)
      .json({ error: "No token provided, please authenticate." });
  }

  const token = authHeader.replace("Bearer ", "");

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const query = `SELECT * FROM users WHERE id = $1`;
    const values = [decoded.userId];

    const resDb = await database.query(query, values);

    if (resDb.rows.length === 0) {
      return res.status(401).json({ error: "Invalid token, user not found." });
    }

    req.user = resDb.rows[0];
    console.log("Authenticated user:", req.user); // Add this line
    next();
  } catch (error) {
    console.error("Token verification error:", error); // Add this line
    return res
      .status(401)
      .json({ error: "Token verification failed, please authenticate." });
  }
};

auth.isAdmin = (req, res, next) => {
  if (req.user.is_admin) {
    return next();
  } else {
    return res.status(403).json({ error: "Admin privileges required." });
  }
};

export default auth;
