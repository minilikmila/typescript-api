import { NextFunction, Request, Response } from "express";
import { validationResult, ValidationChain } from "express-validator";

// Parallel processing...

const validate = (validations: ValidationChain[]) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    await Promise.all(validations.map((validation) => validation.run(req)));

    const errors = validationResult(req);
    if (errors.isEmpty()) {
      return next();
    }

    const response = errors.array().map((error: any) => {
      return {
        title: error.param,
        detail: error.msg,
        code: 422,
      };
    });
    res.status(422).json({ errors: response });
  };
};

export { validate };

// sequential processing....
