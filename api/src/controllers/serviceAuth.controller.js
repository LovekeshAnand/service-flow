import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/apiError.js";
import { Service } from "../models/serviceSchema.model.js";
import { ServiceVote } from "../models/serviceVoteSchema.model.js";
import { ApiResponse } from "../utils/apiResponse.js";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import { Feedback } from "../models/feedbackSchema.model.js";
import { Issue } from "../models/issueSchema.model.js";
import { uploadOnCloudinary, deleteFromCloudinary } from "../utils/cloudinary.js";
import mongoose from "mongoose"

/** ✅ Generate Access and Refresh Tokens */
const generateAccessAndRefreshTokens = async (serviceId) => {
    try {
        const service = await Service.findById(serviceId);
        const accessToken = service.generateAccessToken();
        const refreshToken = service.generateRefreshToken();

        service.refreshToken = refreshToken;
        await service.save({ validateBeforeSave: false });

        return { accessToken, refreshToken };
    } catch (error) {
        throw new ApiError(500, "Something went wrong while generating tokens.");
    }
};

/** ✅ Register Service (Uploads logo to Cloudinary) */
const registerService = asyncHandler(async (req, res) => {
    const { serviceName, email, password, description, serviceLink } = req.body;
    const logoLocalPath = req.file?.path;

    if (![serviceName, email, password, description, serviceLink].every(Boolean) || !logoLocalPath) {
        throw new ApiError(400, "All fields, including logo, are required");
    }

    const existingService = await Service.findOne({ email });
    if (existingService) {
        throw new ApiError(409, "Service with this email already exists");
    }

    // Upload logo to Cloudinary
    const logoUpload = await uploadOnCloudinary(logoLocalPath);
    if (!logoUpload || !logoUpload.url) {
        throw new ApiError(500, "Error while uploading logo to Cloudinary");
    }

    const logoUrl = logoUpload.url;
    const cloudinaryLogoId = logoUrl.split("/").pop().split(".")[0];

    const service = await Service.create({
        serviceName,
        serviceLink,
        email,
        password,
        description,
        logo: logoUrl,
        cloudinaryLogoId
    });

    // Fetch created service without sensitive fields
    const createdService = await Service.findById(service._id).select("-password -refreshToken");

    // Generate tokens
    const { accessToken, refreshToken } = await generateAccessAndRefreshTokens(service._id);

    if (!accessToken || !refreshToken) {
        throw new ApiError(500, "Failed to generate authentication tokens");
    }

    // Set cookies securely
    const cookieOptions = {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "Strict",
    };

    res.cookie("accessToken", accessToken, cookieOptions);
    res.cookie("refreshToken", refreshToken, cookieOptions);

    // Send response
    return res.status(201).json(
        new ApiResponse(201, {
            service: createdService,
            accessToken,
            refreshToken,
        }, "Service registered successfully!")
    );
});

/** ✅ Login Service */
const loginService = asyncHandler(async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        throw new ApiError(400, "Email and password are required.");
    }

    const service = await Service.findOne({ email });
    if (!service) {
        throw new ApiError(404, "Service does not exist.");
    }

    const isPasswordValid = await service.isPasswordCorrect(password);
    if (!isPasswordValid) {
        throw new ApiError(401, "Invalid credentials.");
    }

    // Generate tokens
    const { accessToken, refreshToken } = await generateAccessAndRefreshTokens(service._id);

    if (!accessToken || !refreshToken) {
        throw new ApiError(500, "Failed to generate authentication tokens.");
    }

    // Fetch service without sensitive fields
    const loggedInService = await Service.findById(service._id).select("-password -refreshToken");

    // Set cookies securely
    const cookieOptions = {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "Strict",
    };

    res.cookie("accessToken", accessToken, cookieOptions);
    res.cookie("refreshToken", refreshToken, cookieOptions);

    return res.status(200).json(
        new ApiResponse(200, { 
            service: loggedInService, 
            accessToken, 
            refreshToken 
        }, "Service logged in successfully.")
    );
});

