import { Router, Request, Response } from "express";
import { registerUser, sendOTP, verifyOTP } from "../controllers/auth.controller.js";

const router = Router();

router.post("/register", registerUser);
router.post("/send-otp", sendOTP);
router.post("/verify-otp", verifyOTP);

export default router;
