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
exports.otpAuthenticationRequest = exports.otpAuthentication = exports.resetPassword = exports.phoneForgotPassword = exports.resendPhoneConfirmationCode = exports.confirmPhoneNumber = exports.confirmEmail = exports.login = exports.register = void 0;
const user_1 = __importDefault(require("../model/user"));
const bcrypt_1 = __importDefault(require("bcrypt"));
const phone_sms_sender_1 = require("../services/phone_sms_sender");
const index_1 = require("../utils/index");
const enum_1 = require("../utils/enum");
const httpError_1 = __importDefault(require("../utils/httpError"));
const verifyEmailTemplate_1 = __importDefault(require("../templates/verifyEmailTemplate"));
const mail_service_1 = __importDefault(require("../services/mail_service"));
const logging_1 = __importDefault(require("../library/logging"));
const register = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b;
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
        const user = yield user_1.default.create({
            name: body.name,
            email: body.email,
            password: hashedPassword,
            phone_number: body.phone_number,
            country_code: body.country_code,
        });
        if (!user) {
            throw new httpError_1.default({
                title: "error_on_account_signup",
                code: 500,
                detail: "Error encountered when signup.",
            });
        }
        user.token_type = enum_1.TokenType.EMAIL_VERIFICATION;
        const confirmationToken = yield tokenBuilder(user);
        const emailTemplate = (0, verifyEmailTemplate_1.default)(confirmationToken);
        const mailService = new mail_service_1.default();
        logging_1.default.info(`Transporter status: ${yield mailService.verifyConnection()}`);
        yield mailService.sendEmail({
            to: body.email,
            subject: "Verification",
            html: emailTemplate.html,
        });
        return res.status(200).json({
            message: "Signed up successfully. Confirmation sent via your email, Please confirm your account.",
            success: true,
        });
    }
    catch (error) {
        logging_1.default.error(`Error: ${req.originalUrl}: encountered error - ${error}`);
        let err_code = ((_a = error === null || error === void 0 ? void 0 : error.opts) === null || _a === void 0 ? void 0 : _a.code) || 500;
        return res.status(err_code).send({
            message: ((_b = error === null || error === void 0 ? void 0 : error.opts) === null || _b === void 0 ? void 0 : _b.title) || "Something went wrong.",
            error: error,
            success: false,
        });
    }
});
exports.register = register;
const login = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _c, _d;
    const body = req.body;
    try {
        if (!body.phone_number || !body.password) {
            throw new httpError_1.default({
                title: "missed_required_field",
                detail: "You have to provide required fields.",
                code: 400,
            });
        }
        const foundUser = yield user_1.default.findOne({
            phone_number: body.phone_number,
        });
        if ((foundUser && !foundUser.is_phone_confirmed) ||
            !(foundUser === null || foundUser === void 0 ? void 0 : foundUser.is_email_confirmed)) {
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
        let err_code = ((_c = error === null || error === void 0 ? void 0 : error.opts) === null || _c === void 0 ? void 0 : _c.code) || 500;
        return res.status(err_code).json({
            message: ((_d = error === null || error === void 0 ? void 0 : error.opts) === null || _d === void 0 ? void 0 : _d.title) || "Something went wrong",
            success: false,
            error: error,
        });
    }
});
exports.login = login;
const tokenBuilder = (user) => __awaiter(void 0, void 0, void 0, function* () {
    const token = (0, index_1.generateJWTToken)({
        id: user.id,
        email: user.email,
        token: user.token_type || enum_1.TokenType.ACCESS,
    }, {
        issuer: user.token_type === enum_1.TokenType.EMAIL_VERIFICATION
            ? user.email
            : user.phone_number,
        subject: user.id,
        audience: "root",
    });
    return token;
});
const confirmEmail = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _e, _f;
    const { token, email } = req.body;
    try {
        if (!email || !token) {
            throw new httpError_1.default({
                title: "required_field_missed",
                code: 400,
                detail: "Phone number and verification token is required fields.",
            });
        }
        const user = yield user_1.default.findOne({ email });
        if (!user) {
            throw new httpError_1.default({
                title: "account_not_found",
                detail: "Account not found with this email",
                code: 404,
            });
        }
        if (user.is_email_confirmed) {
            throw new httpError_1.default({
                title: "already_confirmed",
                detail: "The account is already confirmed.",
                code: 404,
            });
        }
        const decoded = yield (0, index_1.validateToken)(token);
        if (decoded.email != user.email) {
            throw new httpError_1.default({
                title: "invalid_request",
                code: 400,
                detail: "User metadata mismatch.",
            });
        }
        user.is_email_confirmed = true;
        user.email_confirmed_at = new Date();
        yield user.save();
        let otpExpiration = new Date();
        otpExpiration = otpExpiration.setMinutes(otpExpiration.getMinutes() + 10);
        const p_code = (0, index_1.generateOTP)(6);
        const to = `${user.country_code}${user.phone_number}`;
        yield (0, index_1.setOtp)({
            userId: user.id,
            otp: p_code,
            type: enum_1.OtpTypes.VERIFICATION,
            otp_expired_at: new Date(otpExpiration),
        });
        (0, phone_sms_sender_1.sendPhoneSMS)({
            body: `${p_code} - Is your verification code and valid for only 10 minutes, please confirm to activate your account. and then you can login to your account.`,
            to,
        });
        return res.status(200).json({
            message: "Your email is confirmed. Now we sent OTP code to your mobile number, Please confirm your phone. and then you have authenticated access to your account.",
        });
    }
    catch (error) {
        logging_1.default.error(`Error: ${req.originalUrl}: encountered error - ${error}`);
        let err_code = ((_e = error === null || error === void 0 ? void 0 : error.opts) === null || _e === void 0 ? void 0 : _e.code) || 500;
        return res.status(err_code).send({
            message: ((_f = error === null || error === void 0 ? void 0 : error.opts) === null || _f === void 0 ? void 0 : _f.title) || "Something went wrong.",
            error: error,
            success: false,
        });
    }
});
exports.confirmEmail = confirmEmail;
const confirmPhoneNumber = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _g, _h;
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
        let err_code = ((_g = error === null || error === void 0 ? void 0 : error.opts) === null || _g === void 0 ? void 0 : _g.code) || 500;
        return res.status(err_code).json({
            message: ((_h = error === null || error === void 0 ? void 0 : error.opts) === null || _h === void 0 ? void 0 : _h.title) || "Something went wrong.",
            success: false,
            error: error,
        });
    }
});
exports.confirmPhoneNumber = confirmPhoneNumber;
const resendPhoneConfirmationCode = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _j, _k;
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
        (0, phone_sms_sender_1.sendPhoneSMS)({
            body: `${code} - Is your confirmation code and valid for only 10 minutes, please confirm to activate your account.`,
            to,
        });
        return res.status(200).json({
            message: "Confirmation sent successfully. Check your mobile phone.",
            id: user === null || user === void 0 ? void 0 : user.id,
            success: true,
        });
    }
    catch (error) {
        let err_code = ((_j = error === null || error === void 0 ? void 0 : error.opts) === null || _j === void 0 ? void 0 : _j.code) || 500;
        return res.status(err_code).json({
            message: ((_k = error === null || error === void 0 ? void 0 : error.opts) === null || _k === void 0 ? void 0 : _k.title) || "Something went wrong.",
            success: false,
            error: error,
        });
    }
});
exports.resendPhoneConfirmationCode = resendPhoneConfirmationCode;
const phoneForgotPassword = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _l, _m;
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
        let err_code = ((_l = error === null || error === void 0 ? void 0 : error.opts) === null || _l === void 0 ? void 0 : _l.code) || 500;
        return res.status(err_code).json({
            message: ((_m = error === null || error === void 0 ? void 0 : error.opts) === null || _m === void 0 ? void 0 : _m.title) || "Something went wrong.",
            success: false,
            error: error,
        });
    }
});
exports.phoneForgotPassword = phoneForgotPassword;
const resetPassword = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _o, _p;
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
        let err_code = ((_o = error === null || error === void 0 ? void 0 : error.opts) === null || _o === void 0 ? void 0 : _o.code) || 500;
        return res.status(err_code).json({
            message: ((_p = error === null || error === void 0 ? void 0 : error.opts) === null || _p === void 0 ? void 0 : _p.title) || "Something went wrong.",
            success: false,
            error: error,
        });
    }
});
exports.resetPassword = resetPassword;
const otpAuthentication = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _q, _r;
    const { phone_number, code } = req.body;
    try {
        if (!phone_number || !code) {
            throw new httpError_1.default({
                title: "required_field_missed",
                code: 400,
                detail: "Your phone number, and authentication code is required fields.",
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
        let err_code = ((_q = error === null || error === void 0 ? void 0 : error.opts) === null || _q === void 0 ? void 0 : _q.code) || 500;
        return res.status(err_code).json({
            message: ((_r = error === null || error === void 0 ? void 0 : error.opts) === null || _r === void 0 ? void 0 : _r.title) || "Something went wrong.",
            success: false,
            error: error,
        });
    }
});
exports.otpAuthentication = otpAuthentication;
const otpAuthenticationRequest = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _s, _t;
    const { phone_number } = req.body;
    try {
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
        let err_code = ((_s = error === null || error === void 0 ? void 0 : error.opts) === null || _s === void 0 ? void 0 : _s.code) || 500;
        return res.status(err_code).json({
            message: ((_t = error === null || error === void 0 ? void 0 : error.opts) === null || _t === void 0 ? void 0 : _t.title) || "Something went wrong.",
            success: false,
            error: error,
        });
    }
});
exports.otpAuthenticationRequest = otpAuthenticationRequest;
