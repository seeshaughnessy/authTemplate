const jwt = require("jsonwebtoken");

const auth = (req, res, next) => {
  try {
    // Get token from headers
    const token = req.header("x-auth-token");

    // Validation
    // if there is a token
    if (!token) {
      return res.status(401).json({ msg: "Not authorized, no token found" });
    }
    // if token is verified via jwt (returns {id, iat})
    const verified = jwt.verify(token, process.env.JWT_SECRET);
    if (!verified) {
      return res.status(401).json({ msg: "Not authorized, token inccorect" });
    }
    // Add user to req (accessible via route)
    req.userId = verified.id;
    // Move to next middleware
    next();
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

module.exports = auth;
