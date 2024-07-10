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

export const login = async (req: any, res: any) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ message: "Invalid password" });
    }

    const jwtToken = generateToken({ email: user.email, id: user._id });
    const refreshToken = generateRefreshToken({
      email: user.email,
      id: user._id,
    });

    // Save refresh token to database
    user.token = refreshToken;
    await user.save();

    return res.json({
      uid: user._id,
      jwtToken: jwtToken,
      refreshToken: refreshToken,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

export const register = async (req: any, res: any) => {
  // Get user data from request
  const { email, username, password, phone } = req.body;

  try {
    // Check if user already exists
    const existingUser = await User.findOne({ email });

    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create new user
    const user = new User({
      email: email,
      username: username,
      password: hashedPassword,
      phone_number: phone,
      last_modified: new Date(),
      verified: false,
      age: 18,
    });

    // Generate JWT token
    const jwtToken: string = generateToken({
      email: email,
      id: user._id,
    });
    const refreshToken: string = generateRefreshToken({
      email: email,
      id: user._id,
    });

    user.token = refreshToken;

    // Save user to database
    await user.save();

    // Send token in the response
    return res.json({
      uid: user._id,
      jwtToken: jwtToken,
      refreshToken: refreshToken,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

export const refresh = async (req: any, res: any) => {
  const { refreshToken } = req.body;

  try {
    const decoded = jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET);
    const user = await User.findOne({
      email: decoded.email,
      token: refreshToken,
    });

    if (!user) {
      return res.status(401).json({ message: "Invalid token" });
    }

    const jwtToken = generateToken({ email: user.email, id: user._id });
    const newRefreshToken = generateRefreshToken({
      email: user.email,
      id: user._id,
    });

    user.token = newRefreshToken;
    await user.save();

    return res.json({
      uid: user._id,
      jwtToken: jwtToken,
      refreshToken: newRefreshToken,
    });
  } catch (error) {
    console.error(error);
    return res.status(401).json({ message: "Invalid token" });
  }
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
