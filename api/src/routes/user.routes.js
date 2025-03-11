import express from "express";
import { verifyJWT } from "../middleware/auth.middleware.js";
import {
    registerUser,
    loginUser,
    logoutUser,
    refreshAccessToken,
    updateUser,
    getUserProfile
} from "../controllers/userAuth.controller.js";
import { upload } from "../middleware/multer.middleware.js";

const router = express.Router();

// ✅ Register a new user (Public)
router.post("/register", upload.none(),registerUser);

// ✅ Login user (Public)
router.post("/login", upload.none() , loginUser);

// ✅ Logout user (Protected)
router.post("/logout", verifyJWT, logoutUser);

// ✅ Refresh user access token (Protected)
router.post("/refresh-token", verifyJWT, refreshAccessToken);

// ✅ Get user profile (Protected - Fetch user details & stats)
router.get("/profile/:userId", verifyJWT, getUserProfile);

// ✅ Update user details (Protected - Requires password verification)
router.put("/:userId", verifyJWT, updateUser);

export default router;
