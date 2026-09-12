const bcrypt = require("bcrypt");
const User = require("../models/user");

// Creates/refreshes the reviewer (guest admin) account on startup so
// reviewers can browse admin pages without full destructive access.
const ensureGuestAdmin = async () => {
  try {
    const email = (process.env.GUEST_ADMIN_EMAIL || "guest@ezbuy.store").toLowerCase();
    const password = process.env.GUEST_ADMIN_PASSWORD || "guest123";

    const hashed = await bcrypt.hash(password, 10);

    await User.findOneAndUpdate(
      { email },
      {
        $set: {
          name: "Guest Admin",
          email,
          role: "guestadmin",
          password: hashed,
        },
      },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );

    console.log("Guest admin account ready:", email);
  } catch (err) {
    console.error("Failed to seed guest admin:", err.message);
  }
};

module.exports = { ensureGuestAdmin };