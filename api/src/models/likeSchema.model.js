import mongoose, { Schema } from "mongoose";

const likeSchema = new Schema(
    {
        user: { 
            type: Schema.Types.ObjectId, 
            ref: "User", 
            required: true 
        }, 

        targetId: { 
            type: Schema.Types.ObjectId,
            required: true 
        }, 

        targetType: {
            type: String,
            enum: ["Comment", "Reply"], 
            required: true,
        },
    },
    { 
        timestamps: true 
    }
);

export const Like = mongoose.model("Like", likeSchema);
