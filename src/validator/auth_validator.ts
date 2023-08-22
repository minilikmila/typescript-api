import { header, body } from "express-validator";
import { extractToken } from "../utils/index";
import { ValidationChain } from "express-validator";

const authorization = (): ValidationChain => {
  return header("authorization")
    .trim()
    .escape()
    .exists()
    .notEmpty()
    .withMessage("Missing authentication header")
    .bail()
    .customSanitizer((token, { location }) => {
      if (location === "headers") return extractToken(token);
    })
    .isJWT()
    .withMessage("Invalid Authorization header, must be Bearer authorization");
};

const emailAddress = () => {
  return body("email")
    .trim()
    .escape()
    .exists()
    .notEmpty()
    .withMessage("Email address is required")
    .bail()
    .isLength({
      min: 3,
      max: 100,
    })
    .withMessage("Email address must be between 3 and 100 characters")
    .bail()
    .isEmail()
    .withMessage("Email address is not valid")
    .customSanitizer((email) => {
      return email.toLowerCase();
    });
};

const authPassword = () => {
  return (
    body("password", "Password is not valid")
      .trim()
      .escape()
      .exists()
      .notEmpty()
      .isString()
      // .isIn(["user", "1234"])
      // .withMessage("Do not use a common word as password.")
      .isLength({
        min: 8,
        max: 255,
      })
  );
};

const phoneNumber = () => {
  return body("phone_number")
    .trim()
    .escape()
    .exists()
    .notEmpty()
    .withMessage("Phone number is required.")
    .isLength({ min: 8 })
    .withMessage("Invalid phone number");
};

export { authorization, emailAddress, authPassword, phoneNumber };
