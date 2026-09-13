// Must run after protectRoute so req.user is populated.
// Authorization is enforced here server-side (User.role), never by trusting the client.
export const requireAdmin = (req, res, next) => {
  if (!req.user || req.user.role !== "admin") {
    return res.status(403).json({ message: "Admin access required" });
  }
  next();
};
