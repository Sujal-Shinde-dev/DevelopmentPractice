import express from "express"
import cors from "cors";
import cookieParser from "cookie-parser";
const app=express();
app.use(cors({
    origin:process.env.CORS_ORIGIN,
    credentials:true
}
))
app.get(express.json({limit:"16kb",credentials: true}))
app.get(express.urlencoded({limit:"16kb",extended:true}))
app.get(express.static("public"))
app.get(cookieParser())

export { app }