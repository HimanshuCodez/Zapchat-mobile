import express from 'express'
import dotenv from 'dotenv'
import authRoutes from './routes/auth.routes.js'
import messageRoutes from './routes/message.routes.js'
import cors from 'cors'
import mongoose from 'mongoose'
import  cookieParser from 'cookie-parser'
import { app,server } from './utils/socket.js'
import path from "path";

dotenv.config()
const PORT = process.env.PORT
const _dirname = path.resolve()
const URI = process.env.URI

app.use(express.json({ limit: "10mb" })); // Adjust "10mb" to your needs
app.use(express.urlencoded({ extended: true, limit: "10mb" }));
app.use(cookieParser())
app.use(cors({
    origin: true,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
}));




app.use("/api/auth",authRoutes)
app.use("/api/messages",messageRoutes)






mongoose.connect(URI).then(() => console.log('connected to mongodb')).catch((err) => console.log(err));

if(process.env.NODE_ENV ==="production"){
    app.use(express.static(path.join(_dirname, '../Client/dist')))
    app.get("*", (req, res) => {
        res.sendFile(path.join(_dirname, "../Client","dist","index.html"))
    });
}


server.listen(PORT,()=>{
    console.log(`Server is running on port ${PORT}`)

})