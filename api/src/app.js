import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import mongoose from "mongoose";
import "./models/replySchema.model.js"; 
import { upload } from "./middleware/multer.middleware.js";

const app = express();
app.set("trust proxy", 1); 
app.use((req, res, next) => {
    console.log("Client IP:", req.ip);
    console.log("X-Forwarded-For:", req.headers["x-forwarded-for"]);
    next();
  });
  
app.use(cors({
    origin: process.env.CORS_ORIGIN,
    credentials: true
}));
app.use(express.json({ limit: "16kb" }));
app.use(express.urlencoded({ extended: true, limit: "16kb" }));
app.use(express.static("public"));
app.use(cookieParser());


import userRouter from "./routes/user.routes.js";
import feedbackRouter from "./routes/feedback.routes.js"; 
import issueRouter from "./routes/issue.routes.js"; 
import serviceRouter from "./routes/service.routes.js"; 

app.use("/api/v1/users", userRouter);
app.use("/api/v1/feedbacks", feedbackRouter);
app.use("/api/v1/issues", issueRouter);
app.use("/api/v1/services", serviceRouter);

app.get("/health", (req, res) => {
  const dbStatus = mongoose.connection.readyState === 1 ? "Connected" : "Disconnected";
  res.status(200).json({
    success: true,
    message: "Server is healthy",
    database: dbStatus,
    uptime: process.uptime(),
    timestamp: new Date()
  });
});

app.get("/api/v1/health", (req, res) => {
  const dbStatus = mongoose.connection.readyState === 1 ? "Connected" : "Disconnected";
  res.status(200).json({
    success: true,
    message: "Server is healthy",
    database: dbStatus,
    uptime: process.uptime(),
    timestamp: new Date()
  });
});

export { app };
