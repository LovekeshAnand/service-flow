import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/apiError.js";
import { ApiResponse } from "../utils/apiResponse.js";
import { Issue } from "../models/issueSchema.model.js";
import { Comment } from "../models/commentSchema.model.js";
import { Like } from "../models/likeSchema.model.js";

/** ✅ 1. Get All Issues for a Specific Service */
const getAllIssuesForService = asyncHandler(async (req, res) => {
    const { serviceId } = req.params;
    const { page = 1, limit = 10, search = "" } = req.query;

    const query = {
        service: serviceId,
        $or: [
            { title: { $regex: search, $options: "i" } },
            { description: { $regex: search, $options: "i" } }
        ]
    };

    const totalIssues = await Issue.countDocuments(query);
    const totalPages = Math.ceil(totalIssues / limit);

    const issues = await Issue.find(query)
        .populate("openedBy", "username")
        .skip((page - 1) * limit)
        .limit(parseInt(limit))
        .sort({ createdAt: -1 });

    return res.status(200).json(new ApiResponse(200, { issues, totalPages, currentPage: parseInt(page) }, "Issues retrieved successfully."));
});

/** ✅ 2. Get a Single Issue with Comments & Replies */
const getIssueById = asyncHandler(async (req, res) => {
    const { serviceId, issueId } = req.params;

    const issue = await Issue.findOne({ _id: issueId, service: serviceId })
        .populate("openedBy", "username")
        .populate({
            path: "comments",
            populate: [
                { path: "user", select: "username" },
                { path: "replies", populate: { path: "user", select: "username" } }
            ]
        });

    if (!issue) {
        throw new ApiError(404, "Issue not found.");
    }

    return res.status(200).json(new ApiResponse(200, issue, "Issue details retrieved successfully."));
});

/** ✅ 3. Create an Issue for a Specific Service */
const createIssue = asyncHandler(async (req, res) => {
    const { serviceId } = req.params;
    const { title, description } = req.body;
    const userId = req.user._id;

    if (!title || !description) {
        throw new ApiError(400, "Title and description are required.");
    }

    const issue = await Issue.create({ title, description, service: serviceId, openedBy: userId });

    return res.status(201).json(new ApiResponse(201, issue, "Issue reported successfully."));
});

/** ✅ 4. Delete an Issue (Only the Creator Can Delete) */
const deleteIssue = asyncHandler(async (req, res) => {
    const { serviceId, issueId } = req.params;
    const userId = req.user._id;

    const issue = await Issue.findOne({ _id: issueId, service: serviceId });

    if (!issue) {
        throw new ApiError(404, "Issue not found.");
    }

    if (issue.openedBy.toString() !== userId.toString()) {
        throw new ApiError(403, "Unauthorized: You can only delete your own issues.");
    }

    await Comment.deleteMany({ _id: { $in: issue.comments } });
    await issue.deleteOne();

    return res.status(200).json(new ApiResponse(200, {}, "Issue deleted successfully."));
});

/** ✅ 5. Add a Comment to an Issue */
const addComment = asyncHandler(async (req, res) => {
    const { issueId } = req.params;
    const { message } = req.body;
    const userId = req.user._id;

    if (!message) {
        throw new ApiError(400, "Message cannot be empty.");
    }

    const issue = await Issue.findById(issueId);

    if (!issue) {
        throw new ApiError(404, "Issue not found.");
    }

    const comment = await Comment.create({ user: userId, message });
    issue.comments.push(comment._id);
    await issue.save();

    return res.status(201).json(new ApiResponse(201, comment, "Comment added successfully."));
});

/** ✅ 6. Reply to a Comment */
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

/** ✅ 7. Like/Unlike a Comment */
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

/** ✅ 8. Like/Unlike a Reply */
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

/** ✅ 9. Update a Comment (Only Owner) */
const updateComment = asyncHandler(async (req, res) => {
    const { commentId } = req.params;
    const { message } = req.body;
    const userId = req.user._id;

    const comment = await Comment.findById(commentId);

    if (!comment) {
        throw new ApiError(404, "Comment not found.");
    }

    if (comment.user.toString() !== userId.toString()) {
        throw new ApiError(403, "Unauthorized: You can only update your own comments.");
    }

    comment.message = message;
    await comment.save();

    return res.status(200).json(new ApiResponse(200, comment, "Comment updated successfully."));
});

/** ✅ 10. Delete a Comment (Only Owner) */
const deleteComment = asyncHandler(async (req, res) => {
    const { commentId } = req.params;
    const userId = req.user._id;

    const comment = await Comment.findById(commentId);

    if (!comment) {
        throw new ApiError(404, "Comment not found.");
    }

    if (comment.user.toString() !== userId.toString()) {
        throw new ApiError(403, "Unauthorized: You can only delete your own comments.");
    }

    await comment.deleteOne();

    return res.status(200).json(new ApiResponse(200, {}, "Comment deleted successfully."));
});

export {
    getAllIssuesForService,
    getIssueById,
    createIssue,
    deleteIssue, 
    addComment,
    replyToComment,
    toggleCommentLike,
    toggleReplyLike, 
    updateComment,
    deleteComment
};
