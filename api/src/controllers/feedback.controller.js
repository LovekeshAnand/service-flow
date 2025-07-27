import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/apiError.js";
import { ApiResponse } from "../utils/apiResponse.js";
import { Feedback } from "../models/feedbackSchema.model.js";
import { Comment } from "../models/commentSchema.model.js";
import { Like } from "../models/likeSchema.model.js";
import { Vote } from "../models/voteSchema.model.js";

const getAllFeedbacksForService = asyncHandler(async (req, res) => {
    const { serviceId } = req.params;
    const { page = 1, limit = 10, search = "", sortBy = "votes" } = req.query;

    const query = {
        service: serviceId,
        $or: [
            { title: { $regex: search, $options: "i" } },
            { description: { $regex: search, $options: "i" } }
        ]
    };

    const totalFeedbacks = await Feedback.countDocuments(query);
    const totalPages = Math.ceil(totalFeedbacks / limit);

    let sortOrder = {};
    if (sortBy === "votes") {
        sortOrder = { netVotes: -1, createdAt: -1 };
    } else if (sortBy === "date") {
        sortOrder = { createdAt: -1 };
    } else {
        sortOrder = { netVotes: -1, createdAt: -1 };
    }

    const feedbacks = await Feedback.find(query)
        .populate("openedBy", "username")
        .skip((page - 1) * limit)
        .limit(parseInt(limit))
        .sort(sortOrder);

    return res.status(200).json(new ApiResponse(200, { feedbacks, totalPages, currentPage: parseInt(page) }, "Feedbacks retrieved successfully."));
});

const getAllFeedbacksByUser = asyncHandler(async (req, res) => {
    const { userId } = req.params;
    const { page = 1, limit = 10 } = req.query;

    const totalFeedbacks = await Feedback.countDocuments({ openedBy: userId });
    const totalPages = Math.ceil(totalFeedbacks / limit);

    const feedbacks = await Feedback.find({ openedBy: userId })
        .populate("service", "serviceName")
        .skip((page - 1) * limit)
        .limit(parseInt(limit))
        .sort({ createdAt: -1 });

    return res.status(200).json(new ApiResponse(200, { feedbacks, totalPages, currentPage: parseInt(page) }, "User's feedbacks retrieved successfully."));
});

const getFeedbackById = asyncHandler(async (req, res) => {
    const { serviceId, feedbackId } = req.params;
    const userId = req.user?._id;

    const feedback = await Feedback.findOne({ _id: feedbackId, service: serviceId })
        .populate("openedBy", "username")
        .populate({
            path: "comments",
            populate: [
                { path: "user", select: "username" },
                { path: "replies", populate: { path: "user", select: "username" } }
            ]
        });

    if (!feedback) {
        throw new ApiError(404, "Feedback not found.");
    }
    let userVote = null;
    if (userId) {
        userVote = await Vote.findOne({ user: userId, feedback: feedbackId });
    }

    const responseData = {
        ...feedback.toObject(),
        userVote: userVote ? userVote.voteType : null
    };

    return res.status(200).json(new ApiResponse(200, responseData, "Feedback details retrieved successfully."));
});

const createFeedback = asyncHandler(async (req, res) => {
    const { serviceId } = req.params;
    const { title, description } = req.body;
    const userId = req.user._id;

    if (!title || !description) {
        throw new ApiError(400, "Title and description are required.");
    }

    const feedback = await Feedback.create({ 
        title, 
        description, 
        service: serviceId, 
        openedBy: userId,
        upvotes: 0,
        downvotes: 0,
        netVotes: 0
    });

    return res.status(201).json(new ApiResponse(201, feedback, "Feedback created successfully."));
});


const deleteFeedback = asyncHandler(async (req, res) => {
    const { serviceId, feedbackId } = req.params;
    const userId = req.user._id;

    const feedback = await Feedback.findOne({ _id: feedbackId, service: serviceId });

    if (!feedback) {
        throw new ApiError(404, "Feedback not found.");
    }

    if (feedback.openedBy.toString() !== userId.toString()) {
        throw new ApiError(403, "Unauthorized: You can only delete your own feedback.");
    }

    await Vote.deleteMany({ feedback: feedbackId });
    

    await Comment.deleteMany({ _id: { $in: feedback.comments } });
    await feedback.deleteOne();

    return res.status(200).json(new ApiResponse(200, {}, "Feedback deleted successfully."));
});


