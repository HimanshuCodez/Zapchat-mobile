import User from "../models/user.model.js";
import Photo from "../models/photo.model.js";
import { GALLERY_CONSENT_VERSION } from "../constants/gallery.js";
import {
  buildGalleryUploadSignature,
  destroyGalleryAsset,
  fetchUploadedAsset,
  proxyGalleryAsset,
  isOwnedPublicId,
} from "../utils/galleryStorage.js";

export const getConsentStatus = async (req, res) => {
  try {
    const user = req.user;
    const hasConsented = user.galleryBackupConsentVersion === GALLERY_CONSENT_VERSION;

    res.status(200).json({
      consentVersion: GALLERY_CONSENT_VERSION,
      hasConsented,
      consentedAt: user.galleryBackupConsentAt || null,
      backupEnabled: hasConsented && user.galleryBackupEnabled,
    });
  } catch (error) {
    console.log("Error in getConsentStatus controller:", error.message);
    res.status(500).json({ message: "Internal server error" });
  }
};

// This is the only way galleryBackupEnabled can become true - it requires an
// explicit user action, never triggered implicitly (e.g. on login/permission grant).
export const acceptConsentAndEnable = async (req, res) => {
  try {
    const updatedUser = await User.findByIdAndUpdate(
      req.user._id,
      {
        galleryBackupEnabled: true,
        galleryBackupConsentAt: new Date(),
        galleryBackupConsentVersion: GALLERY_CONSENT_VERSION,
      },
      { new: true }
    );

    res.status(200).json({
      consentVersion: GALLERY_CONSENT_VERSION,
      hasConsented: true,
      consentedAt: updatedUser.galleryBackupConsentAt,
      backupEnabled: true,
    });
  } catch (error) {
    console.log("Error in acceptConsentAndEnable controller:", error.message);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const disableBackup = async (req, res) => {
  try {
    await User.findByIdAndUpdate(req.user._id, { galleryBackupEnabled: false });
    res.status(200).json({ backupEnabled: false });
  } catch (error) {
    console.log("Error in disableBackup controller:", error.message);
    res.status(500).json({ message: "Internal server error" });
  }
};

const requireConsentedAndEnabled = (user) =>
  user.galleryBackupConsentVersion === GALLERY_CONSENT_VERSION && user.galleryBackupEnabled;

export const createUploadSignature = async (req, res) => {
  try {
    if (!requireConsentedAndEnabled(req.user)) {
      return res.status(403).json({ message: "Enable gallery backup and accept the disclosure first" });
    }

    const { resourceType } = req.body;
    const type = resourceType === "video" ? "video" : "image";

    const signaturePayload = buildGalleryUploadSignature({ userId: req.user._id.toString(), resourceType: type });
    res.status(200).json(signaturePayload);
  } catch (error) {
    console.log("Error in createUploadSignature controller:", error.message);
    res.status(500).json({ message: "Internal server error" });
  }
};

// Registers an asset the client already uploaded straight to Cloudinary.
// Never trusts client-reported metadata or an arbitrary publicId/url.
export const registerPhoto = async (req, res) => {
  try {
    if (!requireConsentedAndEnabled(req.user)) {
      return res.status(403).json({ message: "Enable gallery backup and accept the disclosure first" });
    }

    const { publicId, resourceType, localAssetId, takenAt, albumName } = req.body;
    const userId = req.user._id.toString();

    if (!publicId || !isOwnedPublicId(publicId, userId)) {
      return res.status(400).json({ message: "Invalid publicId" });
    }

    const type = resourceType === "video" ? "video" : "image";

    const existing = await Photo.findOne({ publicId });
    if (existing) {
      return res.status(200).json(existing);
    }

    let asset;
    try {
      asset = await fetchUploadedAsset(publicId, type);
    } catch (err) {
      return res.status(400).json({ message: "Uploaded asset could not be verified" });
    }

    const photo = await Photo.create({
      userId: req.user._id,
      publicId,
      resourceType: type,
      format: asset.format,
      bytes: asset.bytes,
      width: asset.width,
      height: asset.height,
      albumName: albumName || undefined,
      localAssetId: localAssetId || undefined,
      takenAt: takenAt ? new Date(takenAt) : undefined,
    });

    res.status(201).json(photo);
  } catch (error) {
    console.log("Error in registerPhoto controller:", error.message);
    res.status(500).json({ message: "Internal server error" });
  }
};

const toClientPhoto = (photo) => ({
  _id: photo._id,
  resourceType: photo.resourceType,
  format: photo.format,
  bytes: photo.bytes,
  width: photo.width,
  height: photo.height,
  albumName: photo.albumName,
  localAssetId: photo.localAssetId,
  takenAt: photo.takenAt,
  createdAt: photo.createdAt,
  contentPath: `/gallery/photos/${photo._id}/content`,
});

// Owner-only. Streams the asset from Cloudinary through our server so access
// always re-checks ownership - the path itself carries no standalone access.
export const getMyPhotoContent = async (req, res) => {
  try {
    const photo = await Photo.findOne({ _id: req.params.id, userId: req.user._id });
    if (!photo) {
      return res.status(404).json({ message: "Photo not found" });
    }

    proxyGalleryAsset(photo.publicId, { resourceType: photo.resourceType, thumbnail: req.query.variant !== "full" }, res);
  } catch (error) {
    console.log("Error in getMyPhotoContent controller:", error.message);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const listMyPhotos = async (req, res) => {
  try {
    const page = Math.max(parseInt(req.query.page, 10) || 1, 1);
    const limit = Math.min(Math.max(parseInt(req.query.limit, 10) || 60, 1), 100);

    const [photos, total] = await Promise.all([
      Photo.find({ userId: req.user._id })
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit),
      Photo.countDocuments({ userId: req.user._id }),
    ]);

    res.status(200).json({
      photos: photos.map(toClientPhoto),
      page,
      limit,
      total,
      hasMore: page * limit < total,
    });
  } catch (error) {
    console.log("Error in listMyPhotos controller:", error.message);
    res.status(500).json({ message: "Internal server error" });
  }
};

// Lets the client dedupe on resume/re-run without re-fetching full metadata
// for every already-backed-up asset.
export const listBackedUpAssetIds = async (req, res) => {
  try {
    const ids = await Photo.find({ userId: req.user._id, localAssetId: { $ne: null } }).distinct("localAssetId");
    res.status(200).json({ ids });
  } catch (error) {
    console.log("Error in listBackedUpAssetIds controller:", error.message);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const getMyBackupStats = async (req, res) => {
  try {
    const [result] = await Photo.aggregate([
      { $match: { userId: req.user._id } },
      { $group: { _id: null, count: { $sum: 1 }, totalBytes: { $sum: "$bytes" } } },
    ]);

    res.status(200).json({
      count: result?.count || 0,
      totalBytes: result?.totalBytes || 0,
      backupEnabled: req.user.galleryBackupEnabled,
    });
  } catch (error) {
    console.log("Error in getMyBackupStats controller:", error.message);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const deleteMyPhoto = async (req, res) => {
  try {
    const photo = await Photo.findOne({ _id: req.params.id, userId: req.user._id });
    if (!photo) {
      return res.status(404).json({ message: "Photo not found" });
    }

    await destroyGalleryAsset(photo.publicId, photo.resourceType);
    await photo.deleteOne();

    res.status(200).json({ success: true });
  } catch (error) {
    console.log("Error in deleteMyPhoto controller:", error.message);
    res.status(500).json({ message: "Internal server error" });
  }
};
