import mongoose, { Schema } from "mongoose";

const serviceVoteSchema = new Schema(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true
    },
    service: {
      type: Schema.Types.ObjectId,
      ref: "Service",
      required: true
    }
  },
  {
    timestamps: true
  }
);

serviceVoteSchema.index({ user: 1, service: 1 }, { unique: true });

export const ServiceVote = mongoose.model("ServiceVote", serviceVoteSchema);