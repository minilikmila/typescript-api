"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const user_1 = require("../controllers/user");
const check_auth_1 = require("../middleware/check_auth");
const router = express_1.default.Router();
router.get("/me", check_auth_1.Verify, user_1.me);
exports.default = router;
