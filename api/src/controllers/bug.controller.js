import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/apiError.js";
import { ApiResponse } from "../utils/apiResponse.js";
import { Bug } from "../models/bugSchema.model.js";
import { Comment } from "../models/commentSchema.model.js";
import { Like } from "../models/likeSchema.model.js";

/** ✅ 1. Get All Bugs for a Specific Service */
const getAllBugsForService = asyncHandler(async (req, res) => {
    const { serviceId } = req.params;
    const { page = 1, limit = 10, search = "" } = req.query;

    const query = {
        service: serviceId,
        $or: [
            { title: { $regex: search, $options: "i" } },
            { description: { $regex: search, $options: "i" } }
        ]
    };

    const totalBugs = await Bug.countDocuments(query);
    const totalPages = Math.ceil(totalBugs / limit);

    const bugs = await Bug.find(query)
        .populate("openedBy", "username")
        .skip((page - 1) * limit)
        .limit(parseInt(limit))
        .sort({ createdAt: -1 });

    return res.status(200).json(new ApiResponse(200, { bugs, totalPages, currentPage: parseInt(page) }, "Bugs retrieved successfully."));
});

/** ✅ 2. Get All Bugs Opened by a Specific User */
const getAllBugsByUser = asyncHandler(async (req, res) => {
    const { userId } = req.params;
    const { page = 1, limit = 10 } = req.query;

    const totalBugs = await Bug.countDocuments({ openedBy: userId });
    const totalPages = Math.ceil(totalBugs / limit);

    const bugs = await Bug.find({ openedBy: userId })
        .populate("service", "serviceName") 
        .skip((page - 1) * limit)
        .limit(parseInt(limit))
        .sort({ createdAt: -1 });

    return res.status(200).json(new ApiResponse(200, { bugs, totalPages, currentPage: parseInt(page) }, "User's reported bugs retrieved successfully."));
});

/** ✅ 3. Get a Single Bug with Comments & Replies */
const getBugById = asyncHandler(async (req, res) => {
    const { serviceId, bugId } = req.params;

    const bug = await Bug.findOne({ _id: bugId, service: serviceId })
        .populate("openedBy", "username")
        .populate({
            path: "comments",
            populate: [
                { path: "user", select: "username" },
                { path: "replies", populate: { path: "user", select: "username" } }
            ]
        });

    if (!bug) {
        throw new ApiError(404, "Bug not found.");
    }

    return res.status(200).json(new ApiResponse(200, bug, "Bug details retrieved successfully."));
});

/** ✅ 4. Create a Bug for a Specific Service */
const createBug = asyncHandler(async (req, res) => {
    const { serviceId } = req.params;
    const { title, description } = req.body;
    const userId = req.user._id;

    if (!title || !description) {
        throw new ApiError(400, "Title and description are required.");
    }

    const bug = await Bug.create({ title, description, service: serviceId, openedBy: userId });

    return res.status(201).json(new ApiResponse(201, bug, "Bug reported successfully."));
});

/** ✅ 5. Delete a Bug (Only the Creator Can Delete) */
const deleteBug = asyncHandler(async (req, res) => {
    const { serviceId, bugId } = req.params;
    const userId = req.user._id;

    console.log("🟢 User trying to delete bug:", userId);
    
    const bug = await Bug.findOne({ _id: bugId, service: serviceId });

    if (!bug) {
        throw new ApiError(404, "Bug not found.");
    }

    console.log("🟡 Bug found:", bug);
    console.log("🟡 Bug openedBy:", bug.openedBy.toString());

    if (bug.openedBy.toString() !== userId.toString()) {
        throw new ApiError(403, "Unauthorized: You can only delete your own bug.");
    }

    await bug.deleteOne();
    return res.status(200).json(new ApiResponse(200, {}, "Bug deleted successfully."));
});


/** ✅ 6. Add a Comment to a Bug */
const addComment = asyncHandler(async (req, res) => {
    const { bugId } = req.params; 
    const { message } = req.body;
    const userId = req.user._id;

    if (!message) {
        throw new ApiError(400, "Message cannot be empty.");
    }

    const bug = await Bug.findById(bugId);

    if (!bug) {
        throw new ApiError(404, "Bug not found.");
    }

    // ✅ First, create and save the comment properly
    const comment = await Comment.create({
        user: userId,
        message: message,
    });

    // ✅ Then push ONLY the comment ID into the bug's comments array
    bug.comments.push(comment._id);
    await bug.save(); // Save the bug after updating the comments

    return res.status(201).json(new ApiResponse(201, comment, "Comment added successfully."));
});


/** ✅ 7. Reply to a Comment */
const replyToComment = asyncHandler(async (req, res) => {
    const { commentId } = req.params;
    const { message } = req.body;
    const userId = req.user._id;

    if (!message) {
        throw new ApiError(400, "Reply cannot be empty.");
    }

    const comment = await Comment.findById(commentId);

    if (!comment) {
        throw new ApiError(404, "Comment not found.");
    }

    const reply = await Comment.create({ user: userId, message });
    comment.replies.push(reply._id);
    await comment.save();

    return res.status(201).json(new ApiResponse(201, reply, "Reply added successfully."));
});

/** ✅ 8. Like/Unlike a Comment */
const toggleCommentLike = asyncHandler(async (req, res) => {
    const { commentId } = req.params;
    const userId = req.user._id;

    const existingLike = await Like.findOne({ user: userId, targetId: commentId, targetType: "Comment" });

    if (existingLike) {
        await Like.findByIdAndDelete(existingLike._id);
        return res.status(200).json(new ApiResponse(200, {}, "Comment unliked."));
    }

    const like = await Like.create({ user: userId, targetId: commentId, targetType: "Comment" });
    return res.status(201).json(new ApiResponse(201, like, "Comment liked."));
});

/** ✅ 9. Like/Unlike a Reply */
const toggleReplyLike = asyncHandler(async (req, res) => {
    const { replyId } = req.params;
    const userId = req.user._id;

    const existingLike = await Like.findOne({ user: userId, targetId: replyId, targetType: "Reply" });

    if (existingLike) {
        await Like.findByIdAndDelete(existingLike._id);
        return res.status(200).json(new ApiResponse(200, {}, "Reply unliked."));
    }

    const like = await Like.create({ user: userId, targetId: replyId, targetType: "Reply" });
    return res.status(201).json(new ApiResponse(201, like, "Reply liked."));
});

/** ✅ 10. Delete a Comment (Only Owner) */
const deleteComment = asyncHandler(async (req, res) => {
    const { commentId } = req.params;
    const userId = req.user._id; // The logged-in user trying to delete the comment

    console.log("Comment ID:", commentId);
    console.log("User ID from token:", userId);

    const comment = await Comment.findById(commentId);

    if (!comment) {
        throw new ApiError(404, "Comment not found.");
    }

    console.log("Comment Found:", comment);
    console.log("Comment User ID:", comment.user.toString());

    if (comment.user.toString() !== userId.toString()) {
        throw new ApiError(403, "Unauthorized: You can only delete your own comments.");
    }

    await comment.deleteOne();

    return res.status(200).json(new ApiResponse(200, {}, "Comment deleted successfully."));
});


export {
    getAllBugsForService,
    getAllBugsByUser,
    getBugById,
    createBug,
    deleteBug,
    addComment,
    replyToComment,
    toggleCommentLike,
    toggleReplyLike, // ✅ Added toggle reply like
    deleteComment
};
