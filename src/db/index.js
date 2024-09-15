import {DB_NAME} from "../constants.js"
import mongoose from "mongoose"
const connectDB=async()=>{
    try{
       const connectionInstance= await mongoose.connect(`${process.env.MONGO_URL}/${DB_NAME}`)
       console.log(`\n MongoDB connected DB Host : ${connectionInstance.connection.host}`)
    } catch(error)
    {
        console.error("Error is",error);
        process.exit(1)
    }
}
export default connectDB