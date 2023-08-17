import express, { Router } from "express";

import { SetGoal, GetGoals, DeleteGoal, UpdateGoal } from "../controllers/goal";
import { Verify } from "../middleware/check_auth";

const router: Router = express.Router();

router
  .post("/", Verify, SetGoal)
  .get("/", Verify, GetGoals)
  .delete("/:id", Verify, DeleteGoal)
  .patch("/:id", Verify, UpdateGoal);

export default router;
