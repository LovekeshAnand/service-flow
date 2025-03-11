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
    deleteComment
} from "../controllers/issue.controller.js";
import { upload } from "../middleware/multer.middleware.js";

const router = express.Router();

/** 🔹 ISSUES UNDER SERVICES 🔹 */
// ✅ Fetch all issues for a specific service (Public)
router.get("/:serviceId/issues", getAllIssuesForService);

// ✅ Create a new issue under a service (Protected)
router.post("/service/:serviceId", verifyJWT, upload.none(), createIssue);

// ✅ Fetch a single issue with comments & replies (Public)
router.get("/service/:serviceId/issues/:issueId", getIssueById);

// ✅ Delete an issue (Only Owner Can Delete) - (Protected)
router.delete("/service/:serviceId/issues/:issueId", verifyJWT, deleteIssue);

/** 🔹 COMMENTS & REPLIES ON ISSUES 🔹 */
// ✅ Add a comment to an issue (Protected)
router.post("/services/:serviceId/issues/:issueId/comments", verifyJWT, upload.none(), addComment);

// ✅ Reply to a comment (Protected)
router.post("/comments/:commentId/replies", verifyJWT, upload.none(), replyToComment);

// ✅ Like/Unlike a comment (Protected)
router.post("/comments/:commentId/like", verifyJWT, toggleCommentLike);

// ✅ Like/Unlike a reply (Protected)
router.post("/replies/:replyId/like", verifyJWT, toggleReplyLike);

// ✅ Delete a comment (Only Owner)
router.delete("/comments/:commentId", verifyJWT, deleteComment);

export default router;
