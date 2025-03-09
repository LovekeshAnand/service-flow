import mongoose, { Schema } from "mongoose";

const commentSchema = new Schema(
    {
        user: { 
            type: Schema.Types.ObjectId, 
            ref: "User", 
            required: true 
        }, // Commenting user

        message: { 
            type: String, 
            required: true 
        }, // Comment content

        likeCount: { 
            type: Number, 
            default: 0 
        }, // Number of likes

        likes: [
            { 
                type: Schema.Types.ObjectId, 
                ref: "Like" 
            }
        ], // References to Like model

        replies: [
            { 
                type: Schema.Types.ObjectId, 
                ref: "Reply"  // 🔹 Ensure this correctly references the Reply model
            }
        ], // Array of replies
    },
    { 
        timestamps: true 
    } // Automatically adds createdAt & updatedAt
);

export const Comment = mongoose.model("Comment", commentSchema);
export {commentSchema}