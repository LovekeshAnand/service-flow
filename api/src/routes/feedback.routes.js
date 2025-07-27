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
import { registerLimiter } from "../middleware/rateLimiter.js";

const router = express.Router();

router.get("/service/:serviceId/feedbacks", getAllFeedbacksForService);


router.get("/user/:userId/feedbacks", getAllFeedbacksByUser);


router.post("/service/:serviceId/feedbacks", registerLimiter, verifyJWT, upload.none(), createFeedback);


router.get("/service/:serviceId/feedbacks/:feedbackId", getFeedbackById);

router.delete("/service/:serviceId/feedbacks/:feedbackId", verifyJWT, deleteFeedback);


router.post("/service/:serviceId/feedbacks/:feedbackId/upvote", verifyJWT, upvoteFeedback);


router.post("/service/:serviceId/feedbacks/:feedbackId/downvote", verifyJWT, downvoteFeedback);


router.get("/service/:serviceId/feedbacks/:feedbackId/vote", verifyJWT, getUserVote);


router.post("/service/:serviceId/feedbacks/:feedbackId/comments", verifyJWT, upload.none(), addComment);


router.post("/comments/:commentId/replies", verifyJWT, upload.none(), replyToComment);


router.post("/comments/:commentId/like", verifyJWT, toggleCommentLike);


router.post("/replies/:replyId/like", verifyJWT, toggleReplyLike);

router.delete("/comments/:commentId", verifyJWT, deleteComment);

export default router;