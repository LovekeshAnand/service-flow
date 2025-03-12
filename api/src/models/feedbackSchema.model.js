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
        }], // Supports multiple comments

        upvotes: { 
            type: Number, 
            default: 0 
        }, // Total upvotes

        downvotes: { 
            type: Number, 
            default: 0 
        }, // Total downvotes

        netVotes: { 
            type: Number, 
            default: 0 
        } // Computed as upvotes - downvotes
    },
    { 
        timestamps: true 
    }
);

export const Feedback = mongoose.model("Feedback", feedbackSchema);
