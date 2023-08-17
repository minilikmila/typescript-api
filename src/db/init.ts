import { connect } from "mongoose";

export const initDB = async () => {
  try {
    console.log("connection", process.env.MONGO_URI);

    const conn_url = process.env.MONGO_URI || "mongodb://localhost:27017";

    const conn = await connect(conn_url);

    console.log(`MongoDB connected ! : ${conn.connection.host}`);
  } catch (error) {
    console.log("MongoDB connection error: ", error);
    process.exit(1);
  }
};
