import { Twilio } from "twilio";
import { TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN } from "../config";

export const InitTwilioClient = () => {
  try {
    const client = new Twilio(TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN);

    return client;
  } catch (error) {
    console.log("Error happened while initialize twilio client.");
    // return error;
  }
};
