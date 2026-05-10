import mongoose from "mongoose";

const connectDB = async (): Promise<void> => {
    try {
        console.log("Database connected");
    } catch (error) {
        console.log(error);
    }
};

export default connectDB;
