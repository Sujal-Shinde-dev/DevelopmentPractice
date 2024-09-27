import mongoose, {Schema} from "mongoose";
const playListSchema=new Schema({
    owner:{
        type:Schema.Types.ObjectId,
        ref:"User"
    },
    video:[{
        type:Schema.Types.ObjectId,
        ref:"Video"
    }],
    description:{
        type:String,
        require:true
    },
    name:{
        type:String,
        require:true
    }


},{timestamps:true})
export const PlayList= mongoose.model("PlayList",playListSchema)