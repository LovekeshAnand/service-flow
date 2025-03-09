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

        if (!decodedToken || !decodedToken._id) {
            throw new ApiError(401, "Invalid token structure.");
        }

        // 🔹 First, check if the token belongs to a User
        let entity = await User.findById(decodedToken._id).select("-password -refreshToken");

        if (entity) {
            req.user = entity; // ✅ Attach user to request
        } else {
            // 🔹 If not a user, check if it's a Service
            entity = await Service.findById(decodedToken._id).select("-password -refreshToken");

            if (!entity) {
                throw new ApiError(401, "Invalid access token: No matching user or service found.");
            }

            req.service = entity; // ✅ Attach service to request
        }

        next();
    } catch (error) {
        throw new ApiError(401, error?.message || "Unauthorized access.");
    }
});

export { verifyJWT };
