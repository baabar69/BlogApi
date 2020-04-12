const jwt = require("jsonwebtoken");
const User = require("../models/User");

exports.protect = async (req, res, next) => {
  try {
    let token;
    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith("Bearer")
    ) {
      //send token from header With Bearer
      token = req.headers.authorization.split(" ")[1];
    } else if (req.cookies.token) {
      //Send Token via Cookie
      token = req.cookies.token;
    }

    if (!token) {
      return res.status(401).json({
        success: false,
        error: "Not Authorized to acces this route",
      });
    }

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      console.log(decoded);
      req.user = await User.findById(decoded.id);
      next();
    } catch (error) {
      return res.status(401).json({
        success: false,
        error: "Not Authorized to acces this route",
      });
    }
  } catch (error) {
    return res.status(400).json({
      success: false,
      error: err.message,
    });
  }
};

// Granting to role to specific Users
exports.authorize = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(401).json({
        success: false,
        error:
          "User role " +
          req.user.role +
          " is not Authorized to access this route",
      });
    }
    next();
  };
};
