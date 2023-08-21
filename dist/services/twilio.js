"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.InitTwilioClient = void 0;
const twilio_1 = require("twilio");
const config_1 = require("../config");
const InitTwilioClient = () => {
    try {
        const client = new twilio_1.Twilio(config_1.TWILIO_ACCOUNT_SID, config_1.TWILIO_AUTH_TOKEN);
        return client;
    }
    catch (error) {
        console.log("Error happened while initialize twilio client.");
    }
};
exports.InitTwilioClient = InitTwilioClient;
