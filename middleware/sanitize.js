function sanitizeText(value) {
  if (typeof value !== "string") return value;
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#x27;");
}

function sanitizeBody(req, res, next) {
  if (!req.body || typeof req.body !== "object") return next();

  const walk = (value) => {
    if (Array.isArray(value)) return value.map(walk);
    if (value && typeof value === "object") {
      const result = {};
      for (const [key, child] of Object.entries(value)) result[key] = walk(child);
      return result;
    }
    return sanitizeText(value);
  };

  req.body = walk(req.body);
  next();
}

module.exports = sanitizeBody;

