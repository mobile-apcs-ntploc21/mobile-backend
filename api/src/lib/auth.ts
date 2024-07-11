import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import User from "../../../apollo/src/models/user";

// Generate JWT token
export const generateToken = (payload: any) => {
  return jwt.sign(payload, process.env.JWT_SECRET, {
    algorithm: "HS256",
    expiresIn: "1d",
  });
};

// Generate refresh token
export const generateRefreshToken = (payload: any) => {
  return jwt.sign(payload, process.env.REFRESH_TOKEN_SECRET, {
    algorithm: "HS256",
    expiresIn: "7d",
  });
};

export const aboutMe = async (req: any, res: any) => {
  const authHeader = req.headers.authorization;
  const token = authHeader && authHeader.split(" ")[1];

  if (!token) {
    return res.sendStatus(401); // Unauthorized
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id);

    if (!user) {
      return res.sendStatus(404); // Not Found
    }

    res.json(user);
  } catch (err) {
    res.sendStatus(403); // Forbidden
  }
};
