import { Schema, model } from "mongoose";
import { GoalSchemaType } from "./interface_types";

const goalSchema = new Schema<GoalSchemaType>(
  {
    user: {
      type: Schema.Types.ObjectId, // _id type in Schema definition ...
      ref: "User",
    },
    text: {
      type: String,
      required: [true, "Text is required!"],
    },
  },
  {
    timestamps: true,
  }
);

const Goal = model<GoalSchemaType>("Goal", goalSchema);

export default Goal;
