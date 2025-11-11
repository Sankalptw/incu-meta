// backend/routes/user.js
const { Router } = require("express");
const userRouter = Router();
const { userModel, eventModel, announcementModel, scheduleModel } = require("../db");
const bcrypt = require("bcrypt");
const { z } = require("zod");
const jwt = require("jsonwebtoken");
const { JWT_USER_SECRET } = require("../config");
const { userMiddleware } = require("../middlewares/user");

// -----------------------------
// User Apply (Registration)
// -----------------------------
userRouter.post("/apply", async (req, res) => {
  try {
    const reqBody = z.object({
      email: z.string().email(),
      password: z.string().min(3),
      name: z.string().min(1),
      industry: z.string().min(1),
      fundingStage: z.enum([
        "Ideation",
        "Pre-Seed",
        "Seed",
        "Series A",
        "Series B",
        "Growth",
      ]),
      revenue: z.number().nonnegative(),
      teamSize: z.number().int().nonnegative(),
    });

    const parsed = reqBody.safeParse(req.body);
    if (!parsed.success) {
      return res
        .status(400)
        .json({ message: "Invalid request body", error: parsed.error.issues });
    }

    const { email, password, name, industry, fundingStage, revenue, teamSize } =
      parsed.data;

    const existingUser = await userModel.findOne({ email });
    if (existingUser) {
      return res.status(409).json({ message: "User already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = await userModel.create({
      email,
      password: hashedPassword,
      name,
      industry,
      fundingStage,
      revenue,
      teamSize,
    });

    return res.status(201).json({
      message: "User created successfully",
      user: { email: newUser.email, name: newUser.name },
    });
  } catch (err) {
    console.error("[user.apply] error:", err);
    return res
      .status(500)
      .json({ message: "Error creating user", error: err.message });
  }
});

// -----------------------------
// Dashboard Stats
// -----------------------------
userRouter.get("/dashboard-stats", userMiddleware, async (req, res) => {
  try {
    const userId = req.userId;

    const user = await userModel
      .findById(userId)
      .select("name email industry fundingStage revenue teamSize");

    if (!user) {
      return res.status(404).json({ message: "Startup not found" });
    }

    const [totalEvents, totalAnnouncements, upcomingEvent] = await Promise.all([
      eventModel.countDocuments(),
      announcementModel.countDocuments(),
      eventModel.findOne({}).sort({ date: 1 }).limit(1),
    ]);

    return res.json({
      name: user.name,
      email: user.email,
      industry: user.industry,
      fundingStage: user.fundingStage,
      revenue: user.revenue,
      teamSize: user.teamSize,
      accountCreated: user._id.getTimestamp(),
      totalEvents,
      totalAnnouncements,
      upcomingEvent: upcomingEvent ? upcomingEvent.title : "No upcoming event",
    });
  } catch (err) {
    console.error("[user.dashboard-stats] error:", err);
    return res.status(500).json({
      message: "Error fetching dashboard stats",
      error: err.message,
    });
  }
});

// -----------------------------
// User Login - ✅ FIXED
// -----------------------------
userRouter.post("/login", async (req, res) => {
  try {
    const reqBody = z.object({
      email: z.string().email(),
      password: z.string().min(3),
    });

    const parsed = reqBody.safeParse(req.body);
    if (!parsed.success) {
      return res
        .status(400)
        .json({ message: "Invalid request body", error: parsed.error.issues });
    }

    const { email, password } = parsed.data;

    const user = await userModel.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Auto-approve for development
    if (!user.isApproved) {
      console.warn(`[user.login] Auto-approving user ${email} for development/testing.`);
      user.isApproved = true;
      await user.save();
    }

    const isPasswordCorrect = await bcrypt.compare(password, user.password);
    if (!isPasswordCorrect) {
      return res.status(401).json({ message: "Incorrect password" });
    }

    const token = jwt.sign(
      { email, id: user._id, role: user.userType || "startup" }, 
      JWT_USER_SECRET, 
      { expiresIn: "1h" }
    );

    // ✅ CRITICAL FIX: Return userId, name, and email
    return res.status(200).json({ 
      message: "Login successful", 
      token,
      userId: user._id.toString(), // ← This fixes the ObjectId error
      name: user.name,
      email: user.email
    });
  } catch (err) {
    console.error("[user.login] error:", err);
    return res
      .status(500)
      .json({ message: "Error logging in", error: err.message });
  }
});

// -----------------------------
// Get Profile
// -----------------------------
userRouter.get("/profile", userMiddleware, async (req, res) => {
  try {
    const { userId } = req;
    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const user = await userModel.findById(userId);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    return res.json({ user });
  } catch (error) {
    console.error("[user.profile] error:", error);
    return res
      .status(500)
      .json({ message: "Server error", error: error.message });
  }
});

// -----------------------------
// Get Events
// -----------------------------
userRouter.get("/events", async (req, res) => {
  try {
    const events = await eventModel.find({});
    return res.json({ events });
  } catch (err) {
    console.error("[user.events] error:", err);
    return res.status(500).json({ message: "Error fetching events" });
  }
});

// -----------------------------
// Get Announcements
// -----------------------------
userRouter.get("/announcements", async (req, res) => {
  try {
    const announcements = await announcementModel.find({});
    return res.json({ announcements });
  } catch (err) {
    console.error("[user.announcements] error:", err);
    return res.status(500).json({ message: "Error fetching announcements" });
  }
});

// -----------------------------
// My Schedules
// -----------------------------
userRouter.get("/my-schedules", userMiddleware, async (req, res) => {
  try {
    const schedules = await scheduleModel.find({ startupId: req.userId });
    return res.json({ schedules });
  } catch (err) {
    console.error("[user.my-schedules] error:", err);
    return res.status(500).json({ message: "Error fetching schedules" });
  }
});

module.exports = {
  userRouter,
};