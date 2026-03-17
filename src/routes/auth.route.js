import  Router  from "express";
import {registerUser, loginUser, logout, refreshToken, verifyEmail , deleteUser , resendEmail} from "../controllers/auth.controller.js";
import { authenticateUser } from "../middleware/auth.js";
const router = Router();

router.post("/signup", registerUser );
router.post("/login", loginUser );
router.post("/logout", logout );
router.post("/refresh", refreshToken );
router.get("/verify/:token", verifyEmail );
router.delete("/delete",authenticateUser,  deleteUser)
router.post("/resend-verification" , resendEmail)



export default router;