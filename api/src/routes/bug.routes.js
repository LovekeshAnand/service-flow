import express from "express";
import { verifyJWT } from "../middleware/auth.middleware.js";
import {
    getAllBugsForService,
    getBugById,
    createBug,
    deleteBug,
    addComment,
    replyToComment,
    toggleCommentLike,
    toggleReplyLike,
    deleteComment
} from "../controllers/bug.controller.js";
import { upload } from "../middleware/multer.middleware.js";

const router = express.Router();

/** 🔹 BUGS UNDER SERVICES 🔹 */
// ✅ Fetch all bugs for a specific service (Public)
router.get("/:serviceId/bugs", getAllBugsForService);

// ✅ Create a new bug under a service (Protected)
router.post("/service/:serviceId", verifyJWT, upload.none(), createBug);

// ✅ Fetch a single bug with comments & replies (Public)
router.get("/service/:serviceId/bugs/:bugId", getBugById);

// ✅ Delete a bug (Only Owner Can Delete) - (Protected)
router.delete("/service/:serviceId/bugs/:bugId", verifyJWT, deleteBug);

/** 🔹 COMMENTS & REPLIES ON BUGS 🔹 */
// ✅ Add a comment to a bug (Protected)
router.post("/services/:serviceId/bugs/:bugId/comments", verifyJWT, upload.none(), addComment);

// ✅ Reply to a comment (Protected)
router.post("/comments/:commentId/replies", verifyJWT, upload.none(), replyToComment);

// ✅ Like/Unlike a comment (Protected)
router.post("/comments/:commentId/like", verifyJWT, toggleCommentLike);

// ✅ Like/Unlike a reply (Protected)
router.post("/replies/:replyId/like", verifyJWT, toggleReplyLike);

// ✅ Delete a comment (Only Owner)
router.delete("/comments/:commentId", verifyJWT, deleteComment);

export default router;