const addComment = asyncHandler(async (req, res) => {
    const { feedbackId } = req.params;
    const { message } = req.body;
    const userId = req.user._id;

    if (!message) {
        throw new ApiError(400, "Message cannot be empty.");
    }

    const feedback = await Feedback.findById(feedbackId);

    if (!feedback) {
        throw new ApiError(404, "Feedback not found.");
    }

    const comment = await Comment.create({ user: userId, message });
    feedback.comments.push(comment._id);
    await feedback.save();

    return res.status(201).json(new ApiResponse(201, comment, "Comment added successfully."));
});


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

const upvoteFeedback = asyncHandler(async (req, res) => {
    const { feedbackId } = req.params;
    const userId = req.user._id;

    const feedback = await Feedback.findById(feedbackId);
    if (!feedback) {
        throw new ApiError(404, "Feedback not found.");
    }


    const existingVote = await Vote.findOne({ 
        user: userId, 
        targetId: feedbackId,
        targetType: "Feedback" 
    });

    if (existingVote) {
        if (existingVote.voteType === "upvote") {

            await Vote.findByIdAndDelete(existingVote._id);
            
            feedback.upvotes -= 1;
            feedback.netVotes -= 1;
            await feedback.save();
            
            return res.status(200).json(new ApiResponse(200, { voteType: null }, "Upvote removed."));
        } else {

            existingVote.voteType = "upvote";
            await existingVote.save();
            

            feedback.upvotes += 1;
            feedback.downvotes -= 1;
            feedback.netVotes += 2; 
            await feedback.save();
            
            return res.status(200).json(new ApiResponse(200, { voteType: "upvote" }, "Vote changed to upvote."));
        }
    } else {

        await Vote.create({ 
            user: userId, 
            targetId: feedbackId,
            targetType: "Feedback",
            voteType: "upvote" 
        });
        

        feedback.upvotes += 1;
        feedback.netVotes += 1;
        await feedback.save();
        
        return res.status(201).json(new ApiResponse(201, { voteType: "upvote" }, "Feedback upvoted."));
    }
});


const downvoteFeedback = asyncHandler(async (req, res) => {
    const { feedbackId } = req.params;
    const userId = req.user._id;

    const feedback = await Feedback.findById(feedbackId);
    if (!feedback) {
        throw new ApiError(404, "Feedback not found.");
    }


    const existingVote = await Vote.findOne({ 
        user: userId, 
        targetId: feedbackId,
        targetType: "Feedback" 
    });

    if (existingVote) {
        if (existingVote.voteType === "downvote") {

            await Vote.findByIdAndDelete(existingVote._id);
            

            feedback.downvotes -= 1;
            feedback.netVotes += 1;
            await feedback.save();
            
            return res.status(200).json(new ApiResponse(200, { voteType: null }, "Downvote removed."));
        } else {

            existingVote.voteType = "downvote";
            await existingVote.save();
            feedback.upvotes -= 1;
            feedback.downvotes += 1;
            feedback.netVotes -= 2; 
            await feedback.save();
            
            return res.status(200).json(new ApiResponse(200, { voteType: "downvote" }, "Vote changed to downvote."));
        }
    } else {

        await Vote.create({ 
            user: userId, 
            targetId: feedbackId,
            targetType: "Feedback",
            voteType: "downvote" 
        });
        

        feedback.downvotes += 1;
        feedback.netVotes -= 1;
        await feedback.save();
        
        return res.status(201).json(new ApiResponse(201, { voteType: "downvote" }, "Feedback downvoted."));
    }
});


const getUserVote = asyncHandler(async (req, res) => {
    const { feedbackId } = req.params;
    const userId = req.user._id;

    const vote = await Vote.findOne({ user: userId, feedback: feedbackId });
    
    if (!vote) {
        return res.status(200).json(new ApiResponse(200, { voteType: null }, "User has not voted on this feedback."));
    }
    
    return res.status(200).json(new ApiResponse(200, { voteType: vote.voteType }, "User's vote retrieved successfully."));
});

export {
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
}