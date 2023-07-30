import { Router } from "express";

// controllers
import { getAll, get } from "../controllers/notificationController.js";

// middlewares
import requireAuth from "../middlewares/requireAuth.js";
import permission from "../middlewares/permission.js";
import ROLE from "../utils/Roles.js";

const router = Router();

// protected routes
router.all("*", requireAuth);
router.all("*", permission([ROLE.ADMIN, ROLE.AGENT]));
router.post("/getAll", getAll);
router.get("/get", get);

export default router;
