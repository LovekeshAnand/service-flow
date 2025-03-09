import { upload } from "../middleware/multer.middleware.js"; 
import { Router } from "express";
import { verifyJWT } from "../middleware/auth.middleware.js";
import {
    registerService,
    loginService,
    logoutService,
    refreshServiceAccessToken,
    getAllServices,
    getServiceDetails,
    updateService,
    deleteService
} from "../controllers/serviceAuth.controller.js";

const router = Router();

// ✅ Register a new service (Public) - Requires logo upload
router.post("/register", upload.single("logo"), registerService);


// ✅ Update service details (Protected - Only service owner can update, Supports logo update)
router.patch("/:serviceId", 
    verifyJWT, 
    upload.single("logo"), // ✅ Optional logo update
    updateService
);

// ✅ Other routes
router.post("/login", upload.none(), loginService);
router.post("/logout", verifyJWT, logoutService);
router.post("/refresh-token", refreshServiceAccessToken);
router.get("/all-services", getAllServices);
router.get("/:serviceId", getServiceDetails);
router.delete("/delete-services/:serviceId", verifyJWT, deleteService);

export default router;
