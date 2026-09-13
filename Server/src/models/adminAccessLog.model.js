import mongoose from "mongoose";

const adminAccessLogSchema = new mongoose.Schema(
  {
    adminId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    targetUserId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    photoId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Photo",
    },
    action: {
      type: String,
      enum: ["view_photo_list", "view_photo", "delete_photo", "view_user_stats"],
      required: true,
    },
    ip: String,
    userAgent: String,
  },
  { timestamps: true }
);

adminAccessLogSchema.index({ targetUserId: 1, createdAt: -1 });
adminAccessLogSchema.index({ adminId: 1, createdAt: -1 });

export default mongoose.model("AdminAccessLog", adminAccessLogSchema);
