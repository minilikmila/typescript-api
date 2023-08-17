import jwt, { Secret, JwtPayload } from "jsonwebtoken";
import { Response, Request, NextFunction } from "express";
import { ResponseType } from "../model/model_types";
import { jwt_secret_key } from "../controllers/auth";
import { CustomRequest } from "../model/model_types";

export const Verify = (req: Request, res: Response, next: NextFunction) => {
  let token = req.header("Authorization");
  //   console.log(token?.replace("Bearer", ""));
  if (!token) {
    return res.status(401).send(<ResponseType>{
      message: "Unauthorized!",
      success: false,
    });
  }
  try {
    if (token.startsWith("Bearer")) {
      // IF the token is bearer token...
      token = token.split(" ")[1];
    }
    // Verify
    const decoded = jwt.verify(token, jwt_secret_key);
    (req as CustomRequest).token = decoded; // built in request extends customRequest additional get decoded Jwt payload ()

    next();
  } catch (error) {
    return res.status(500).send(<ResponseType>{
      message: "Something went wrong.",
      error: error,
      success: false,
    });
  }
};
