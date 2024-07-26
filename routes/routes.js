import { Router } from "express";
import healthController from "../controllers/health.js";
import authController from "../controllers/auth.js";
import URL from "../controllers/URL.js";
import auth from "../middleware/auth.js";

const router = Router();

// Health check routes
router.get("/", healthController.getHealth);
router.post("/", healthController.postHealth);

// Authentication routes
router.post("/register", authController.registerUser);
router.post("/login", authController.loginUser);

// URL management routes with authentication
router.post("/create", auth, URL.createShortURL);
router.put("/edit", auth, URL.editShortURL);
router.put("/change-status", auth, URL.changeURLStatus);
router.delete("/delete", auth, URL.deleteShortURL);
router.get("/urls", auth, URL.getUserURLs);

// Public URL redirection (no authentication required)
router.get("/:short_url", URL.redirectURL);

// Admin routes
router.post("/admin/create", auth, auth.isAdmin, URL.createShortURL);
router.put("/admin/edit", auth, auth.isAdmin, URL.editShortURL);
router.delete("/admin/delete", auth, auth.isAdmin, URL.deleteShortURL);
router.get("/admin/report", auth, auth.isAdmin, URL.generateReport);

export default router;
