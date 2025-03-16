import { upload } from "../middleware/multer.middleware.js";
import { Router } from "express";
import { verifyJWT } from "../middleware/auth.middleware.js";
import { registerLimiter } from "../middleware/rateLimiter.js";
import {
    registerService,
    loginService,
    logoutService,
    refreshServiceAccessToken,
    getAllServices,
    getServiceDetails,
    getServiceActivity,
    updateService,
    deleteService,
    upvoteService,
    removeUpvote,
    getTopServices
} from "../controllers/serviceAuth.controller.js";

const router = Router();

/**
 * Authentication Routes
 * Handles service registration, login, logout and token refresh
 */
router.post("/register", upload.single("logo"), registerLimiter, registerService);
router.post("/login", upload.none(), registerLimiter, loginService);
router.post("/logout", registerLimiter, verifyJWT, logoutService);
router.post("/refresh-token", refreshServiceAccessToken);

/**
 * Service Discovery Routes
 * Public routes for discovering and viewing services
 */
router.get("/all-services", getAllServices);
router.get("/top", getTopServices);
router.get("/:serviceId", getServiceDetails);

/**
 * Protected Service Management Routes
 * Requires authentication via verifyJWT middleware
 */
router.patch(
    "/:serviceId", 
    verifyJWT, 
    upload.single("logo"), 
    updateService
);
router.delete("/:serviceId", verifyJWT, deleteService);
router.get("/:serviceId/activity", getServiceActivity);

/**
 * Interaction Routes
 * For upvoting and removing upvotes from services
 */
router.post("/:serviceId/upvote", verifyJWT, upvoteService);
router.delete("/:serviceId/upvote", verifyJWT, removeUpvote);

export default router;