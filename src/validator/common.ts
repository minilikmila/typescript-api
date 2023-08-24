import { body } from "express-validator";

const requiredStringFields = (
  field: string,
  readableName: string,
  options?: { min: number; max: number }
) => {
  return body(field)
    .trim()
    .exists()
    .notEmpty()
    .withMessage(`${readableName} is required field.`)
    .isString()
    .bail()
    .isLength({ min: options?.min, max: options?.max })
    .withMessage(
      `${readableName} must be between ${options?.min} and ${options?.max} characters`
    );
};

export { requiredStringFields };
