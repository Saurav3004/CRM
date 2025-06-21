import express from "express";
import dotenv from 'dotenv';
import { connectDB } from "./config/db.js";
import cors from 'cors'
import userRouter from './routes/userRoute.js'

const app = express();
app.use(cors())
app.use(express.json())

dotenv.config();
connectDB();

app.use("/api/user",userRouter)

app.listen(3000,() => {
    console.log("app is running on port 3000")
})