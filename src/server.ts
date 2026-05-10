import express, { Application } from "express";
import connectDB from "./database/connection.js";
import authRoutes from "./routes/auth.route.js";
import userRoutes from "./routes/user.route.js";
import cookieParser from "cookie-parser";

const app: Application = express();
app.use(express.json());
app.use(cookieParser());

app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);

connectDB();

app.listen(3000, () => {
    console.log("Server is running on port 3000");
});
