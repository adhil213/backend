const isAdmin = (req, res, next) => {
  try {
  
    if (!req.user) {
      return res.status(401).json({ message: "Not authorized" });
    }

    if (req.user.role !== "admin") {
      return res.status(403).json({ message: "Admin only" });
    }

    next();

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Allows full admins and guest reviewers (read-only "guestadmin") to proceed
const isAdminOrGuest = (req, res, next) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: "Not authorized" });
    }

    if (req.user.role !== "admin" && req.user.role !== "guestadmin") {
      return res.status(403).json({ message: "Admin only" });
    }

    next();
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports = { isAdmin, isAdminOrGuest };