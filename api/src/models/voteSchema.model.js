import mongoose, { Schema } from "mongoose";

const voteSchema = new Schema(
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
      enum: ["Feedback", "Issue"],
      required: true
    },
    voteType: {
      type: String,
      enum: ["upvote", "downvote"],
      required: true
    }
  },
  {
    timestamps: true
  }
);


voteSchema.index({ user: 1, targetId: 1, targetType: 1 }, { unique: true });

export const Vote = mongoose.model("Vote", voteSchema);