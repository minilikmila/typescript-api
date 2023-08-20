"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const index_1 = require("../utils/enum/index");
// Schema define
const otpSchema = new mongoose_1.Schema({
    userId: {
        type: String,
        ref: "User",
        required: [true, "UserId required."],
    },
    type: {
        type: String,
        enum: Object.values(index_1.OtpTypes),
    },
    otp: {
        type: String,
        required: [true, "OTP code required"],
    },
    otp_expired_at: {
        type: Date,
        default: null,
    },
}, {
    timestamps: true,
});
const OtpM = (0, mongoose_1.model)("Otp", otpSchema);
exports.default = OtpM;
