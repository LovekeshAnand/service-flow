import mongoose, { Schema } from "mongoose";

const replySchema = new Schema(
    {
        user: {
            type: Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        message: {
            type: String,
            required: true,
        },
        likeCount: {
            type: Number,
            default: 0,
        },
        likes: [
            {
                type: Schema.Types.ObjectId,
                ref: "Like",
            },
        ],
    },
    { timestamps: true }
);

export const Reply = mongoose.model("Reply", replySchema);
