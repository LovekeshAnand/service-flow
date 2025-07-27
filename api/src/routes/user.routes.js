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


router.post("/register", upload.none(), registerLimiter, registerUser);


router.post("/login", upload.none(), registerLimiter, loginUser);


router.post("/logout", verifyJWT, logoutUser);


router.post("/refresh-token", verifyJWT, refreshAccessToken);


router.get("/profile/:userId", verifyJWT, getUserProfile);


router.get("/:userId/upvoted-services", verifyJWT, getUserUpvotedServices);


router.put("/:userId", verifyJWT, updateUser);

router.get("/:userId/issues", verifyJWT, getUserIssues);
router.get("/:userId/feedbacks", verifyJWT, getUserFeedbacks);

export default router;