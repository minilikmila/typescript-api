"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Verify = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const auth_1 = require("../controllers/auth");
const Verify = (req, res, next) => {
    let token = req.header("Authorization");
    //   console.log(token?.replace("Bearer", ""));
    if (!token) {
        return res.status(401).send({
            message: "Unauthorized!",
            success: false,
        });
    }
    try {
        if (token.startsWith("Bearer")) {
            // IF the token is bearer token...
            token = token.split(" ")[1];
        }
        // Verify
        const decoded = jsonwebtoken_1.default.verify(token, auth_1.jwt_secret_key);
        req.token = decoded; // built in request extends customRequest additional get decoded Jwt payload ()
        next();
    }
    catch (error) {
        return res.status(500).send({
            message: "Something went wrong.",
            error: error,
            success: false,
        });
    }
};
exports.Verify = Verify;