/** ✅ Logout Service */
const logoutService = asyncHandler(async (req, res) => {
    if (!req.service) {
        throw new ApiError(401, "Unauthorized request: Service not found.");
    }

    await Service.findByIdAndUpdate(req.service._id, { refreshToken: undefined }, { new: true });

    const cookieOptions = {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
    };

    return res.status(200)
        .clearCookie("accessToken", cookieOptions)
        .clearCookie("refreshToken", cookieOptions)
        .json(new ApiResponse(200, {}, "Service logged out successfully."));
});

/** ✅ Refresh Access Token */
const refreshServiceAccessToken = asyncHandler(async (req, res) => {
    const incomingRefreshToken = req.cookies.refreshToken || req.body.refreshToken;
    if (!incomingRefreshToken) {
        throw new ApiError(401, "Unauthorized request: Refresh token missing.");
    }

    try {
        const decodedToken = jwt.verify(incomingRefreshToken, process.env.REFRESH_TOKEN_SECRET);
        const service = await Service.findById(decodedToken?._id);

        if (!service || incomingRefreshToken !== service.refreshToken) {
            throw new ApiError(401, "Invalid or expired refresh token.");
        }

        const { accessToken, refreshToken: newRefreshToken } = await generateAccessAndRefreshTokens(service._id);

        const cookieOptions = {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "Strict"
        };

        return res.status(200)
            .cookie("accessToken", accessToken, cookieOptions)
            .cookie("refreshToken", newRefreshToken, cookieOptions)
            .json(new ApiResponse(200, { accessToken, refreshToken: newRefreshToken }, "Access token refreshed successfully."));
    } catch (error) {
        throw new ApiError(401, error?.message || "Invalid refresh token.");
    }
});

/** ✅ Update Service (Supports Cloudinary Logo Update) */
const updateService = asyncHandler(async (req, res) => {
    const { serviceId } = req.params;
    const { serviceName, email, description, password, serviceLink } = req.body;
    const logoLocalPath = req.file?.path;

    if (req.service._id.toString() !== serviceId) {
        throw new ApiError(403, "Unauthorized: You can only update your own service.");
    }

    let service = await Service.findById(serviceId);
    if (!service) {
        throw new ApiError(404, "Service not found.");
    }

    // Handle email update
    if (email && email !== service.email) {
        const emailExists = await Service.findOne({ email, _id: { $ne: serviceId } });
        if (emailExists) {
            throw new ApiError(409, "Email is already in use by another service.");
        }
        service.email = email;
    }

    // Upload new logo & delete old one only if a new file is provided
    if (logoLocalPath) {
        // Delete old logo if it exists
        if (service.cloudinaryLogoId) {
            await deleteFromCloudinary(service.cloudinaryLogoId);
        }

        const newLogo = await uploadOnCloudinary(logoLocalPath);
        if (!newLogo || !newLogo.url) {
            throw new ApiError(500, "Error while uploading new logo to Cloudinary");
        }

        const newLogoUrl = newLogo.url;
        const newCloudinaryLogoId = newLogoUrl.split("/").pop().split(".")[0];
        
        service.logo = newLogoUrl;
        service.cloudinaryLogoId = newCloudinaryLogoId;
    }

    // Update other fields if provided
    if (serviceName) service.serviceName = serviceName;
    if (description) service.description = description;
    if (serviceLink) service.serviceLink = serviceLink;
    if (password) service.password = await bcrypt.hash(password, 10);

    await service.save();
    
    // Return updated service without sensitive fields
    const updatedService = await Service.findById(serviceId).select("-password -refreshToken");

    return res.status(200).json(new ApiResponse(200, updatedService, "Service updated successfully."));
});

/** ✅ Delete Service (Deletes Cloudinary Logo) */
const deleteService = asyncHandler(async (req, res) => {
    const { serviceId } = req.params;

    if (req.service._id.toString() !== serviceId) {
        throw new ApiError(403, "Unauthorized: You can only delete your own service.");
    }

    const service = await Service.findById(serviceId);
    if (!service) {
        throw new ApiError(404, "Service not found.");
    }

    // Delete logo from Cloudinary
    if (service.cloudinaryLogoId) {
        await deleteFromCloudinary(service.cloudinaryLogoId, "image");
    }

    // Delete all related data
    await Promise.all([
        ServiceVote.deleteMany({ service: serviceId }),
        Feedback.deleteMany({ service: serviceId }),
        Issue.deleteMany({ service: serviceId }),
        Service.findByIdAndDelete(serviceId)
    ]);

    // Clear cookies
    const cookieOptions = {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
    };

    return res.status(200)
        .clearCookie("accessToken", cookieOptions)
        .clearCookie("refreshToken", cookieOptions)
        .json(new ApiResponse(200, {}, "Service deleted successfully with all related data."));
});

