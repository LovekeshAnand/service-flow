import rateLimit from "express-rate-limit"

const registerLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // Limit each IP to 5 requests per windowMs
  message: {
    success: false,
    message: "Too many requests. Please try again later.",
  },
  headers: true, // Include rate limit headers in response
});

export {registerLimiter}
