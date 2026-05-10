import { Router, Request, Response } from "express";
import { allUsers } from "../controllers/auth.controller.js";

const router = Router();

router.get("/", allUsers);

export default router;
