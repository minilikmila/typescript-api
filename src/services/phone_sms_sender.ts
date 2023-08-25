import { Twilio } from "twilio";
import {
  TWILIO_ACCOUNT_SID,
  TWILIO_AUTH_TOKEN,
  TWILIO_PHONE_NUMBER,
} from "../config";
import { SMSMessage } from "../model/interface_types";
import HttpError from "../utils/httpError";
import Logging from "../library/logging";

export const sendPhoneSMS = (payload: SMSMessage) => {
  try {
    const client = new Twilio(TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN);

    client.messages
      .create({
        to: payload.to,
        from: payload?.from || TWILIO_PHONE_NUMBER,
        body: payload.body, // create error by setting it payload.from
      })
      .then((res) => {
        Logging.info(`SMS sent successfully : ${res.body}`);
      })
      .catch((err) => {
        Logging.error(`Error encountered when sending sms : ${err}`);
        throw new HttpError({
          title: "phone_sms_sender_error",
          code: 500,
          detail: err,
        });
      });
  } catch (error: any) {
    Logging.error(`Encountered error when sending SMS : ${error}`);
    // return error;
    throw new HttpError({
      title: "phone_sms_general_error",
      code: 500,
      detail: error,
    });
  }
};
