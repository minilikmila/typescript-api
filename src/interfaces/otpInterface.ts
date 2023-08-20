import { OtpTypes } from "../utils/enum";

export interface IOtp {
  userId: any;
  type: OtpTypes;
  otp: string;
  otp_expired_at: Date | null;
}
