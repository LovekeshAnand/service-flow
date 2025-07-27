import { asyncHandler } from "../utils/asyncHandler.js";
import jwt from "jsonwebtoken";
import { User } from "../models/userSchema.model.js";
import { Service } from "../models/serviceSchema.model.js";
import { ApiError } from "../utils/apiError.js";

const verifyJWT = asyncHandler(async (req, _, next) => {
    try {
        const token = req.cookies?.accessToken || req.header("Authorization")?.replace("Bearer ", "");

        if (!token) {
            throw new ApiError(401, "Unauthorized request! No token provided.");
        }

        let decodedToken;
        try {
            decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
        } catch (error) {
            throw new ApiError(401, "Invalid or expired access token.");
        }

        const entityId = decodedToken._id || decodedToken.userId;
        if (!entityId) {
            throw new ApiError(401, "Invalid token structure: Missing ID.");
        }

        let entity = await User.findById(entityId).select("-password -refreshToken");
        if (entity) {
            req.user = entity;
        } else {
            entity = await Service.findById(entityId).select("-password -refreshToken");
            if (entity) {
                req.service = entity;
            } else {
                throw new ApiError(401, "Invalid access token: No matching user or service found.");
            }
        }

        next();
    } catch (error) {
        throw new ApiError(401, error?.message || "Unauthorized access.");
    }
});



export { verifyJWT };
