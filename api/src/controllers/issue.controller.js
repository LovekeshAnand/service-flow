import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/apiError.js";
import { ApiResponse } from "../utils/apiResponse.js";
import { Issue } from "../models/issueSchema.model.js";
import { Comment } from "../models/commentSchema.model.js";
import { Like } from "../models/likeSchema.model.js";
import { Vote } from "../models/voteSchema.model.js";
import { Service } from "../models/serviceSchema.model.js";

const getAllIssuesForService = asyncHandler(async (req, res) => {
    const { serviceId } = req.params;
    const { page = 1, limit = 10, search = "", sortBy = "votes" } = req.query;

    const query = {
        service: serviceId,
        $or: [
            { title: { $regex: search, $options: "i" } },
            { description: { $regex: search, $options: "i" } }
        ]
    };

    const totalIssues = await Issue.countDocuments(query);
    const totalPages = Math.ceil(totalIssues / limit);


    let sortOrder = {};
    if (sortBy === "votes") {
        sortOrder = { netVotes: -1, createdAt: -1 }; 
    } else if (sortBy === "date") {
        sortOrder = { createdAt: -1 };
    } else {
        sortOrder = { netVotes: -1, createdAt: -1 }; 
    }

    const issues = await Issue.find(query)
        .populate("openedBy", "username")
        .skip((page - 1) * limit)
        .limit(parseInt(limit))
        .sort(sortOrder);

    return res.status(200).json(new ApiResponse(200, { issues, totalPages, currentPage: parseInt(page) }, "Issues retrieved successfully."));
});


const getIssueById = asyncHandler(async (req, res) => {
    const { serviceId, issueId } = req.params;
    const userId = req.user?._id;


    const issue = await Issue.findOne({ _id: issueId, service: serviceId })
        .populate("openedBy", "username");
    
    if (!issue) {
        throw new ApiError(404, "Issue not found.");
    }
    

    const comments = await Comment.find({ _id: { $in: issue.comments } })
        .populate("user", "username");

    const commentsWithLikes = await Promise.all(comments.map(async (comment) => {

        const replies = await Comment.find({ _id: { $in: comment.replies } })
            .populate("user", "username");

        const repliesWithLikes = await Promise.all(replies.map(async (reply) => {
            const likeCount = await Like.countDocuments({ 
                targetId: reply._id, 
                targetType: "Reply" 
            });

            let hasLiked = false;
            if (userId) {
                hasLiked = await Like.exists({ 
                    targetId: reply._id, 
                    targetType: "Reply",
                    user: userId 
                });
            }
            
            return {
                ...reply.toObject(),
                likeCount,
                hasLiked: !!hasLiked
            };
        }));

        const likeCount = await Like.countDocuments({ 
            targetId: comment._id, 
            targetType: "Comment" 
        });

        let hasLiked = false;
        if (userId) {
            hasLiked = await Like.exists({ 
                targetId: comment._id, 
                targetType: "Comment",
                user: userId 
            });
        }
        
        return {
            ...comment.toObject(),
            replies: repliesWithLikes,
            likeCount,
            hasLiked: !!hasLiked
        };
    }));

    let userVote = null;
    if (userId) {
        userVote = await Vote.findOne({ 
            user: userId, 
            targetId: issueId,
            targetType: "Issue" 
        });
    }

    const responseData = {
        ...issue.toObject(),
        comments: commentsWithLikes,
        userVote: userVote ? userVote.voteType : null
    };

    return res.status(200).json(new ApiResponse(200, responseData, "Issue details retrieved successfully."));
});


const createIssue = asyncHandler(async (req, res) => {
    const { serviceId } = req.params;
    const { title, description } = req.body;
    const userId = req.user._id;

    if (!title || !description) {
        throw new ApiError(400, "Title and description are required.");
    }

    const issue = await Issue.create({ 
        title, 
        description, 
        service: serviceId, 
        openedBy: userId,
        upvotes: 0,
        downvotes: 0,
        netVotes: 0
    });

    return res.status(201).json(new ApiResponse(201, issue, "Issue reported successfully."));
});


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

    await Vote.deleteMany({ 
        targetId: issueId,
        targetType: "Issue"
    });

    await Comment.deleteMany({ _id: { $in: issue.comments } });
    await issue.deleteOne();

    return res.status(200).json(new ApiResponse(200, {}, "Issue deleted successfully."));
});


const addComment = asyncHandler(async (req, res) => {
    const { issueId } = req.params;
    const { message } = req.body;
    const userId = req.user?._id;

    if (!userId) {
        throw new ApiError(401, "Authentication required to add a comment.");
    }

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


    const comment = await Comment.findById(commentId);
    if (!comment) {
        throw new ApiError(404, "Comment not found.");
    }

    let action = "";
    let hasLiked = false;

    if (existingLike) {

        await Like.findByIdAndDelete(existingLike._id);
        action = "unliked";
        hasLiked = false;
    } else {

        await Like.create({ user: userId, targetId: commentId, targetType: "Comment" });
        action = "liked";
        hasLiked = true;
    }


    const likeCount = await Like.countDocuments({ targetId: commentId, targetType: "Comment" });

    return res.status(200).json(
        new ApiResponse(200, { hasLiked, likeCount }, `Comment ${action}.`)
    );
});


