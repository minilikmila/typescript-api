"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UpdateGoal = exports.DeleteGoal = exports.GetGoals = exports.SetGoal = void 0;
const goal_1 = __importDefault(require("../model/goal"));
const SetGoal = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const body = req.body;
    if (!body.text) {
        return res.status(400).json({
            message: "Goal must have a title",
            success: false,
        });
    }
    try {
        const CustomizeReq = req;
        const r = CustomizeReq.token;
        const goal = yield goal_1.default.create({
            text: body.text,
            user: r.id,
        });
        return res.status(200).send(goal);
    }
    catch (error) {
        return res.status(500).send({
            message: "Internal Server Error.",
            error: error,
            success: false,
        });
    }
});
exports.SetGoal = SetGoal;
const GetGoals = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const customizedReq = req;
    const r = customizedReq.token;
    try {
        const goals = yield goal_1.default.find({ user: r.id }).populate("user");
        console.log("GOAL: : ", goals);
        return res.status(200).json(goals);
    }
    catch (error) {
        return res.status(500).send({
            message: "Internal Server Error.",
            error: error,
            success: false,
        });
    }
});
exports.GetGoals = GetGoals;
const DeleteGoal = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const customizedReq = req;
    const r = customizedReq.token;
    try {
        const goal = yield goal_1.default.findOne({
            _id: req.params.id,
        });
        if (!goal) {
            return res.status(404).json({
                message: "Goal not found.",
                success: false,
            });
        }
        if (goal.user.toString() !== r.id) {
            return res.status(401).json({
                message: "Unauthorized",
                success: false,
            });
        }
        yield goal.deleteOne();
        return res.status(200).json(goal);
    }
    catch (error) {
        return res.status(500).send({
            message: "Internal Server Error - - .",
            error: error,
            success: false,
        });
    }
});
exports.DeleteGoal = DeleteGoal;
const UpdateGoal = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const customizedReq = req;
    const r = customizedReq.token;
    const { text } = customizedReq.body;
    try {
        if (!text) {
            return res.status(401).json({
                message: "You have to provide the fields.",
                success: false,
            });
        }
        console.log("Goal id ", customizedReq.params.id);
        const goal = yield goal_1.default.findOne({
            _id: customizedReq.params.id,
        });
        if (!goal) {
            return res.status(404).json({
                message: "Goal not found.",
                success: false,
            });
        }
        if ((goal === null || goal === void 0 ? void 0 : goal.user) != r.id) {
            return res.status(401).json({
                message: "You are not allowed to update this one.",
                success: false,
            });
        }
        yield (goal === null || goal === void 0 ? void 0 : goal.updateOne({ text: text }));
        return res.status(200).json({
            id: customizedReq.params.id,
        });
    }
    catch (error) {
        return res.status(500).send({
            message: "Internal server error.",
            error: error,
            success: false,
        });
    }
});
exports.UpdateGoal = UpdateGoal;
