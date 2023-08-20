import { Twilio } from "twilio";
import {
  TWILIO_ACCOUNT_SID,
  TWILIO_AUTH_TOKEN,
  TWILIO_PHONE_NUMBER,
} from "../config";
import { SMSMessage } from "../model/model_types";

export const sendPhoneSMS = (payload: SMSMessage): void => {
  try {
    const client = new Twilio(TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN);

    client.messages
      .create({
        to: payload.to,
        from: payload?.from || TWILIO_PHONE_NUMBER,
        body: payload.body, // create error by setting it payload.from
      })
      .then((res) => {
        console.log("SMS sent successfully: with a body : - ", res.body);
      })
      .catch((err) => {
        console.log("Error happened when sending SMS: ", err);
      });
  } catch (error) {
    console.log("Error happened while initialize twilio client.", error);
    // return error;
  }
};
