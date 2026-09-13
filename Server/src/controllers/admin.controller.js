import User from "../models/user.model.js";
import Photo from "../models/photo.model.js";
import AdminAccessLog from "../models/adminAccessLog.model.js";
import { destroyGalleryAsset, proxyGalleryAsset } from "../utils/galleryStorage.js";

const logAdminAccess = ({ req, targetUserId, action, photoId }) =>
  AdminAccessLog.create({
    adminId: req.user._id,
    targetUserId,
    photoId,
    action,
    ip: req.ip,
    userAgent: req.headers["user-agent"],
  }).catch((err) => console.log("Failed to write admin access log:", err.message));

export const listUsers = async (req, res) => {
  try {
    const { q } = req.query;
    const filter = q
      ? { $or: [{ fullname: new RegExp(q, "i") }, { email: new RegExp(q, "i") }] }
      : {};

    const users = await User.find(filter).select("-password").sort({ fullname: 1 });

    const stats = await Photo.aggregate([
      { $group: { _id: "$userId", count: { $sum: 1 }, totalBytes: { $sum: "$bytes" } } },
    ]);
    const statsByUser = new Map(stats.map((s) => [s._id.toString(), s]));

    const usersWithStats = users.map((user) => {
      const userStats = statsByUser.get(user._id.toString());
      return {
        ...user.toObject(),
        backupPhotoCount: userStats?.count || 0,
        backupTotalBytes: userStats?.totalBytes || 0,
      };
    });

    res.status(200).json(usersWithStats);
  } catch (error) {
    console.log("Error in listUsers controller:", error.message);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const getGlobalStats = async (req, res) => {
  try {
    const [photoStats] = await Photo.aggregate([
      { $group: { _id: null, count: { $sum: 1 }, totalBytes: { $sum: "$bytes" } } },
    ]);
    const [userCount, backupEnabledCount] = await Promise.all([
      User.countDocuments({}),
      User.countDocuments({ galleryBackupEnabled: true }),
    ]);

    res.status(200).json({
      userCount,
      backupEnabledCount,
      photoCount: photoStats?.count || 0,
      totalBytes: photoStats?.totalBytes || 0,
    });
  } catch (error) {
    console.log("Error in getGlobalStats controller:", error.message);
    res.status(500).json({ message: "Internal server error" });
  }
};

const toAdminPhoto = (photo) => ({
  _id: photo._id,
  resourceType: photo.resourceType,
  format: photo.format,
  bytes: photo.bytes,
  width: photo.width,
  height: photo.height,
  albumName: photo.albumName,
  takenAt: photo.takenAt,
  createdAt: photo.createdAt,
  contentPath: `/admin/photos/${photo._id}/content`,
});

export const listUserPhotos = async (req, res) => {
  try {
    const { userId } = req.params;
    const { albumName } = req.query;
    const page = Math.max(parseInt(req.query.page, 10) || 1, 1);
    const limit = Math.min(Math.max(parseInt(req.query.limit, 10) || 60, 1), 100);

    const targetUser = await User.findById(userId).select("-password");
    if (!targetUser) {
      return res.status(404).json({ message: "User not found" });
    }

    const filter = { userId, ...(albumName ? { albumName } : {}) };

    const [photos, total] = await Promise.all([
      Photo.find(filter)
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit),
      Photo.countDocuments(filter),
    ]);

    await logAdminAccess({ req, targetUserId: userId, action: "view_photo_list" });

    res.status(200).json({
      user: targetUser,
      photos: photos.map(toAdminPhoto),
      page,
      limit,
      total,
      hasMore: page * limit < total,
    });
  } catch (error) {
    console.log("Error in listUserPhotos controller:", error.message);
    res.status(500).json({ message: "Internal server error" });
  }
};

// Streaming the full-resolution variant is treated as the actual "access"
// moment and is what gets audit-logged with who/whom/when. Thumbnail hits
// (grid browsing) are already covered by the view_photo_list log above.
export const getAdminPhotoContent = async (req, res) => {
  try {
    const photo = await Photo.findById(req.params.photoId);
    if (!photo) {
      return res.status(404).json({ message: "Photo not found" });
    }

    const isFull = req.query.variant === "full";
    if (isFull) {
      await logAdminAccess({
        req,
        targetUserId: photo.userId,
        action: "view_photo",
        photoId: photo._id,
      });
    }

    proxyGalleryAsset(photo.publicId, { resourceType: photo.resourceType, thumbnail: !isFull }, res);
  } catch (error) {
    console.log("Error in getAdminPhotoContent controller:", error.message);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const deleteUserPhoto = async (req, res) => {
  try {
    const photo = await Photo.findById(req.params.photoId);
    if (!photo) {
      return res.status(404).json({ message: "Photo not found" });
    }

    await destroyGalleryAsset(photo.publicId, photo.resourceType);
    const targetUserId = photo.userId;
    const photoId = photo._id;
    await photo.deleteOne();

    await logAdminAccess({ req, targetUserId, action: "delete_photo", photoId });

    res.status(200).json({ success: true });
  } catch (error) {
    console.log("Error in deleteUserPhoto controller:", error.message);
    res.status(500).json({ message: "Internal server error" });
  }
};
