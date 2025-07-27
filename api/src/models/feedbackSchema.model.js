import mongoose, { Schema } from "mongoose";
import { commentSchema } from "./commentSchema.model.js";

const feedbackSchema = new Schema(
    {
        title: { 
            type: String, 
            required: true 
        },

        description: { 
            type: String, 
            required: true 
        },

        status: {
            type: String,
            enum: ["open", "in-progress", "resolved", "closed"],
            default: "open",
        },

        openedBy: { 
            type: Schema.Types.ObjectId, 
            ref: "User", 
            required: true 
        },

        service: { 
            type: Schema.Types.ObjectId, 
            ref: "Service", 
            required: true 
        },

        comments: [{ 
            type: Schema.Types.ObjectId, 
            ref: "Comment" 
        }],

        upvotes: { 
            type: Number, 
            default: 0 
        },

        downvotes: { 
            type: Number, 
            default: 0 
        },

        netVotes: { 
            type: Number, 
            default: 0 
        }
    },
    { 
        timestamps: true 
    }
);

export const Feedback = mongoose.model("Feedback", feedbackSchema);
