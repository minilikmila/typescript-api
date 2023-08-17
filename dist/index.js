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
const express_1 = __importDefault(require("express"));
require("dotenv/config");
const cors_1 = __importDefault(require("cors"));
// import { initDB } from "./db/init";
const mongoose_1 = require("mongoose");
// Route handlers
const auth_1 = __importDefault(require("./routes/auth"));
const goal_1 = __importDefault(require("./routes/goal"));
const user_1 = __importDefault(require("./routes/user"));
// Install @types/package for TS and package itself for the JS
// initDB();
(function () {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            yield (0, mongoose_1.connect)("mongodb://127.0.0.1:27017/ToDo");
            console.log("Connected!");
        }
        catch (error) {
            console.log("CONNECTION ERROR : ", error);
        }
    });
})();
const PORT = process.env.PORT || "4900";
const app = (0, express_1.default)();
app.use(express_1.default.json({ limit: "60MB" }));
app.use(express_1.default.urlencoded({ extended: true }));
app.use((0, cors_1.default)({ origin: "*" }));
//   General Routes
app.use("/api/auth", auth_1.default);
app.use("/api/goal", goal_1.default);
app.use("/api/user", user_1.default);
app
    .get(`/check`, (req, res) => {
    let resp_body = {
        message: "GET:successful",
        status: "OK- Healthy",
        success: true,
    };
    return res.status(200).json(resp_body);
})
    .post("/check", (req, res) => {
    let resp_body = {
        message: "POST:successful",
        status: "OK- Healthy",
        success: true,
    };
    return res.status(200).json(resp_body);
});
app.listen(PORT, () => {
    console.log("Typescript server started at 🔥: ", PORT);
});
