import express, { Router } from "express";

import { SetGoal, GetGoals, DeleteGoal, UpdateGoal } from "../controllers/goal";
import { Verify } from "../middleware/check_auth";
import { authorization } from "../validator/auth_validator";
import { validate } from "../middleware/validation_middleware";

const router: Router = express.Router();

router
  .post("/", validate([authorization()]), Verify, SetGoal)
  .get("/", validate([authorization()]), Verify, GetGoals)
  .delete("/:id", validate([authorization()]), Verify, DeleteGoal)
  .patch("/:id", validate([authorization()]), Verify, UpdateGoal);

export default router;
