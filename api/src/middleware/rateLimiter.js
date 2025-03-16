import rateLimit from "express-rate-limit";

const registerLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // Limit each IP to 5 requests per windowMs
  message: {
    success: false,
    message: "Too many requests. Please try again later.",
  },
  headers: true, // Include default rate limit headers
  handler: (req, res, next) => {
    res.set("X-RateLimit-Limit", 5); // Set max limit header
    res.set("X-RateLimit-Remaining", 0); // Always 0 when limit is exceeded
    res.set("X-RateLimit-Reset", new Date(Date.now() + 15 * 60 * 1000).toISOString()); // Reset time
    res.status(429).json({
      success: false,
      message: "Too many requests. Please try again later.",
    });
  },
});

export { registerLimiter };
