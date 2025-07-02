import express from "express";
import dotenv from 'dotenv';
import { connectDB } from "./config/db.js";
import cors from 'cors'
import userRouter from './routes/userRoute.js'
import importRouter from './routes/importRoute.js'
import bookingRouter from './routes/bookingRoute.js'
import dashboardRoutes from './routes/dashboardRoute.js'
import exportRoutes from './routes/exportRoute.js'

const app = express();
app.use(cors())
app.use(express.json())

dotenv.config();
connectDB();

app.use("/api/user",userRouter)
app.use("/api/import",importRouter)
app.use("/api/booking",bookingRouter)
app.use('/api/dashboard', dashboardRoutes);
app.use("/api/export",exportRoutes)


app.listen(3000,() => {
    console.log("app is running on port 3000")
})