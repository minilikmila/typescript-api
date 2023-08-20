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
exports.removeOtp = exports.setOtp = exports.verifyOTP = exports.generateOTP = exports.extractToken = exports.validateToken = exports.generateJWTToken = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const config_1 = require("../config");
const httpError_1 = __importDefault(require("./httpError"));
const otp_1 = __importDefault(require("../model/otp"));
const validateToken = (token) => {
    try {
        const decoded = jsonwebtoken_1.default.verify(token, config_1.jwt_secret_key);
        return decoded;
    }
    catch (e) {
        throw new httpError_1.default({
            title: "invalid_token",
            code: 400,
            detail: "invalid_token",
        });
    }
};
exports.validateToken = validateToken;
const generateJWTToken = (payload = {}, options = {}) => {
    try {
        //   const privateKey: <any> = JWT_PUBLIC_KEY;
        const defaultOption = {
            expiresIn: "1h",
        };
        return jsonwebtoken_1.default.sign(payload, config_1.jwt_secret_key, Object.assign(defaultOption, options));
    }
    catch (error) {
        throw new httpError_1.default({
            title: "jwt_token_generation_error",
            code: 500,
            detail: error,
        });
    }
};
exports.generateJWTToken = generateJWTToken;
const extractToken = (token) => {
    if (token.startsWith("Bearer")) {
        // IF the token is bearer token...
        return token.split(" ")[1];
    }
    return null;
};
exports.extractToken = extractToken;
const randomPhoneCodeGenerator = () => {
    const uuid = "xxxxxx".replace(/x/g, () => Math.floor(Math.random() * 10).toString(16));
    return uuid.substring(0, 6);
};
const generateOTP = (len) => {
    const digits = "0123456789";
    let OTP = "";
    for (let i = 0; i < len; i++) {
        OTP += digits[Math.floor(Math.random() * 10)];
    }
    return OTP;
};
exports.generateOTP = generateOTP;
const verifyOTP = (userId, otp, type) => __awaiter(void 0, void 0, void 0, function* () {
    let otpExists = yield otp_1.default.findOne({
        userId,
        otp,
        type,
    });
    const now = new Date();
    if (!otpExists) {
        throw new httpError_1.default({
            title: "invalid_otp",
            code: 401,
            detail: "invalid_otp_code",
        });
    }
    else if (otpExists.otp_expired_at && otpExists.otp_expired_at < now) {
        throw new httpError_1.default({
            title: "expired_otp",
            code: 401,
            detail: "your otp code is expired.",
        });
    }
    return otpExists._id;
});
exports.verifyOTP = verifyOTP;
const setOtp = ({ userId, otp, type, otp_expired_at, }) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const opt_value = yield otp_1.default.create({
            userId,
            otp,
            type,
            otp_expired_at,
        });
        return opt_value._id;
    }
    catch (error) {
        throw new httpError_1.default({
            title: "otp_creation_error",
            code: 400,
            detail: error,
        });
    }
});
exports.setOtp = setOtp;
const removeOtp = (id) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        yield otp_1.default.deleteOne({ _id: id });
    }
    catch (error) {
        throw new httpError_1.default({
            title: "something_went_wrong",
            code: 500,
            detail: error,
        });
    }
});
exports.removeOtp = removeOtp;
