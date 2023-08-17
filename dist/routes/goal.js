"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const goal_1 = require("../controllers/goal");
const check_auth_1 = require("../middleware/check_auth");
const router = express_1.default.Router();
router
    .post("/", check_auth_1.Verify, goal_1.SetGoal)
    .get("/", check_auth_1.Verify, goal_1.GetGoals)
    .delete("/:id", check_auth_1.Verify, goal_1.DeleteGoal)
    .patch("/:id", check_auth_1.Verify, goal_1.UpdateGoal);
exports.default = router;
