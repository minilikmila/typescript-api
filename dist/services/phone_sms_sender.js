"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendPhoneSMS = void 0;
const twilio_1 = require("twilio");
const config_1 = require("../config");
const sendPhoneSMS = (payload) => {
    try {
        const client = new twilio_1.Twilio(config_1.TWILIO_ACCOUNT_SID, config_1.TWILIO_AUTH_TOKEN);
        client.messages
            .create({
            to: payload.to,
            from: (payload === null || payload === void 0 ? void 0 : payload.from) || config_1.TWILIO_PHONE_NUMBER,
            body: payload.body, // create error by setting it payload.from
        })
            .then((res) => {
            console.log("SMS sent successfully: with a body : - ", res.body);
        })
            .catch((err) => {
            console.log("Error happened when sending SMS: ", err);
        });
    }
    catch (error) {
        console.log("Error happened while initialize twilio client.", error);
        // return error;
    }
};
exports.sendPhoneSMS = sendPhoneSMS;
