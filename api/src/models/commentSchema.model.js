import mongoose, { Schema } from "mongoose";

const commentSchema = new Schema(
    {
        user: { 
            type: Schema.Types.ObjectId, 
            ref: "User", 
            required: true 
        }, 

        message: { 
            type: String, 
            required: true 
        }, 

        likeCount: { 
            type: Number, 
            default: 0 
        }, 

        likes: [
            { 
                type: Schema.Types.ObjectId, 
                ref: "Like" 
            }
        ], 

        replies: [
            { 
                type: Schema.Types.ObjectId, 
                ref: "Reply"  
            }
        ], 
    },
    { 
        timestamps: true 
    } 
);

export const Comment = mongoose.model("Comment", commentSchema);
export {commentSchema}