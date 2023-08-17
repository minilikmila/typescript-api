import express, { Router } from "express";
import { register, login } from "../controllers/auth";

const router: Router = express.Router();

router.post("/register", register).post("/login", login);

export default router;
