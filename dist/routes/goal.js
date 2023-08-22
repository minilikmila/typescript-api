"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const goal_1 = require("../controllers/goal");
const check_auth_1 = require("../middleware/check_auth");
const auth_validator_1 = require("../validator/auth_validator");
const validation_middleware_1 = require("../middleware/validation_middleware");
const router = express_1.default.Router();
router
    .post("/", (0, validation_middleware_1.validate)([(0, auth_validator_1.authorization)()]), check_auth_1.Verify, goal_1.SetGoal)
    .get("/", (0, validation_middleware_1.validate)([(0, auth_validator_1.authorization)()]), check_auth_1.Verify, goal_1.GetGoals)
    .delete("/:id", (0, validation_middleware_1.validate)([(0, auth_validator_1.authorization)()]), check_auth_1.Verify, goal_1.DeleteGoal)
    .patch("/:id", (0, validation_middleware_1.validate)([(0, auth_validator_1.authorization)()]), check_auth_1.Verify, goal_1.UpdateGoal);
exports.default = router;
