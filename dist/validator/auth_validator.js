"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.phoneNumber = exports.authPassword = exports.emailAddress = exports.authorization = void 0;
const express_validator_1 = require("express-validator");
const index_1 = require("../utils/index");
const authorization = () => {
    return (0, express_validator_1.header)("authorization")
        .trim()
        .escape()
        .exists()
        .notEmpty()
        .withMessage("Missing authentication header")
        .bail()
        .customSanitizer((token, { location }) => {
        if (location === "headers")
            return (0, index_1.extractToken)(token);
    })
        .isJWT()
        .withMessage("Invalid Authorization header, must be Bearer authorization");
};
exports.authorization = authorization;
const emailAddress = () => {
    return (0, express_validator_1.body)("email")
        .trim()
        .escape()
        .exists()
        .notEmpty()
        .withMessage("Email address is required")
        .bail()
        .isLength({
        min: 3,
        max: 100,
    })
        .withMessage("Email address must be between 3 and 100 characters")
        .bail()
        .isEmail()
        .withMessage("Email address is not valid")
        .customSanitizer((email) => {
        return email.toLowerCase();
    });
};
exports.emailAddress = emailAddress;
const authPassword = () => {
    return ((0, express_validator_1.body)("password", "Password is not valid")
        .trim()
        .escape()
        .exists()
        .notEmpty()
        .isString()
        .isLength({
        min: 8,
        max: 255,
    }));
};
exports.authPassword = authPassword;
const phoneNumber = () => {
    return (0, express_validator_1.body)("phone_number")
        .trim()
        .escape()
        .exists()
        .notEmpty()
        .withMessage("Phone number is required.")
        .isLength({ min: 8 })
        .withMessage("Invalid phone number");
};
exports.phoneNumber = phoneNumber;
