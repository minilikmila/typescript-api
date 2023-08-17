import User from "../model/user";
import { Request, Response } from "express";
import {
  ResponseType,
  CustomRequest,
  UserSchemaType,
} from "../model/model_types";
export const me = async (req: Request, res: Response) => {
  const customizedReq = req as CustomRequest;

  const r = <UserSchemaType>customizedReq.token;

  console.log("USER ID: ", r.id);
  try {
    const user = await User.findOne({ _id: r.id }).select("-password");
    if (!user) {
      return res.status(404).json(<ResponseType>{
        message: "User not found or something went wrong.",
        success: false,
      });
    }

    return res.status(200).json(<UserSchemaType>user);
  } catch (error) {
    return res.status(500).send(<ResponseType>{
      message: "Internal Server Error.",
      error: error,
      success: false,
    });
  }
};
