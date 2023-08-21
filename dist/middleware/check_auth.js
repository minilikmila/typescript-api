"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Verify = void 0;
const index_1 = require("../utils/index");
const Verify = (req, res, next) => {
    var _a;
    let token = req.header("Authorization");
    console.log("Original URL : ", req.originalUrl);
    if (!token) {
        return res.status(401).send({
            message: "Unauthorized!",
            success: false,
        });
    }
    try {
        const decoded = (0, index_1.validateToken)(token);
        req.token = decoded;
        next();
    }
    catch (e) {
        if (((_a = e === null || e === void 0 ? void 0 : e.opts) === null || _a === void 0 ? void 0 : _a.title) === "invalid_token") {
            return res.status(401).send({
                message: "Unauthorized.",
                error: e,
                success: false,
            });
        }
        return res.status(500).send({
            message: "Something went wrong.",
            error: e,
            success: false,
        });
    }
};
exports.Verify = Verify;
