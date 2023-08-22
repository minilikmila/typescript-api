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
exports.sendEmail = void 0;
const nodemailer_1 = __importDefault(require("nodemailer"));
const logging_1 = __importDefault(require("../library/logging"));
const httpError_1 = __importDefault(require("../utils/httpError"));
class Mailer {
    constructor() {
        this.transporter = nodemailer_1.default.createTransport({
            host: process.env.SMTP_HOST,
            port: process.env.SMTP_PORT,
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
            logging_1.default.info(`Info: sending started.`);
            yield this.transporter
                .sendMail(mailOption)
                .then((info) => {
                logging_1.default.info(`Msg sent: ${info.response}`);
            })
                .catch((err) => {
                logging_1.default.error(`Error when sent a mail - ${err}`);
                throw new httpError_1.default({
                    title: "mailer_error",
                    code: 500,
                    detail: err,
                });
            });
        });
    }
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
const sendEmail = (mailOption) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const mailObject = new Mailer();
        const transporter = mailObject.transporter;
        logging_1.default.info(`Transporter, ${yield mailObject.verifyConnection()}`);
        const info = yield transporter.sendMail(mailOption);
        logging_1.default.info(`Info: ${info.response}`);
    }
    catch (err) {
        console.log("error inside mailing service: ", err);
        throw new httpError_1.default({
            title: "mail_service_error",
            code: 500,
            detail: err,
        });
    }
});
exports.sendEmail = sendEmail;
