import jwt from "jsonwebtoken";

export const authenticateUser = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) return res.status(401).json({ message: "No token provided" });

  const token = authHeader.split(" ")[1]; // Bearer <token>

  try {
    const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
    req.user = { id: decoded.id }; // now req.user.id is available
    next();
  } catch (err) {
    return res.status(401).json({ message: "Invalid or expired token" });
  }
};
