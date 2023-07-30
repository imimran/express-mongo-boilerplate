import express from "express";

import auth from "./auth.js";
import notifications from "./notifications.js";
import users from "./users.js";
import emailTemplates from "./emailTemplates.js";

const router = express.Router();

router.get("/", (req, res) => {
  const allSocketRooms = {};
  for (const [socketId, rooms] of req.io.of("/").adapter.sids) {
    allSocketRooms[socketId] = [...rooms].filter((e) => e !== socketId);
  }
  req.io.of("/").emit("allSocketRooms", allSocketRooms);
  return res.json({
    message: "API - 👋🌎🌍🌏",
  });
});

router.use("/auth", auth);
router.use("/users", users);
router.use("/emailTemplates", emailTemplates);
router.use("/notifications", notifications);

export default router;
