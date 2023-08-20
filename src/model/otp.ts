import { Schema, Document, model } from "mongoose";
import { IOtp } from "../interfaces/otpInterface";
import { OtpTypes } from "../utils/enum/index";

export interface IOtpModel extends IOtp, Document {}

// Schema define
const otpSchema: Schema = new Schema<IOtp>(
  {
    userId: {
      type: String,
      ref: "User",
      required: [true, "UserId required."],
    },
    type: {
      type: String,
      enum: Object.values(OtpTypes),
    },
    otp: {
      type: String,
      required: [true, "OTP code required"],
    },
    otp_expired_at: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

const OtpM = model<IOtpModel>("Otp", otpSchema);

export default OtpM;
