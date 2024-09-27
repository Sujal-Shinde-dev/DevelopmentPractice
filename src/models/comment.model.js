import mongoose,{Schema} from "mongoose";
import mongooseAggregatePaginate from "mongoose-aggregate-paginate-v2";//If more comments are their so to go to next page
const commentSchema=new Schema({
    video:{
        type:Schema.Types.ObjectId,
        ref:"Video"
    },
    owner:{
        type:Schema.Types.ObjectId,
        ref:"User"
    },
    content:{
        type:String,
        require:true

    }

},{
    timestamps:true
})
commentSchema.plugin(mongooseAggregatePaginate)
export const Comment= mongoose.model("Comment",commentSchema)