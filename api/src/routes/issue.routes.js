import express from "express";
import { verifyJWT } from "../middleware/auth.middleware.js";
import { 
  getAllIssuesForService, 
  getIssueById, 
  createIssue, 
  deleteIssue, 
  addComment, 
  replyToComment, 
  toggleCommentLike, 
  toggleReplyLike, 
  updateComment, 
  deleteComment, 
  upvoteIssue, 
  downvoteIssue, 
  getUserVote, 
  updateIssueStatus 
} from "../controllers/issue.controller.js";
import { upload } from "../middleware/multer.middleware.js";
import { registerLimiter } from "../../middleware/rateLimiter.js";
import { asyncHandler } from "../utils/asyncHandler.js"; // Make sure to import asyncHandler

const router = express.Router();

/** 🔹 ISSUES UNDER SERVICES 🔹 */
// ✅ Fetch all issues for a specific service (Public)
router.get("/service/:serviceId/issues", getAllIssuesForService);

// ✅ Create a new issue under a service (Protected)
router.post("/service/:serviceId/issues", registerLimiter,verifyJWT, upload.none(), createIssue);

// ✅ Fetch a single issue with comments & replies (Public)
router.get("/service/:serviceId/issues/:issueId", getIssueById);

// ✅ Delete an issue (Only Owner Can Delete) - (Protected)
router.delete("/service/:serviceId/issues/:issueId", verifyJWT, deleteIssue);

// ✅ Upvote an issue (Protected)
router.post("/service/:serviceId/issues/:issueId/upvote", registerLimiter,verifyJWT, upvoteIssue);

// ✅ Downvote an issue (Protected)
router.post("/service/:serviceId/issues/:issueId/downvote", registerLimiter, verifyJWT, downvoteIssue);

// Add support for both PATCH and HEAD methods
router.route("/service/:serviceId/issues/:issueId/status")
  .patch(verifyJWT, updateIssueStatus)
  .head(verifyJWT, (req, res) => res.status(200).end());

// ✅ Get user's vote on an issue (Protected)
router.get("/service/:serviceId/issues/:issueId/vote", verifyJWT, getUserVote);

// Add HEAD method for vote checking
router.head("/service/:serviceId/issues/:issueId/vote", verifyJWT, (req, res) => {
    res.status(200).end();
});
/** 🔹 COMMENTS & REPLIES ON ISSUES 🔹 */
// ✅ Add a comment to an issue (Protected)
router.post("/service/:serviceId/issues/:issueId/comments", verifyJWT, upload.none(), addComment);

// ✅ Reply to a comment (Protected)
router.post("/comments/:commentId/replies", verifyJWT, upload.none(), replyToComment);

// ✅ Like/Unlike a comment (Protected)
router.post("/comments/:commentId/like", verifyJWT, toggleCommentLike);

// ✅ Like/Unlike a reply (Protected)
router.post("/replies/:replyId/like", verifyJWT, toggleReplyLike);

// ✅ Update a comment (Only Owner)
router.put("/comments/:commentId", verifyJWT, upload.none(), updateComment);

// ✅ Delete a comment (Only Owner)
router.delete("/comments/:commentId", verifyJWT, deleteComment);

export default router;