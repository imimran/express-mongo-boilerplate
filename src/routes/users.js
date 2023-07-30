import { Router } from "express";

// controllers
import {
  me,
  getAll,
  whatIsMyIp,
  update,
  updateByAdmin,
  createUserByAdmin,
  getUser,
  userRoles,
  activeOrNotByAdmin,
  verifiedByAdmin,
} from "../controllers/userController.js";

// middlewares
import permission from "../middlewares/permission.js";
import requireAuth from "../middlewares/requireAuth.js";
import validate from "../middlewares/validate.js";
import ROLE from "../utils/Roles.js";

// validationSchemas
import {
  updateSchema,
  updateByAdminSchema,
  createSchema,
  activeUserSchema,
} from "../validationSchemas/userSchemas.js";

const router = Router();
// public routes
router.get("/whatIsMyIp", whatIsMyIp);
// protected routes
router.all("*", requireAuth);
router.get("/me", me);
router.get("/roles", permission([ROLE.ADMIN]), userRoles);
router.post("/getAll", permission([ROLE.ADMIN]), getAll);
router.put("/update", validate(updateSchema), update);
router.post(
  "/admin/create",
  permission([ROLE.ADMIN]),
  validate(createSchema),
  createUserByAdmin,
);
router.put(
  "/admin/update",
  permission([ROLE.ADMIN]),
  validate(updateByAdminSchema),
  updateByAdmin,
);
router.get("/get/:user_id", permission([ROLE.ADMIN]), getUser);
router.get("/verify/:user_id", permission([ROLE.ADMIN]), verifiedByAdmin);
router.post(
  "/status",
  permission([ROLE.ADMIN]),
  validate(activeUserSchema),
  activeOrNotByAdmin,
);

export default router;
