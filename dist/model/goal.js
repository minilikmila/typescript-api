"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const goalSchema = new mongoose_1.Schema({
    user: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: "User",
    },
    text: {
        type: String,
        required: [true, "Text is required!"],
    },
}, {
    timestamps: true,
});
const Goal = (0, mongoose_1.model)("Goal", goalSchema);
exports.default = Goal;
