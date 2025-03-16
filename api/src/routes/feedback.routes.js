import express from "express";
import { verifyJWT } from "../middleware/auth.middleware.js";
import {
    getAllFeedbacksForService,
    getAllFeedbacksByUser,
    getFeedbackById,
    createFeedback,
    deleteFeedback,
    addComment,
    replyToComment,
    toggleCommentLike,
    toggleReplyLike,
    deleteComment,
    upvoteFeedback,
    downvoteFeedback,
    getUserVote
} from "../controllers/feedback.controller.js";
import { upload } from "../middleware/multer.middleware.js";
import { registerLimiter } from "../../middleware/rateLimiter.js";

const router = express.Router();

/** 🔹 FEEDBACK UNDER SERVICES 🔹 */
// ✅ Fetch all feedback for a specific service (Public)
router.get("/service/:serviceId/feedbacks", getAllFeedbacksForService);

// ✅ Fetch all feedback created by a specific user (Public)
router.get("/user/:userId/feedbacks", getAllFeedbacksByUser);

// ✅ Create a new feedback under a service (Protected)
router.post("/service/:serviceId/feedbacks", registerLimiter, verifyJWT, upload.none(), createFeedback);

// ✅ Fetch a single feedback with comments & replies (Public)
router.get("/service/:serviceId/feedbacks/:feedbackId", getFeedbackById);

// ✅ Delete feedback (Only Owner Can Delete) - (Protected)
router.delete("/service/:serviceId/feedbacks/:feedbackId", verifyJWT, deleteFeedback);

// ✅ Upvote a feedback (Protected)
router.post("/service/:serviceId/feedbacks/:feedbackId/upvote", verifyJWT, upvoteFeedback);

// ✅ Downvote a feedback (Protected)
router.post("/service/:serviceId/feedbacks/:feedbackId/downvote", verifyJWT, downvoteFeedback);

// ✅ Get user's vote on a feedback (Protected)
router.get("/service/:serviceId/feedbacks/:feedbackId/vote", verifyJWT, getUserVote);

/** 🔹 COMMENTS & REPLIES ON FEEDBACK 🔹 */
// ✅ Add a comment to a feedback (Protected)
router.post("/service/:serviceId/feedbacks/:feedbackId/comments", verifyJWT, upload.none(), addComment);

// ✅ Reply to a comment (Protected)
router.post("/comments/:commentId/replies", verifyJWT, upload.none(), replyToComment);

// ✅ Like/Unlike a comment (Protected)
router.post("/comments/:commentId/like", verifyJWT, toggleCommentLike);

// ✅ Like/Unlike a reply (Protected)
router.post("/replies/:replyId/like", verifyJWT, toggleReplyLike);

// ✅ Delete a comment (Only Owner)
router.delete("/comments/:commentId", verifyJWT, deleteComment);

export default router;