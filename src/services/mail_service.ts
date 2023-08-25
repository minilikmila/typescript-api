import nodemailer from "nodemailer";
import { MailInterface } from "../interfaces/mailInterface";
import Logging from "../library/logging";
import HttpError from "../utils/httpError";
import SMTPTransport from "nodemailer/lib/smtp-transport";
import { MailOptions } from "nodemailer/lib/json-transport";

export default class Mailer {
  private static instance: Mailer;
  transporter: nodemailer.Transporter;
  constructor() {
    this.transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: process.env.SMTP_PORT,
      // secure: process.env.SMTP_TLS === "yes" ? true : false,
      auth: {
        user: process.env.SMTP_USERNAME,
        pass: process.env.SMTP_PASSWORD,
      },
    } as SMTPTransport.Options);
  }

  static getInstance() {
    if (!Mailer.instance) {
      Mailer.instance = new Mailer();
    }
    return Mailer.instance;
  }
  async sendEmail(mailOption: MailOptions) {
    Logging.info(`Info: sending started.`);
    await this.transporter
      .sendMail(mailOption)
      .then((info) => {
        Logging.info(`Msg sent : ${info.response}`);
      })
      .catch((err: any) => {
        Logging.error(`Error when sent a mail - ${err}`);
        throw new HttpError({
          title: "mailer_error",
          code: 500,
          detail: err,
        });
      });
  }

  async verifyConnection() {
    return this.transporter.verify();
  }
  async getTransporter() {
    return this.transporter;
  }
}

// Another options: use class and the fun__
export const sendEmail = async (mailOption: MailOptions) => {
  try {
    const mailObject = new Mailer();
    const transporter = mailObject.transporter;

    Logging.info(`Transporter, ${await mailObject.verifyConnection()}`);
    const info = await transporter.sendMail(mailOption);
    Logging.info(`Info: ${info.response}`);
  } catch (err: any) {
    Logging.error(`Mailing error encountered : ${err} `);
    throw new HttpError({
      title: "mail_service_error",
      code: 500,
      detail: err,
    });
  }
};
