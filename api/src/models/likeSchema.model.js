import mongoose, { Schema } from "mongoose";

const likeSchema = new Schema(
    {
        user: { 
            type: Schema.Types.ObjectId, 
            ref: "User", 
            required: true 
        }, // User who liked

        targetId: { 
            type: Schema.Types.ObjectId,
            required: true 
        }, // Comment or Reply ID

        targetType: {
            type: String,
            enum: ["Comment", "Reply"], // Defines what is being liked
            required: true,
        },
    },
    { 
        timestamps: true 
    }
);

export const Like = mongoose.model("Like", likeSchema);
