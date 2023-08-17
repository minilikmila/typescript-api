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
exports.login = exports.register = exports.jwt_secret_key = void 0;
const user_1 = __importDefault(require("../model/user"));
const bcrypt_1 = __importDefault(require("bcrypt"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
exports.jwt_secret_key = process.env.JWT_SECRET_KEY;
console.log("CONNECTED : ", exports.jwt_secret_key);
const register = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const body = req.body;
    if (!body.email || !body.name || !body.password) {
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
    // we can also use as const: Promise<UserSchemaType> = User.create({name, email, password})
    const user = yield user_1.default.create({
        name: body.name,
        email: body.email,
        password: hashedPassword,
    });
    if (user) {
        let response = {
            _id: user.id,
            name: user.name,
            email: user.email,
            token: generateToken(user),
        };
        return res.status(201).json(response);
    }
    else {
        return res.status(500).send({
            message: "Something went wrong.",
            success: false,
        });
    }
});
exports.register = register;
const login = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const body = req.body;
    if (!body.email || !body.password) {
        return res.status(400).json({
            message: "Required field is missed.",
            success: false,
        });
    }
    try {
        // request user data
        const foundUser = yield user_1.default.findOne({ email: body.email });
        if (foundUser && (foundUser === null || foundUser === void 0 ? void 0 : foundUser.password)) {
            const isMatched = bcrypt_1.default.compare(body.password, foundUser === null || foundUser === void 0 ? void 0 : foundUser.password);
            if (!isMatched) {
                return res.status(401).json({
                    message: "Invalid cred's",
                    success: false,
                });
            }
            return res.status(200).json({
                _id: foundUser.id,
                name: foundUser.name,
                email: foundUser.email,
                token: generateToken(foundUser),
            });
        }
        else {
            return res.status(500).json({
                message: "Something went wrong",
                success: false,
            });
        }
    }
    catch (error) {
        return res.status(500).json({
            message: "Something went wrong",
            success: false,
        });
    }
});
exports.login = login;
const generateToken = (payload) => {
    let token;
    token = jsonwebtoken_1.default.sign({
        id: payload.id,
        name: payload.name,
        email: payload.email,
    }, exports.jwt_secret_key, {
        expiresIn: "30m",
    });
    return token;
};
