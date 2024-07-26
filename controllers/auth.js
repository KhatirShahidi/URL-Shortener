import database from "../database/connection.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";

dotenv.config();

async function registerUser(req, res) {
  const insertUserSQL = `
    INSERT INTO users (username, email, password) 
    VALUES ($1, $2, $3) RETURNING id
    `;
  const username = req.body.username;
  const email = req.body.email;
  const password = req.body.password;
  const confirmPassword = req.body.confirmPassword;

  // Check all fields present
  if (!username || !email || !password || !confirmPassword) {
    return res.status(400).json({
      message: "All fields are required",
    });
  }

  // if any properties returned as undefined
  if (typeof username !== "string" || typeof email !== "string") {
    return res.status(400).json({
      message: "Invalid username or email",
    });
  }

  // Check if passwords match
  if (password !== confirmPassword) {
    return res.status(400).json({
      message: "Passwords do not match",
    });
  }
  // check valid email using regex
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return res.status(400).json({
      message: "Invalid email address",
    });
  }

  // convert password to hash using bcrypt
  const salt = bcrypt.genSaltSync(10);
  const hashedPassword = bcrypt.hashSync(password, salt);

  // insert user into database successfully
  try {
    const resDb = await database.query(insertUserSQL, [
      username,
      email,
      hashedPassword,
    ]);
    const userId = resDb.rows[0].id;
    const resData = {
      message: "User created successfully",
      data: {
        userId: userId,
        username: username,
        email: email,
      },
    };
    return res.status(201).json(resData);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
}

async function loginUser(req, res) {
  const selectUserSQL = `
    SELECT * FROM users WHERE email = $1
    `;
  const email = req.body.email;
  const password = req.body.password;
  if (!email || !password) {
    return res.status(400).json({
      error: "All fields are required",
    });
  }
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return res.status(400).json({
      error: "Invalid email address",
    });
  }
  try {
    const resDb = await database.query(selectUserSQL, [email]);
    if (resDb.rows.length === 0) {
      return res.status(401).json({
        error: "Invalid email or password",
      });
    }
    const user = resDb.rows[0];
    const dbPassword = user.password;
    const isPasswordMatch = bcrypt.compareSync(password, dbPassword);

    if (!isPasswordMatch) {
      return res.status(401).json({
        error: "Invalid email or password",
      });
    }

    // Create a JWT Token
    const tokenData = {
      userId: user.id,
      username: user.username,
      email: user.email,
    }
    const configJWT = {
      expiresIn: "1h",
    }
    const token = jwt.sign(tokenData, process.env.JWT_SECRET, configJWT);

    const resData = {
      message: "Login successful",
      data: {
        token: token,
        userId: user.id,
        username: user.username,
        email: user.email,
      },
    };

    // Login successful
    return res.status(200).json(resData)
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
}

async function verifyEmail(req, res) {
  const { token } = req.query;

  const verifyEmailSQL = `
    SELECT * FROM users WHERE token = $1

  `;

  try {
    const resDb = await database.query(verifyEmailSQL, [token]);
    if (res.rows.length === 0) {
    return res.status(401).json({ error: "Invalid token" });
    }
    res.status(200).json(resDb.rows[0]);}
    catch {
    console.error(error);

    res.status(500).json({ error: error.message || "Internal Server Error" });
  }
  
}

  

const authController = {
  registerUser,
  loginUser,
  verifyEmail,
};

export default authController;