const toggleReplyLike = asyncHandler(async (req, res) => {
    const { replyId } = req.params;
    const userId = req.user._id;


    const reply = await Comment.findById(replyId);
    if (!reply) {
        throw new ApiError(404, "Reply not found.");
    }

    const existingLike = await Like.findOne({ user: userId, targetId: replyId, targetType: "Reply" });

    let action = "";
    let hasLiked = false;

    if (existingLike) {

        await Like.findByIdAndDelete(existingLike._id);
        action = "unliked";
        hasLiked = false;
    } else {

        await Like.create({ user: userId, targetId: replyId, targetType: "Reply" });
        action = "liked";
        hasLiked = true;
    }


    const likeCount = await Like.countDocuments({ targetId: replyId, targetType: "Reply" });

    return res.status(200).json(
        new ApiResponse(200, { hasLiked, likeCount }, `Reply ${action}.`)
    );
});

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

const updateIssueStatus = asyncHandler(async (req, res) => {
    const { serviceId, issueId } = req.params;
    const { status } = req.body;
    
    const userId = req.user?._id || req.service?._id;

    if (!userId) {
      return res.status(401).json({ error: "Unauthorized: User/Service ID is missing" });
    }


    const validStatuses = ['open', 'in-progress', 'resolved', 'closed'];
    if (!validStatuses.includes(status)) {
      throw new ApiError(400, "Invalid status value");
    }

    const service = await Service.findById(serviceId);
    if (!service) {
      throw new ApiError(404, "Service not found");
    }
    if (service._id.toString() !== userId.toString()) {
      throw new ApiError(403, "Only service owners can update issue status");
    }

    const issue = await Issue.findOneAndUpdate(
      { _id: issueId, service: serviceId },
      { status },
      { new: true }
    );

    if (!issue) {
      throw new ApiError(404, "Issue not found");
    }

    return res.status(200).json(new ApiResponse(200, issue, "Issue status updated successfully"));
});



const upvoteIssue = asyncHandler(async (req, res) => {
    const { issueId } = req.params;
    const userId = req.user._id;

    const issue = await Issue.findById(issueId);
    if (!issue) {
        throw new ApiError(404, "Issue not found.");
    }

    const existingVote = await Vote.findOne({ 
        user: userId, 
        targetId: issueId,
        targetType: "Issue" 
    });

    if (existingVote) {
        if (existingVote.voteType === "upvote") {

            await Vote.findByIdAndDelete(existingVote._id);

            issue.upvotes -= 1;
            issue.netVotes -= 1;
            await issue.save();
            
            return res.status(200).json(new ApiResponse(200, { voteType: null }, "Upvote removed."));
        } else {
            existingVote.voteType = "upvote";
            await existingVote.save();
            issue.upvotes += 1;
            issue.downvotes -= 1;
            issue.netVotes += 2;
            await issue.save();
            
            return res.status(200).json(new ApiResponse(200, { voteType: "upvote" }, "Vote changed to upvote."));
        }
    } else {

        await Vote.create({ 
            user: userId, 
            targetId: issueId,
            targetType: "Issue",
            voteType: "upvote" 
        });

        issue.upvotes += 1;
        issue.netVotes += 1;
        await issue.save();
        
        return res.status(201).json(new ApiResponse(201, { voteType: "upvote" }, "Issue upvoted."));
    }
});

const downvoteIssue = asyncHandler(async (req, res) => {
    const { issueId } = req.params;
    const userId = req.user._id;

    const issue = await Issue.findById(issueId);
    if (!issue) {
        throw new ApiError(404, "Issue not found.");
    }

    const existingVote = await Vote.findOne({ 
        user: userId, 
        targetId: issueId,
        targetType: "Issue" 
    });

    if (existingVote) {
        if (existingVote.voteType === "downvote") {
            await Vote.findByIdAndDelete(existingVote._id);

            issue.downvotes -= 1;
            issue.netVotes += 1;
            await issue.save();
            
            return res.status(200).json(new ApiResponse(200, { voteType: null }, "Downvote removed."));
        } else {
            existingVote.voteType = "downvote";
            await existingVote.save();
            
            issue.upvotes -= 1;
            issue.downvotes += 1;
            issue.netVotes -= 2; 
            await issue.save();
            
            return res.status(200).json(new ApiResponse(200, { voteType: "downvote" }, "Vote changed to downvote."));
        }
    } else {
        await Vote.create({ 
            user: userId, 
            targetId: issueId,
            targetType: "Issue",
            voteType: "downvote" 
        });
        
        issue.downvotes += 1;
        issue.netVotes -= 1;
        await issue.save();
        
        return res.status(201).json(new ApiResponse(201, { voteType: "downvote" }, "Issue downvoted."));
    }
});

const getUserVote = asyncHandler(async (req, res) => {

    const { issueId } = req.params;
    const userId = req.user?._id || req.service?._id; 

    if (!userId) {
      return res.status(401).json({ error: "Unauthorized: User/Service ID is missing" });
    }

    const vote = await Vote.findOne({ user: userId, issue: issueId });

    if (!vote) {
        return res.status(200).json(new ApiResponse(200, { voteType: null }, "User has not voted on this issue."));
    }

    return res.status(200).json(new ApiResponse(200, { voteType: vote.voteType }, "User's vote retrieved successfully."));
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
    deleteComment,
    upvoteIssue,
    downvoteIssue,
    getUserVote,
    updateIssueStatus
}