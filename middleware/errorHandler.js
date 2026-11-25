function errorHandler(error, req, res, next) {
  if (res.headersSent) return next(error);
  console.error(error);

  if (error.name === "ValidationError") {
    return res.status(400).json({
      message: "Validation failed",
      errors: Object.fromEntries(
        Object.entries(error.errors).map(([key, value]) => [key, value.message])
      )
    });
  }

  if (error.code === 11000) {
    return res.status(409).json({ message: "A record with that value already exists" });
  }

  if (error.name === "CastError") {
    return res.status(400).json({ message: "Invalid identifier" });
  }

  return res.status(error.status || 500).json({
    message: error.status ? error.message : "Internal server error"
  });
}

module.exports = errorHandler;
