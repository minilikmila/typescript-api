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
Object.defineProperty(exports, "__esModule", { value: true });
exports.initDB = void 0;
const mongoose_1 = require("mongoose");
const initDB = () => __awaiter(void 0, void 0, void 0, function* () {
    try {
        console.log("connection", process.env.MONGO_URI);
        const conn_url = process.env.MONGO_URI || "mongodb://localhost:27017/";
        const conn = yield (0, mongoose_1.connect)(conn_url);
        console.log(`MongoDB connected ! : ${conn.connection.host}`);
    }
    catch (error) {
        console.log("MongoDB connection error: ", error);
        process.exit(1);
    }
});
exports.initDB = initDB;
