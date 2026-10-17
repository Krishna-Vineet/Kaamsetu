import {generateToken, verifyToken} from "../utils/jwtUtils.js";
import {User} from "../modals/User.js"; // Example user model

export const renderHomePage = (req, res) => {
  res.render("homepage"); // Render the static homepage
};

export const redirectToDashboard = (req, res) => {
  const token = req.cookies.token; // Assuming token is stored in cookies
  if (!token) return res.redirect("/login");

  try {
    const user = verifyToken(token); // Verify the token
    const { role } = user;
    if (role === "labor") return res.redirect("/labor/dashboard");
    if (role === "client") return res.redirect("/client/dashboard");
    if (role === "admin") return res.redirect("/admin/dashboard");
    res.redirect("/login"); // Invalid role
  } catch (error) {
    return res.redirect("/login");
  }
};

export const processLogin = async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user || user.password !== password) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    // Generate a token
    const token = jwt.generateToken({ id: user._id, role: user.role });
    res.cookie("token", token, { httpOnly: true });
    return res.status(200).json({ message: "Login successful" });
  } catch (error) {
    return res.status(500).json({ message: "Internal server error" });
  }
};

export const processLaborRegistration = async (req, res) => {
  const { name, email, password } = req.body;

  try {
    const newLabor = await User.create({ name, email, password, role: "labor" });
    return res.status(201).json({ message: "Labor registered successfully", user: newLabor });
  } catch (error) {
    return res.status(500).json({ message: "Failed to register labor" });
  }
};

export const processClientRegistration = async (req, res) => {
  const { name, email, password } = req.body;

  try {
    const newClient = await User.create({ name, email, password, role: "client" });
    return res.status(201).json({ message: "Client registered successfully", user: newClient });
  } catch (error) {
    return res.status(500).json({ message: "Failed to register client" });
  }
};

export const logout = (req, res) => {
  res.clearCookie("token");
  res.redirect("/");
};
