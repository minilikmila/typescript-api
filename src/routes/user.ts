import express, { Router } from "express";

import { me } from "../controllers/user";
import { Verify } from "../middleware/check_auth";

const router: Router = express.Router();

router.get("/me", Verify, me);

export default router;