/** ✅ Get Service Details */
const getServiceDetails = asyncHandler(async (req, res) => {
    const { serviceId } = req.params;

    // Fetch service details with essential fields
    const service = await Service.findById(serviceId).select("logo description serviceName email serviceLink upvotes createdAt updatedAt");
    
    if (!service) {
        throw new ApiError(404, "Service not found.");
    }

    // Fetch related statistics
    const [feedbackCount, issueCount] = await Promise.all([
        Feedback.countDocuments({ service: serviceId }),
        Issue.countDocuments({ service: serviceId })
    ]);

    // Check if the user has upvoted this service
    let hasUpvoted = false;
    if (req.user) {
        const userVote = await ServiceVote.findOne({ 
            user: req.user._id,
            service: serviceId
        });
        hasUpvoted = !!userVote;
    }

    // Send response
    return res.status(200).json(new ApiResponse(200, {
        _id: service._id,
        logo: service.logo,
        serviceLink: service.serviceLink,
        description: service.description,
        serviceName: service.serviceName,
        email: service.email,
        upvotes: service.upvotes,
        hasUpvoted,
        feedbacks: feedbackCount,
        issues: issueCount,
        createdAt: service.createdAt,
        updatedAt: service.updatedAt
    }, "Service details retrieved successfully."));
});

/** ✅ Get Service Activity Data */
const getServiceActivity = asyncHandler(async (req, res) => {
    const { serviceId } = req.params;
    const { days = 30 } = req.query;

    // Ensure requesting service owns this data or has admin permissions
    if (req.service && req.service._id.toString() !== serviceId && !req.service.isAdmin) {
        throw new ApiError(403, "Unauthorized: You can only access your own service activity.");
    }

    const service = await Service.findById(serviceId);
    if (!service) {
        throw new ApiError(404, "Service not found.");
    }

    // Calculate start date for activity period
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(endDate.getDate() - parseInt(days));

    // Get upvotes, feedbacks, and issues in the date range
    const [upvotes, feedbacks, issues] = await Promise.all([
        ServiceVote.find({ 
            service: serviceId,
            createdAt: { $gte: startDate, $lte: endDate }
        }).sort({ createdAt: 1 }),
        Feedback.find({ 
            service: serviceId,
            createdAt: { $gte: startDate, $lte: endDate }
        }).sort({ createdAt: 1 }),
        Issue.find({ 
            service: serviceId,
            createdAt: { $gte: startDate, $lte: endDate }
        }).sort({ createdAt: 1 })
    ]);

    // Generate daily activity data
    const activityData = [];
    const daysCount = parseInt(days);
    
    for (let i = 0; i < daysCount; i++) {
        const date = new Date(startDate);
        date.setDate(startDate.getDate() + i);
        const dateStr = date.toISOString().split('T')[0];
        
        const dayStart = new Date(date);
        const dayEnd = new Date(date);
        dayEnd.setHours(23, 59, 59, 999);
        
        // Count activities for this day
        const dailyUpvotes = upvotes.filter(v => 
            v.createdAt >= dayStart && v.createdAt <= dayEnd
        ).length;
        
        const dailyFeedbacks = feedbacks.filter(f => 
            f.createdAt >= dayStart && f.createdAt <= dayEnd
        ).length;
        
        const dailyIssues = issues.filter(i => 
            i.createdAt >= dayStart && i.createdAt <= dayEnd
        ).length;
        
        activityData.push({
            date: dateStr,
            upvotes: dailyUpvotes,
            feedbacks: dailyFeedbacks,
            issues: dailyIssues,
            activity: dailyUpvotes + dailyFeedbacks + dailyIssues
        });
    }

    return res.status(200).json(
        new ApiResponse(200, activityData, "Service activity data retrieved successfully.")
    );
});

