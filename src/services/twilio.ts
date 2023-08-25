import { Twilio } from "twilio";
import { TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN } from "../config";
import HttpError from "../utils/httpError";
import Logging from "../library/logging";

export const InitTwilioClient = () => {
  try {
    const client = new Twilio(TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN);

    return client;
  } catch (error: any) {
    Logging.error(
      `Error encountered while initialize twilio client : ${error}`
    );
    throw new HttpError({
      title: "twilio_init_client",
      code: 500,
      detail: error,
    });
    // return error;
  }
};
