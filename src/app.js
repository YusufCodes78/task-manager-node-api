import express from "express";
const app = express();
import connectDB from "./db/mongoose.js";
import userRouter from "./router/userRouter.js";
import taskRouter from "./router/taskRouter.js";

app.use(express.json());
app.use(userRouter);
app.use(taskRouter);
await connectDB();

export default app;
