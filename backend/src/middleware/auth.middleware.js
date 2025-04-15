import jwt from "jsonwebtoken";
import User from "../models/user.model.js"; // Import the User model

export const protectRoute = async (req, res, next) => {
  try {
    const token = req.cookies.jwt;

    if (!token) {
      return res
        .status(401)
        .json({ message: "Unauthorized, no token provided" });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET); // Verify the token using the secret key

    if (!decoded) {
      return res.status(401).json({ message: "Unauthorized, invalid token" });
    }

    const user = await User.findById(decoded.userId).select("-password");

    if (!user) {
      return res.status(404).json({ message: "Unauthorized, user not found" });
    }

    req.user = user; // Attach the user to the request object
    next(); // Call the next middleware or route handler
  } catch (error) {
    console.log("Error in protectRoute middleware", error.message);
    res.status(500).json({ message: "Internal Server error" });
  }
};
