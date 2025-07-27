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
import { registerLimiter } from "../middleware/rateLimiter.js";
import { asyncHandler } from "../utils/asyncHandler.js"; 

const router = express.Router();


router.get("/service/:serviceId/issues", getAllIssuesForService);

router.post("/service/:serviceId/issues", registerLimiter,verifyJWT, upload.none(), createIssue);


router.get("/service/:serviceId/issues/:issueId", getIssueById);


router.delete("/service/:serviceId/issues/:issueId", verifyJWT, deleteIssue);

router.post("/service/:serviceId/issues/:issueId/upvote", registerLimiter,verifyJWT, upvoteIssue);

router.post("/service/:serviceId/issues/:issueId/downvote", registerLimiter, verifyJWT, downvoteIssue);

router.route("/service/:serviceId/issues/:issueId/status")
  .patch(verifyJWT, updateIssueStatus)
  .head(verifyJWT, (req, res) => res.status(200).end());

router.get("/service/:serviceId/issues/:issueId/vote", verifyJWT, getUserVote);

router.head("/service/:serviceId/issues/:issueId/vote", verifyJWT, (req, res) => {
    res.status(200).end();
});

router.post("/service/:serviceId/issues/:issueId/comments", verifyJWT, upload.none(), addComment);


router.post("/comments/:commentId/replies", verifyJWT, upload.none(), replyToComment);


router.post("/comments/:commentId/like", verifyJWT, toggleCommentLike);


router.post("/replies/:replyId/like", verifyJWT, toggleReplyLike);


router.put("/comments/:commentId", verifyJWT, upload.none(), updateComment);

router.delete("/comments/:commentId", verifyJWT, deleteComment);

export default router;