import rateLimit from "express-rate-limit";

const registerLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, 
  max: 20, 
  message: {
    success: false,
    message: "Too many requests. Please try again later.",
  },
  headers: true, 
  handler: (req, res, next) => {
    res.set("X-RateLimit-Limit", 20); 
    res.set("X-RateLimit-Remaining", 0);
    res.set("X-RateLimit-Reset", new Date(Date.now() + 15 * 60 * 1000).toISOString());
    res.status(429).json({
      success: false,
      message: "Too many requests. Please try again later.",
    });
  },
});

export { registerLimiter };
