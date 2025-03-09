import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/apiError.js";
import { Service } from "../models/serviceSchema.model.js";
import { ApiResponse } from "../utils/apiResponse.js";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import { Bug } from "../models/bugSchema.model.js";
import { Feedback } from "../models/feedbackSchema.model.js";
import { Issue } from "../models/issueSchema.model.js";
import { uploadOnCloudinary, deleteFromCloudinary } from "../utils/cloudinary.js";

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
    const { serviceName, email, password, description } = req.body;
    const logoLocalPath = req.file?.path;

    if (![serviceName, email, password, description].every(Boolean) || !logoLocalPath) {
        throw new ApiError(400, "All fields, including logo, are required.");
    }

    const existingService = await Service.findOne({ email });
    if (existingService) {
        throw new ApiError(409, "Service with this email already exists.");
    }

    // Upload logo to Cloudinary
    const logoUpload = await uploadOnCloudinary(logoLocalPath);
    if (!logoUpload?.url) {
        throw new ApiError(500, "Error while uploading logo to Cloudinary.");
    }

    const service = await Service.create({
        serviceName,
        email,
        password,
        description,
        logo: logoUpload.url,
        cloudinaryLogoId: logoUpload.public_id,
    });

    const createdService = await Service.findById(service._id).select("-password -refreshToken");

    return res.status(201).json(new ApiResponse(201, createdService, "Service registered successfully."));
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

    const { accessToken, refreshToken } = await generateAccessAndRefreshTokens(service._id);
    const loggedInService = await Service.findById(service._id).select("-password -refreshToken");

    return res.status(200)
        .cookie("accessToken", accessToken, { httpOnly: true, secure: true })
        .cookie("refreshToken", refreshToken, { httpOnly: true, secure: true })
        .json(new ApiResponse(200, { service: loggedInService, accessToken, refreshToken }, "Service logged in successfully."));
});

/** ✅ Logout Service */
const logoutService = asyncHandler(async (req, res) => {
    if (!req.service) {
        throw new ApiError(401, "Unauthorized request: Service not found.");
    }

    await Service.findByIdAndUpdate(req.service._id, { $set: { refreshToken: undefined } }, { new: true });

    return res.status(200)
        .clearCookie("accessToken", { httpOnly: true, secure: true })
        .clearCookie("refreshToken", { httpOnly: true, secure: true })
        .json(new ApiResponse(200, {}, "Service logged out successfully."));
});


/** ✅ Refresh Access Token */
const refreshServiceAccessToken = asyncHandler(async (req, res) => {
    const incomingRefreshToken = req.cookies.refreshToken || req.body.refreshToken;
    if (!incomingRefreshToken) {
        throw new ApiError(401, "Unauthorized request!");
    }

    try {
        const decodedToken = jwt.verify(incomingRefreshToken, process.env.REFRESH_TOKEN_SECRET);
        const service = await Service.findById(decodedToken?._id);

        if (!service || incomingRefreshToken !== service.refreshToken) {
            throw new ApiError(401, "Invalid or expired refresh token!");
        }

        const { accessToken, newRefreshToken } = await generateAccessAndRefreshTokens(service._id);

        return res.status(200)
            .cookie("accessToken", accessToken, { httpOnly: true, secure: true })
            .cookie("refreshToken", newRefreshToken, { httpOnly: true, secure: true })
            .json(new ApiResponse(200, { accessToken, refreshToken: newRefreshToken }, "Access token refreshed"));
    } catch (error) {
        throw new ApiError(401, "Unauthorized request!");
    }
});

/** ✅ Update Service (Supports Cloudinary Logo Update) */
const updateService = asyncHandler(async (req, res) => {
    const { serviceId } = req.params;
    const { name, email, description, password } = req.body;
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
        const emailExists = await Service.findOne({ email });
        if (emailExists) {
            throw new ApiError(409, "Email is already in use by another service.");
        }
        service.email = email;
    }

    // Upload new logo & delete old one only if a new file is provided
    if (logoLocalPath) {
        await deleteFromCloudinary(service.cloudinaryLogoId, "image");
        const newLogo = await uploadOnCloudinary(logoLocalPath);
        service.logo = newLogo.url;
        service.cloudinaryLogoId = newLogo.public_id;
    }

    if (name) service.name = name;
    if (description) service.description = description;
    if (password) service.password = await bcrypt.hash(password, 10);

    await service.save();
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

    await Service.findByIdAndDelete(serviceId);

    return res.status(200).json(new ApiResponse(200, {}, "Service deleted successfully."));
});

/** ✅ Get Service Details */
const getServiceDetails = asyncHandler(async (req, res) => {
    const { serviceId } = req.params;

    const service = await Service.findById(serviceId).select("logo description");
    if (!service) {
        throw new ApiError(404, "Service not found.");
    }

    const [bugCount, feedbackCount, issueCount] = await Promise.all([
        Bug.countDocuments({ service: serviceId }),
        Feedback.countDocuments({ service: serviceId }),
        Issue.countDocuments({ service: serviceId })
    ]);

    return res.status(200).json(new ApiResponse(200, { logo: service.logo, description: service.description, bugs: bugCount, feedbacks: feedbackCount, issues: issueCount }, "Service details retrieved successfully."));
});

/** ✅ Get All Services (Pagination + Search + Sorting) */
const getAllServices = asyncHandler(async (req, res) => {
    const { search, page = 1, limit = 10, sortBy = "newest" } = req.query;

    const query = search ? { serviceName: { $regex: search, $options: "i" } } : {};
    const sortOptions = sortBy === "newest" ? { createdAt: -1 } : {};

    const totalServices = await Service.countDocuments(query);
    const totalPages = Math.ceil(totalServices / limit);

    const services = await Service.find(query)
        .select("serviceName logo") // ✅ Select only necessary fields
        .sort(sortOptions)
        .skip((page - 1) * limit)
        .limit(parseInt(limit));

    return res.status(200).json(
        new ApiResponse(200, { services, totalPages, currentPage: parseInt(page) }, "Services retrieved successfully.")
    );
});


export { registerService, loginService, logoutService, refreshServiceAccessToken, getAllServices, updateService, deleteService, getServiceDetails };
