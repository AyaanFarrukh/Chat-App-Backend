import mongoose from "mongoose";

const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URL);
        const connection = mongoose.connection;
        connection.on("connected", () => {
            console.log("db connected sucessfully")
        });
        connection.on("error", (error) => {
            console.log("db connection failed", error)
        })
    } catch (error) {
        console.log("Something Went Wrong In DB", error)
    }
}

export default connectDB;
