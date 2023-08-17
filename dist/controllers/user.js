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
exports.me = void 0;
const user_1 = __importDefault(require("../model/user"));
const me = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const customizedReq = req;
    const r = customizedReq.token;
    console.log("USER ID: ", r.id);
    try {
        const user = yield user_1.default.findOne({ _id: r.id }).select("-password");
        if (!user) {
            return res.status(404).json({
                message: "User not found or something went wrong.",
                success: false,
            });
        }
        return res.status(200).json(user);
    }
    catch (error) {
        return res.status(500).send({
            message: "Internal Server Error.",
            error: error,
            success: false,
        });
    }
});
exports.me = me;
