import { Router } from "express";

// controllers
import {
  get,
  getAll,
  create,
  update,
  remove,
} from "../controllers/emailTemplateController.js";

// middlewares
import requireAuth from "../middlewares/requireAuth.js";
import validate from "../middlewares/validate.js";
import permission from "../middlewares/permission.js";
import ROLE from "../utils/Roles.js";

// validationSchemas
import {
  createSchema,
  updateSchema,
} from "../validationSchemas/emailTemplateSchemas.js";

const router = Router();

router.all("*", requireAuth);
router.all("*", permission([ROLE.ADMIN]));
router.get("/get/:id", get);
router.post("/getAll", getAll);
router.post("/create", validate(createSchema), create);
router.put("/update/:id", validate(updateSchema), update);
router.delete("/remove/:id", remove);

export default router;
