import jwt, { Secret, JwtPayload } from "jsonwebtoken";
import { Response, Request, NextFunction } from "express";
import { ResponseType } from "../model/model_types";
import { CustomRequest } from "../model/model_types";
import { jwt_secret_key } from "../config";
import { validateToken } from "../utils/index";

export const Verify = (req: Request, res: Response, next: NextFunction) => {
  let token = req.header("Authorization");
  console.log("Original URL : ", req.originalUrl);
  // console.log(req?.originalUrl == "/api/user/me");
  //   console.log(token?.replace("Bearer", ""));
  if (!token) {
    return res.status(401).send(<ResponseType>{
      message: "Unauthorized!",
      success: false,
    });
  }
  try {
    // Verify
    const decoded = validateToken(token);
    (req as CustomRequest).token = decoded; // built in request extends customRequest additional get decoded Jwt payload ()

    next();
  } catch (e: any) {
    if (e?.opts?.title === "invalid_token") {
      return res.status(401).send(<ResponseType>{
        message: "Unauthorized.",
        error: e,
        success: false,
      });
    }
    return res.status(500).send(<ResponseType>{
      message: "Something went wrong.",
      error: e,
      success: false,
    });
  }
};
