import express, { Express, Request, Response } from "express";
import "dotenv/config";
import cors from "cors";
// import { initDB } from "./db/init";
import { connect } from "mongoose";
import { ResponseType } from "./model/interface_types";

// Route handlers
import auth_handler from "./routes/auth";
import goal_handler from "./routes/goal";
import user_handler from "./routes/user";

// Install @types/package for TS and package itself for the JS
// initDB();
(async function () {
  try {
    await connect("mongodb://127.0.0.1:27017/ToDo");
    console.log("Connected!");
  } catch (error) {
    console.log("CONNECTION ERROR : ", error);
  }
})();

const PORT: string = process.env.PORT || "4900";

const app: Express = express();

app.use(express.json({ limit: "60MB" }));

app.use(express.urlencoded({ extended: true }));

app.use(cors({ origin: "*" }));

//   General Routes
app.use("/api/auth", auth_handler);
app.use("/api/goal", goal_handler);
app.use("/api/user", user_handler);

app
  .get(`/check`, (req: Request, res: Response) => {
    let resp_body: ResponseType = {
      message: "GET:successful",
      status: "OK- Healthy",
      success: true,
    };
    return res.status(200).json(resp_body);
  })
  .post("/check", (req: Request, res: Response) => {
    let resp_body: ResponseType = {
      message: "POST:successful",
      status: "OK- Healthy",
      success: true,
    };
    return res.status(200).json(resp_body);
  });

app.listen(PORT, () => {
  console.log("Typescript server started at 🔥: ", PORT);
});
