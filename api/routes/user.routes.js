import { Router } from "express";
import { loginUser, 
        registerUser, 
        logoutUser, 
        refreshAccessToken } from "./controllers/userAuth.controller.js";
import { verifyJWT } from "./auth.middleware.js";



const router = Router()

router.route("/register").post(registerUser)


router.route("/login").post(loginUser)



//SECURED ROUTES
router.route("/logout").post(verifyJWT, logoutUser)
router.route("/refresh-token").post(refreshAccessToken)


export default router 