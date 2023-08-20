"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validatePConfirmation = void 0;
const validatePConfirmation = (req, res, next) => {
    const { code, phone_number } = req.body;
    if (req.originalUrl == "/api/auth/resend_phone_code") {
        const { phone_number } = req.body;
        if (!phone_number) {
            return res.status(400).send({
                message: "Phone number is required.",
                success: false,
            });
        }
    }
    else if (req.originalUrl == "/api/auth/confirm_phone" && !phone_number) {
        return res.status(400).send({
            message: "You have to provide phone number.",
            success: false,
        });
    }
    else if (!code) {
        return res.status(400).send({
            message: "Confirmation code is required.",
            success: false,
        });
    }
    next();
};
exports.validatePConfirmation = validatePConfirmation;
