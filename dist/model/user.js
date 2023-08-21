"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const userSchema = new mongoose_1.Schema({
    name: {
        type: String,
        required: [true, "User name is required!"],
    },
    email: {
        type: String,
        required: [true, "Email is required field!"],
        unique: true,
    },
    password: {
        type: String,
        required: [true, "Password is required field!"],
    },
    is_email_confirmed: {
        type: Boolean,
        default: false,
    },
    is_phone_confirmed: {
        type: Boolean,
        default: false,
    },
    phone_confirmation_code: {
        type: String,
        required: false,
    },
    email_confirmation_token: {
        type: String,
        required: false,
    },
    email_confirmed_at: {
        type: Date,
    },
    phone_confirmed_at: {
        type: Date,
    },
    phone_number: {
        type: String,
        required: [true, "Phone number is required field."],
    },
    country_code: {
        type: String,
        required: true,
    },
}, {
    timestamps: true,
});
const User = (0, mongoose_1.model)("User", userSchema);
exports.default = User;
