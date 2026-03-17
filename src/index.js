import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import connectDb from './lib/connectDb.js';
import authRoutes from './routes/auth.route.js';
import cookieParser from "cookie-parser";
const app =express();
dotenv.config();
connectDb();
app.use(express.json()); 
app.use(cookieParser());
const port = process.env.PORT;
app.use("/api/auth", authRoutes)
app.listen(port,()=> {
    console.log('server is running on '+ port)
})