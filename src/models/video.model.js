import mongoose,{Schema} from mongoose
import mongooseAggregatePaginate from "mongoose-aggregate-paginate-v2"
const videoSchema=new Schema({
    duration:{
        type:Number,
        required:true
    },
    title:{
        type:String,
        required:true
    },
    ownedBy:{
        type:Schema.Types.ObjectId,
        ref:"User"
    },
    videoFile:{
        type:String
    },
    description:{
        type:String,
        required:true
    },
    views:{
        type:Number,
        required:true,
        default:0
    },
    isPublished:{
        type:Boolean,
        default:true
    },
    thumbnail:{
        type:String,
        required:true
    }
},{timestamps:true})
videoSchema.plugin(mongooseAggregatePaginate)
export const Video= mongoose.model("Video",videoSchema)