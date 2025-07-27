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

router.post("/register", upload.single("logo"), registerLimiter, registerService);
router.post("/login", upload.none(), registerLimiter, loginService);
router.post("/logout", registerLimiter, verifyJWT, logoutService);
router.post("/refresh-token", refreshServiceAccessToken);


router.get("/all-services", getAllServices);
router.get("/top", getTopServices);
router.get("/:serviceId", getServiceDetails);


router.patch(
    "/:serviceId", 
    verifyJWT, 
    upload.single("logo"), 
    updateService
);
router.delete("/:serviceId", verifyJWT, deleteService);
router.get("/:serviceId/activity", getServiceActivity);


router.post("/:serviceId/upvote", verifyJWT, upvoteService);
router.delete("/:serviceId/upvote", verifyJWT, removeUpvote);

export default router;