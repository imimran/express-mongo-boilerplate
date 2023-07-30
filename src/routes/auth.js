import { Router } from "express";

// controllers
import {
  register,
  confirm,
  login,
  refreshToken,
  sendForgotPasswordEmail,
  forgotPasswordChange,
  changePassword,
  logout,
  reverifyAccount,
  checkVeifiedUser,
} from "../controllers/authController.js";

// middlewares
import validate from "../middlewares/validate.js";
import requireAuth from "../middlewares/requireAuth.js";

// validationSchemas
import {
  registerSchema,
  changePasswordSchema,
  reverifySchema,
} from "../validationSchemas/authSchemas.js";

const router = Router();

router.post("/register", validate(registerSchema), register);
router.get("/confirm/:id", confirm);
router.post("/login", login);
router.get("/refresh_token", refreshToken);
router.post("/send_forgot_password_email", sendForgotPasswordEmail);
router.post(
  "/forgot_password_change",
  validate(changePasswordSchema),
  forgotPasswordChange,
);
router.post("/changePassword", requireAuth, changePassword);
router.get("/logout", logout);
router.get("/verify-token/:token", checkVeifiedUser);
router.post("/reverify", validate(reverifySchema), reverifyAccount);

export default router;