/** ✅ Get All Services (Pagination + Search + Sorting) */
const getAllServices = asyncHandler(async (req, res) => {
    const { search, page = 1, limit = 10, sortBy = "newest" } = req.query;

    const query = search ? { serviceName: { $regex: search, $options: "i" } } : {};
    
    // Sort options
    let sortOptions = {};
    if (sortBy === "newest") {
        sortOptions = { createdAt: -1 };
    } else if (sortBy === "popular") {
        sortOptions = { upvotes: -1 };
    } else if (sortBy === "alphabetical") {
        sortOptions = { serviceName: 1 };
    }

    // Count total services matching the query
    const totalServices = await Service.countDocuments(query);
    const totalPages = Math.ceil(totalServices / limit);
    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);

    // Get paginated services
    const services = await Service.find(query)
        .select("serviceName logo description upvotes createdAt")
        .sort(sortOptions)
        .skip((pageNum - 1) * limitNum)
        .limit(limitNum);

    return res.status(200).json(
        new ApiResponse(200, { 
            services, 
            totalPages, 
            currentPage: pageNum,
            totalServices
        }, "Services retrieved successfully.")
    );
});

/** ✅ Upvote a Service */
const upvoteService = asyncHandler(async (req, res) => {
    const { serviceId } = req.params;
    
    if (!req.user) {
        throw new ApiError(401, "Authentication required to upvote a service.");
    }
    
    const service = await Service.findById(serviceId);
    if (!service) {
        throw new ApiError(404, "Service not found.");
    }
    
    // Check if user has already upvoted this service
    const existingVote = await ServiceVote.findOne({
        user: req.user._id,
        service: serviceId
    });
    
    if (existingVote) {
        throw new ApiError(409, "You have already upvoted this service.");
    }
    
    // Create the vote record and increment upvote count in a transaction
    const session = await mongoose.startSession();
    session.startTransaction();
    
    try {
        await ServiceVote.create([{
            user: req.user._id,
            service: serviceId
        }], { session });
        
        service.upvotes += 1;
        await service.save({ session });
        
        await session.commitTransaction();
    } catch (error) {
        await session.abortTransaction();
        throw new ApiError(500, "Failed to upvote service: " + error.message);
    } finally {
        session.endSession();
    }
    
    return res.status(200).json(
        new ApiResponse(200, { upvotes: service.upvotes }, "Service upvoted successfully.")
    );
});

/** ✅ Remove Upvote from a Service */
const removeUpvote = asyncHandler(async (req, res) => {
    const { serviceId } = req.params;
    
    if (!req.user) {
        throw new ApiError(401, "Authentication required to remove an upvote.");
    }
    
    const service = await Service.findById(serviceId);
    if (!service) {
        throw new ApiError(404, "Service not found.");
    }
    
    // Check if user has upvoted this service
    const existingVote = await ServiceVote.findOne({
        user: req.user._id,
        service: serviceId
    });
    
    if (!existingVote) {
        throw new ApiError(404, "You have not upvoted this service.");
    }
    
    // Remove vote and decrement upvote count in a transaction
    const session = await mongoose.startSession();
    session.startTransaction();
    
    try {
        await ServiceVote.findByIdAndDelete(existingVote._id, { session });
        
        service.upvotes = Math.max(0, service.upvotes - 1); // Ensure upvotes don't go below 0
        await service.save({ session });
        
        await session.commitTransaction();
    } catch (error) {
        await session.abortTransaction();
        throw new ApiError(500, "Failed to remove upvote: " + error.message);
    } finally {
        session.endSession();
    }
    
    return res.status(200).json(
        new ApiResponse(200, { upvotes: service.upvotes }, "Upvote removed successfully.")
    );
});

/** ✅ Get Top Upvoted Services */
const getTopServices = asyncHandler(async (req, res) => {
    const { limit = 5 } = req.query;
    
    const topServices = await Service.find()
        .select("serviceName logo description upvotes")
        .sort({ upvotes: -1 })
        .limit(parseInt(limit));
    
    return res.status(200).json(
        new ApiResponse(200, { services: topServices }, "Top services retrieved successfully.")
    );
});

export { 
    registerService, 
    loginService, 
    logoutService, 
    refreshServiceAccessToken, 
    getAllServices, 
    updateService, 
    deleteService, 
    getServiceDetails,
    getServiceActivity,
    upvoteService,
    removeUpvote,
    getTopServices
};