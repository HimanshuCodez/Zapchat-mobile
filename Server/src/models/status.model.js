import mongoose from "mongoose";

const statusSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    image: {
      type: String,
    },
    caption: {
      type: String,
    },
    backgroundColor: {
      type: String,
    },
    song: {
      id: String,
      title: String,
      artist: String,
      url: String,
    },
    viewers: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    expiresAt: {
      type: Date,
      required: true,
      default: () => new Date(Date.now() + 24 * 60 * 60 * 1000),
    },
  },
  { timestamps: true }
);

statusSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

export default mongoose.model("Status", statusSchema);
