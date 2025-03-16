import express from "express";
import { verifyJWT } from "../middleware/auth.middleware.js";
import { registerLimiter } from "../middleware/rateLimiter.js";
import {
    registerUser,
    loginUser,
    logoutUser,
    refreshAccessToken,
    updateUser,
    getUserProfile,
    getUserUpvotedServices,
    getUserIssues,
    getUserFeedbacks
} from "../controllers/userAuth.controller.js";
import { upload } from "../middleware/multer.middleware.js";

const router = express.Router();

// ✅ Register a new user (Public)
router.post("/register", upload.none(), registerLimiter, verifyJWT, registerUser);

// ✅ Login user (Public)
router.post("/login", upload.none(), registerLimiter, verifyJWT, loginUser);

// ✅ Logout user (Protected)
router.post("/logout", verifyJWT, logoutUser);

// ✅ Refresh user access token (Protected)
router.post("/refresh-token", verifyJWT, refreshAccessToken);

// ✅ Get user profile (Protected - Fetch user details & stats)
router.get("/profile/:userId", verifyJWT, getUserProfile);

// ✅ Get user upvoted services (Protected - Only for own account)
router.get("/:userId/upvoted-services", verifyJWT, getUserUpvotedServices);

// ✅ Update user details (Protected - Requires password verification)
router.put("/:userId", verifyJWT, updateUser);

router.get("/:userId/issues", verifyJWT, getUserIssues);
router.get("/:userId/feedbacks", verifyJWT, getUserFeedbacks);

export default router;