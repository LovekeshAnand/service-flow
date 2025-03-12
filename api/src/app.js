import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import "./models/replySchema.model.js"; // Ensure Reply model is registered
import { upload } from "./middleware/multer.middleware.js";

const app = express();

// ✅ Middleware Configuration
app.use(cors({
    origin: process.env.CORS_ORIGIN,
    credentials: true
}));
app.use(express.json({ limit: "16kb" }));
app.use(express.urlencoded({ extended: true, limit: "16kb" }));
app.use(express.static("public"));
app.use(cookieParser());
// app.use(upload.none());

// ✅ Routes Import
import userRouter from "./routes/user.routes.js";
import feedbackRouter from "./routes/feedback.routes.js"; // ✅ Fixed typo in file name
import issueRouter from "./routes/issue.routes.js"; // ✅ Added issue routes
import serviceRouter from "./routes/service.routes.js"; // ✅ Added service routes

// ✅ Route Registration
app.use("/api/v1/users", userRouter);
app.use("/api/v1/feedbacks", feedbackRouter);
app.use("/api/v1/issues", issueRouter);
app.use("/api/v1/services", serviceRouter);

export { app };
