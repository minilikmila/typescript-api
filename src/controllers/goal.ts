import { Request, Response } from "express";
import Goal from "../model/goal";
import {
  UserSchemaType,
  GoalSchemaType,
  ResponseType,
  CustomRequest,
} from "../model/interface_types";
// import { CustomRequest } from "../middleware/check_auth";

export const SetGoal = async (
  req: Request,
  res: Response
): Promise<Response> => {
  const body: GoalSchemaType = req.body;
  if (!body.text) {
    return res.status(400).json({
      message: "Goal must have a title",
      success: false,
    });
  }
  try {
    //   Need combined type including both userType and JwtPayload type
    const CustomizeReq = req as CustomRequest;
    const r = <UserSchemaType>CustomizeReq.token;

    const goal = await Goal.create({
      text: body.text,
      user: r.id,
    });

    return res.status(200).send(<GoalSchemaType>goal);
  } catch (error) {
    return res.status(500).send(<ResponseType>{
      message: "Internal Server Error.",
      error: error,
      success: false,
    });
  }
};

export const GetGoals = async (
  req: Request,
  res: Response
): Promise<Response> => {
  const customizedReq = req as CustomRequest;
  const r = <UserSchemaType>customizedReq.token;
  try {
    const goals = await Goal.find({ user: r.id }).populate("user"); // deep populate of the reference(r\nal) documents.
    console.log("GOAL: : ", goals);
    return res.status(200).json(<GoalSchemaType[]>goals);
  } catch (error) {
    return res.status(500).send(<ResponseType>{
      message: "Internal Server Error.",
      error: error,
      success: false,
    });
  }
};

export const DeleteGoal = async (req: Request, res: Response) => {
  const customizedReq = req as CustomRequest;
  const r = <UserSchemaType>customizedReq.token;

  try {
    const goal = await Goal.findOne({
      _id: req.params.id,
    });
    if (!goal) {
      return res.status(404).json(<ResponseType>{
        message: "Goal not found.",
        success: false,
      });
    }

    //   check auth
    if (goal.user.toString() !== r.id) {
      return res.status(401).json({
        message: "Unauthorized",
        success: false,
      });
    }

    await goal.deleteOne();

    return res.status(200).json(<GoalSchemaType>goal);
  } catch (error) {
    return res.status(500).send(<ResponseType>{
      message: "Internal Server Error - - .",
      error: error,
      success: false,
    });
  }
};

export const UpdateGoal = async (req: Request, res: Response) => {
  const customizedReq = req as CustomRequest;
  const r = <UserSchemaType>customizedReq.token;
  const { text } = customizedReq.body;

  try {
    if (!text) {
      return res.status(401).json(<ResponseType>{
        message: "You have to provide the fields.",
        success: false,
      });
    }
    console.log("Goal id ", customizedReq.params.id);
    const goal = await Goal.findOne({
      _id: customizedReq.params.id,
    });

    if (!goal) {
      return res.status(404).json(<ResponseType>{
        message: "Goal not found.",
        success: false,
      });
    }

    if (goal?.user != r.id) {
      // OR: Just use goal?.user.toString() and include type checking
      return res.status(401).json(<ResponseType>{
        message: "You are not allowed to update this one.",
        success: false,
      });
    }

    await goal?.updateOne(<GoalSchemaType>{ text: text });

    return res.status(200).json(<GoalSchemaType>{
      id: customizedReq.params.id,
    });
  } catch (error) {
    return res.status(500).send(<ResponseType>{
      message: "Internal server error.",
      error: error,
      success: false,
    });
  }
};
