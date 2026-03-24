const User = require("../models/User");

// Login user
const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find user by email
    const user = await User.findOne({ email });
    console.log("User found:", user);

    if (!user) {
      return res.status(400).json({ message: "User not found" });
    }

    // Plain password check (TEMP)
    if (user.password !== password) {
      return res.status(400).json({ message: "Invalid password" });
    }

    let redirectTo = "";

    if (user.role === "admin") {
      redirectTo = "ADMIN_DASHBOARD";
    } else if (user.role === "kitchen") {
      redirectTo = "KITCHEN_DASHBOARD";
    }

    res.status(200).json({
      message: "Login successful",
      role: user.role,
      name: user.name,
      redirectTo,
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

module.exports = { loginUser };