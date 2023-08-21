"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const nodemailer_1 = __importDefault(require("nodemailer"));
class Mailer {
    constructor() {
        console.log("Constructor invoked!!");
        this.transporter = nodemailer_1.default.createTransport({
            host: process.env.SMTP_HOST,
            port: process.env.SMTP_PORT,
            secure: process.env.SMTP_TLS === "yes" ? true : false,
            auth: {
                user: process.env.SMTP_USERNAME,
                pass: process.env.SMTP_PASSWORD,
            },
        });
    }
    static getInstance() {
        if (!Mailer.instance) {
            Mailer.instance = new Mailer();
        }
        return Mailer.instance;
    }
    sendEmail(mailOption) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.transporter.sendMail(mailOption);
        });
    }
    //   async createConnection() {
    //     this.transporter = nodemailer.createTransport({
    //       host: process.env.SMTP_HOST,
    //       port: process.env.SMTP_PORT,
    //       secure: process.env.SMTP_TLS === "yes" ? true : false,
    //       auth: {
    //         user: process.env.SMTP_USERNAME,
    //         pass: process.env.SMTP_PASSWORD,
    //       },
    //     } as SMTPTransport.Options);
    //   }
    //   async sendMail(requestId: string | number, options: MailInterface) {
    //     return await this.transporter
    //       .sendMail({
    //         from: `Auth: ${options.from || process.env.SMTP_SENDER}`,
    //         to: options.to,
    //         cc: options.cc,
    //         bcc: options.bcc,
    //         subject: options.subject,
    //         text: options?.text,
    //         html: options.html,
    //       })
    //       .then((info: any) => {
    //         Logging.info(`${requestId} - Mail sent successfully!!`);
    //         Logging.info(
    //           `${requestId} - [MailResponse]=${info.response} [MessageID]=${info.messageId}`
    //         );
    //         if (process.env.NODE_ENV === "local") {
    //           Logging.info(
    //             `${requestId} - Nodemailer ethereal URL: ${nodemailer.getTestMessageUrl(
    //               info
    //             )}`
    //           );
    //         }
    //         return info;
    //       })
    //       .catch((err: any) => {
    //         console.log("error inside mailing service: ", err);
    //         throw new HttpError({
    //           title: "mail_service_error",
    //           code: 500,
    //           detail: err,
    //         });
    //       });
    //   }
    verifyConnection() {
        return __awaiter(this, void 0, void 0, function* () {
            return this.transporter.verify();
        });
    }
    getTransporter() {
        return __awaiter(this, void 0, void 0, function* () {
            return this.transporter;
        });
    }
}
exports.default = Mailer;
