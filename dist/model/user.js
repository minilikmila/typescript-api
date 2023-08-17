"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
// Use Generic type to the schema type
const userSchema = new mongoose_1.Schema({
    name: {
        type: String,
        required: [true, "User name is required!"],
    },
    email: {
        type: String,
        required: [true, "Email is required field!"],
    },
    password: {
        type: String,
        required: [true, "Password is required field!"],
    },
}, {
    timestamps: true,
});
const User = (0, mongoose_1.model)("User", userSchema);
exports.default = User;
