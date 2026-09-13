import mongoose from "mongoose";

const photoSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    publicId: {
      type: String,
      required: true,
      unique: true,
    },
    resourceType: {
      type: String,
      enum: ["image", "video"],
      default: "image",
    },
    format: String,
    bytes: {
      type: Number,
      default: 0,
    },
    width: Number,
    height: Number,
    albumName: String,
    localAssetId: String,
    takenAt: Date,
  },
  { timestamps: true }
);

photoSchema.index({ userId: 1, createdAt: -1 });
photoSchema.index({ userId: 1, localAssetId: 1 });

export default mongoose.model("Photo", photoSchema);
