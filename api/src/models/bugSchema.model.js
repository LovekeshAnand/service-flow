import mongoose, {Schema} from "mongoose";
import { commentSchema } from "./commentSchema.model.js";

const bugSchema = new Schema(
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
                required: true },

            comments: [
                {
                    type: Schema.Types.ObjectId,
                    ref: "Comment", // ✅ Ensure this is referencing "Comment"
                },
            ],
        },
        { 
            timestamps: true 
        }
);

export const Bug = mongoose.model("Bug", bugSchema)