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
exports.otpAuthenticationRequest = exports.otpLogin = exports.resetPassword = exports.phoneForgotPassword = exports.resendPhoneConfirmationCode = exports.confirmPhoneNumber = exports.login = exports.register = void 0;
const user_1 = __importDefault(require("../model/user"));
const bcrypt_1 = __importDefault(require("bcrypt"));
const phone_sms_sender_1 = require("../services/phone_sms_sender");
const index_1 = require("../utils/index");
const enum_1 = require("../utils/enum");
const httpError_1 = __importDefault(require("../utils/httpError"));
const register = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const body = req.body;
    try {
        if (!body.email ||
            !body.name ||
            !body.password ||
            !body.phone_number ||
            !body.country_code) {
            console.log("HEre!!");
            return res.status(400).json({
                message: `Something went wrong 🔥.`,
                success: false,
                status: "Internal Server Error",
            });
        }
        const user_exists = yield user_1.default.findOne({ email: body.email });
        if (user_exists) {
            return res.status(500).json({
                message: "user already available",
                success: false,
            });
        }
        const salt = yield bcrypt_1.default.genSalt(12);
        const hashedPassword = yield bcrypt_1.default.hash(body.password, salt);
        const p_code = (0, index_1.generateOTP)(6);
        let otpExpiration = new Date();
        otpExpiration = otpExpiration.setMinutes(otpExpiration.getMinutes() + 10);
        // we can also use as const: Promise<UserSchemaType> = User.create({name, email, password})
        const user = yield user_1.default.create({
            name: body.name,
            email: body.email,
            password: hashedPassword,
            // phone_confirmation_code: p_code,
            phone_number: body.phone_number,
            country_code: body.country_code,
        });
        yield (0, index_1.setOtp)({
            userId: user.id,
            otp: p_code,
            type: enum_1.OtpTypes.VERIFICATION,
            otp_expired_at: new Date(otpExpiration),
        });
        if (user) {
            // send confirmation SMS
            const to = `${user.country_code}${user.phone_number}`;
            (0, phone_sms_sender_1.sendPhoneSMS)({
                body: `${p_code} - Is your confirmation code and valid for only 10 minutes, please confirm to activate your account.`,
                to,
                // from: TWILIO_WHATSAPP_NUMBER,
            });
            return res.status(201).json({
                _id: user.id,
                name: user.name,
                email: user.email,
                // token: generateToken(user),
            });
        }
        else {
            return res.status(500).send({
                message: "Something went wrong.",
                success: false,
            });
        }
    }
    catch (error) {
        if (((_a = error === null || error === void 0 ? void 0 : error.opts) === null || _a === void 0 ? void 0 : _a.title) === "otp_creation_error") {
            return res.status(401).send({
                message: "otp_creation_error.",
                error: error,
                success: false,
            });
        }
        console.log("Outside");
        return res.status(500).send({
            message: "Something went wrong.",
            success: false,
        });
    }
});
exports.register = register;
const login = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _b, _c;
    const body = req.body;
    try {
        if (!body.phone_number || !body.password) {
            throw new httpError_1.default({
                title: "missed_required_field",
                detail: "You have to provide required fields.",
                code: 400,
            });
        }
        // request user data
        const foundUser = yield user_1.default.findOne({
            phone_number: body.phone_number,
        });
        if (foundUser && !foundUser.is_phone_confirmed) {
            throw new httpError_1.default({
                title: "inactive_account",
                detail: "Please confirm your account. check your mobile sms message or email.",
                code: 400,
            });
        }
        if (!foundUser || !foundUser.password) {
            throw new httpError_1.default({
                title: "account_not_found",
                detail: "account not found.",
                code: 404,
            });
        }
        const isMatched = yield bcrypt_1.default.compare(body.password, foundUser === null || foundUser === void 0 ? void 0 : foundUser.password);
        if (!isMatched) {
            throw new httpError_1.default({
                title: "incorrect_credentials.",
                detail: "invalid username or password.",
                code: 400,
            });
        }
        const accessToken = yield tokenBuilder(foundUser);
        return res.status(200).json({
            _id: foundUser.id,
            name: foundUser.name,
            email: foundUser.email,
            phone_number: body.phone_number,
            token: accessToken,
        });
    }
    catch (error) {
        let err_code = ((_b = error === null || error === void 0 ? void 0 : error.opts) === null || _b === void 0 ? void 0 : _b.code) || 500;
        return res.status(err_code).json({
            message: ((_c = error === null || error === void 0 ? void 0 : error.opts) === null || _c === void 0 ? void 0 : _c.title) || "Something went wrong",
            success: false,
            error: error,
        });
    }
});
exports.login = login;
const tokenBuilder = (user) => __awaiter(void 0, void 0, void 0, function* () {
    const token = (0, index_1.generateJWTToken)({ id: user.id, email: user.email, token: "access" }, {
        issuer: user.phone_number,
        subject: user.id,
        audience: "root",
    });
    return token;
});
// const generateToken = (payload: UserSchemaType): string | JwtPayload => {
//   let token: string | JsonWebKey;
//   token = jwt.sign(
//     <UserSchemaType>{
//       id: payload.id,
//       name: payload.name,
//       email: payload.email,
//     },
//     jwt_secret_key,
//     {
//       expiresIn: "30m",
//     }
//   );
//   return token;
// };
// Phone confirmation....
const confirmPhoneNumber = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _d, _e;
    try {
        const { code, phone_number } = req.body;
        const user = yield user_1.default.findOne({ phone_number });
        if (!user || (user === null || user === void 0 ? void 0 : user.is_phone_confirmed)) {
            throw new httpError_1.default({
                title: "account_not_found",
                detail: "Account not found or it's already confirmed!.",
                code: 404,
            });
        }
        const validOtp = yield (0, index_1.verifyOTP)(user.id, code, enum_1.OtpTypes.VERIFICATION);
        console.log("OPT id", validOtp);
        yield user.updateOne({
            is_phone_confirmed: true,
            phone_confirmed_at: new Date(),
        });
        yield (0, index_1.removeOtp)(validOtp);
        return res.status(200).json({
            message: "Confirmed. check your email to finish your activation process.",
            success: true,
        });
    }
    catch (error) {
        let err_code = ((_d = error === null || error === void 0 ? void 0 : error.opts) === null || _d === void 0 ? void 0 : _d.code) || 500;
        return res.status(err_code).json({
            message: ((_e = error === null || error === void 0 ? void 0 : error.opts) === null || _e === void 0 ? void 0 : _e.title) || "Something went wrong.",
            success: false,
            error: error,
        });
    }
});
exports.confirmPhoneNumber = confirmPhoneNumber;
// Resend phone confirmation code ...
const resendPhoneConfirmationCode = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _f, _g;
    const { phone_number } = req.body;
    try {
        const user = yield user_1.default.findOne({ phone_number });
        if (!user || user.is_phone_confirmed) {
            throw new httpError_1.default({
                title: "account_not_found",
                code: 404,
                detail: "Account with this phone number is not found.",
            });
        }
        if (!user.country_code) {
            throw new httpError_1.default({
                title: "can_not_send_to_your_number",
                code: 500,
                detail: "We can't send the confirmation code to your phone. Please, contact the center.",
            });
        }
        const code = (0, index_1.generateOTP)(6);
        const to = `${user === null || user === void 0 ? void 0 : user.country_code}${user === null || user === void 0 ? void 0 : user.phone_number}`;
        let otpExpiration = new Date();
        otpExpiration = otpExpiration.setMinutes(otpExpiration.getMinutes() + 10);
        yield (0, index_1.setOtp)({
            userId: user.id,
            otp: code,
            type: enum_1.OtpTypes.VERIFICATION,
            otp_expired_at: new Date(otpExpiration),
        });
        // send confirmation SMS
        (0, phone_sms_sender_1.sendPhoneSMS)({
            body: `${code} - Is your confirmation code and valid for only 10 minutes, please confirm to activate your account.`,
            to,
            // from: TWILIO_WHATSAPP_NUMBER,
        });
        return res.status(200).json({
            message: "Confirmation sent successfully. Check your mobile phone.",
            id: user === null || user === void 0 ? void 0 : user.id,
            success: true,
        });
    }
    catch (error) {
        let err_code = ((_f = error === null || error === void 0 ? void 0 : error.opts) === null || _f === void 0 ? void 0 : _f.code) || 500;
        return res.status(err_code).json({
            message: ((_g = error === null || error === void 0 ? void 0 : error.opts) === null || _g === void 0 ? void 0 : _g.title) || "Something went wrong.",
            success: false,
            error: error,
        });
    }
});
exports.resendPhoneConfirmationCode = resendPhoneConfirmationCode;
// forgot password
const phoneForgotPassword = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _h, _j;
    try {
        const { phone_number } = req.body;
        if (!phone_number) {
            throw new httpError_1.default({
                title: "required_field_missed",
                code: 400,
                detail: "Phone number is required field.",
            });
        }
        const user = yield user_1.default.findOne({ phone_number });
        if (!user) {
            throw new httpError_1.default({
                title: "account_not_found",
                code: 404,
                detail: "Account not found by this phone number.",
            });
        }
        if (!user.country_code) {
            throw new httpError_1.default({
                title: "can_not_send_to_your_number",
                code: 500,
                detail: "We could't sent OTP code to your phone. Please, contact the center.",
            });
        }
        const to = `${user.country_code}${user.phone_number}`;
        const code = (0, index_1.generateOTP)(6);
        let otpExpiration = new Date();
        otpExpiration = otpExpiration.setMinutes(otpExpiration.getMinutes() + 10);
        yield (0, index_1.setOtp)({
            userId: user.id,
            otp: code,
            type: enum_1.OtpTypes.FORGET,
            otp_expired_at: new Date(otpExpiration),
        });
        yield (0, phone_sms_sender_1.sendPhoneSMS)({
            body: `${code} - Is your OTP code and valid for only 10 minutes, please reset your password before within 10 minutes.`,
            to,
        });
        return res.status(200).json({
            message: "Successfully sent. Check your mobile phone. It's valid for only 10 minutes",
            success: true,
        });
    }
    catch (error) {
        let err_code = ((_h = error === null || error === void 0 ? void 0 : error.opts) === null || _h === void 0 ? void 0 : _h.code) || 500;
        return res.status(err_code).json({
            message: ((_j = error === null || error === void 0 ? void 0 : error.opts) === null || _j === void 0 ? void 0 : _j.title) || "Something went wrong.",
            success: false,
            error: error,
        });
    }
});
exports.phoneForgotPassword = phoneForgotPassword;
const resetPassword = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _k, _l;
    const { phone_number, code, password } = req.body;
    try {
        if (!phone_number || !code || !password) {
            throw new httpError_1.default({
                title: "required_field_missed",
                code: 400,
                detail: "Phone number, confirmation code, and your new password is required fields.",
            });
        }
        const user = yield user_1.default.findOne({ phone_number });
        if (!user) {
            throw new httpError_1.default({
                title: "account_not_found",
                code: 404,
                detail: "Account not found with this number.",
            });
        }
        const validOtp = yield (0, index_1.verifyOTP)(user.id, code, enum_1.OtpTypes.FORGET);
        const hashedPassword = yield bcrypt_1.default.hash(password, 12);
        user.password = hashedPassword;
        yield user.save();
        yield (0, index_1.removeOtp)(validOtp);
        return res.status(200).json({
            message: "Successful.",
            success: true,
        });
    }
    catch (error) {
        let err_code = ((_k = error === null || error === void 0 ? void 0 : error.opts) === null || _k === void 0 ? void 0 : _k.code) || 500;
        return res.status(err_code).json({
            message: ((_l = error === null || error === void 0 ? void 0 : error.opts) === null || _l === void 0 ? void 0 : _l.title) || "Something went wrong.",
            success: false,
            error: error,
        });
    }
});
exports.resetPassword = resetPassword;
const otpLogin = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _m, _o;
    const { phone_number, code } = req.body;
    try {
        if (!phone_number || !code) {
            throw new httpError_1.default({
                title: "required_field_missed",
                code: 400,
                detail: "Phone number, confirmation code, and your new password is required fields.",
            });
        }
        const user = yield user_1.default.findOne({ phone_number });
        if (!user) {
            throw new httpError_1.default({
                title: "account_not_found",
                code: 404,
                detail: "Account not found with this number.",
            });
        }
        const validOtp = yield (0, index_1.verifyOTP)(user.id, code, enum_1.OtpTypes.AUTHENTICATION);
        yield (0, index_1.removeOtp)(validOtp);
        const accessToken = yield tokenBuilder(user);
        return res.status(200).json({
            _id: user.id,
            name: user.name,
            email: user.email,
            phone_number,
            token: accessToken,
        });
    }
    catch (error) {
        let err_code = ((_m = error === null || error === void 0 ? void 0 : error.opts) === null || _m === void 0 ? void 0 : _m.code) || 500;
        return res.status(err_code).json({
            message: ((_o = error === null || error === void 0 ? void 0 : error.opts) === null || _o === void 0 ? void 0 : _o.title) || "Something went wrong.",
            success: false,
            error: error,
        });
    }
});
exports.otpLogin = otpLogin;
const otpAuthenticationRequest = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _p, _q;
    const { phone_number } = req.body;
    try {
        if (!phone_number) {
            throw new httpError_1.default({
                title: "required_field_missed",
                code: 400,
                detail: "Phone number, confirmation code, and your new password is required fields.",
            });
        }
        const user = yield user_1.default.findOne({ phone_number });
        if (!user) {
            throw new httpError_1.default({
                title: "account_not_found",
                code: 404,
                detail: "Account not found with this number.",
            });
        }
        const to = `${user.country_code}${user.phone_number}`;
        const code = (0, index_1.generateOTP)(6);
        let otpExpiration = new Date();
        otpExpiration = otpExpiration.setMinutes(otpExpiration.getMinutes() + 10);
        yield (0, index_1.setOtp)({
            userId: user.id,
            otp: code,
            type: enum_1.OtpTypes.AUTHENTICATION,
            otp_expired_at: new Date(otpExpiration),
        });
        yield (0, phone_sms_sender_1.sendPhoneSMS)({
            body: `${code} - Is your Authentication OTP code and it's valid for only 10 minutes, you can authenticate using it within 10 minutes and only once.`,
            to,
        });
        return res.status(200).json({
            message: "Your authentication OTP code is sent via your phone, Please check your phone. It's valid for 10 minutes only.",
            success: true,
        });
    }
    catch (error) {
        let err_code = ((_p = error === null || error === void 0 ? void 0 : error.opts) === null || _p === void 0 ? void 0 : _p.code) || 500;
        return res.status(err_code).json({
            message: ((_q = error === null || error === void 0 ? void 0 : error.opts) === null || _q === void 0 ? void 0 : _q.title) || "Something went wrong.",
            success: false,
            error: error,
        });
    }
});
exports.otpAuthenticationRequest = otpAuthenticationRequest;
