import { randomUUID } from "crypto";
import https from "https";
import cloudinary from "./cloudinary.js";

export function galleryFolderFor(userId) {
  return `gallery-backups/${userId}`;
}

export function isOwnedPublicId(publicId, userId) {
  return typeof publicId === "string" && publicId.startsWith(`${galleryFolderFor(userId)}/`);
}

// The client never chooses its own public_id/folder - we mint it here so an
// uploaded asset can only ever land under the uploading user's own folder.
export function buildGalleryUploadSignature({ userId, resourceType = "image" }) {
  const folder = galleryFolderFor(userId);
  const publicId = randomUUID();
  const timestamp = Math.round(Date.now() / 1000);

  const paramsToSign = {
    folder,
    public_id: publicId,
    timestamp,
    type: "authenticated",
  };

  const signature = cloudinary.utils.api_sign_request(paramsToSign, process.env.CLOUDINARY_API_SECRET);

  return {
    signature,
    timestamp,
    apiKey: process.env.CLOUDINARY_API_KEY,
    cloudName: process.env.CLOUDINARY_CLOUD_NAME,
    folder,
    publicId,
    fullPublicId: `${folder}/${publicId}`,
    uploadUrl: `https://api.cloudinary.com/v1_1/${process.env.CLOUDINARY_CLOUD_NAME}/${resourceType}/upload`,
    type: "authenticated",
  };
}

// Source of truth for what actually landed in storage - never trust
// client-reported size/dimensions for an asset we're about to register.
export async function fetchUploadedAsset(publicId, resourceType) {
  return cloudinary.api.resource(publicId, { type: "authenticated", resource_type: resourceType });
}

// A signed Cloudinary delivery URL for a private/authenticated asset. This is
// never returned to the client - it's fetched server-side only, inside
// proxyGalleryAsset - so it doesn't need to expire on its own. Real access
// control (auth + ownership/admin check + audit log) happens on every hit of
// our own /content route below, not on possession of this URL.
function buildOriginUrl(publicId, { resourceType = "image", thumbnail = false } = {}) {
  const options = {
    type: "authenticated",
    resource_type: resourceType,
    secure: true,
    sign_url: true,
  };

  if (thumbnail) {
    options.transformation = [{ width: 400, height: 400, crop: "thumb", gravity: "auto" }];
  }

  return cloudinary.url(publicId, options);
}

// Streams the asset through our own server instead of redirecting the client
// to Cloudinary, so every single view re-runs our auth/ownership/admin checks
// and (for admin views) the audit log - no long-lived or expiring link that
// could leak and be replayed after access should have been revoked.
export function proxyGalleryAsset(publicId, { resourceType = "image", thumbnail = false } = {}, res) {
  const url = buildOriginUrl(publicId, { resourceType, thumbnail });

  https
    .get(url, (upstream) => {
      if (!upstream.statusCode || upstream.statusCode >= 400) {
        upstream.resume();
        res.status(502).json({ message: "Could not load asset" });
        return;
      }

      res.setHeader("Content-Type", upstream.headers["content-type"] || "application/octet-stream");
      res.setHeader("Cache-Control", "private, max-age=120");
      upstream.pipe(res);
    })
    .on("error", (err) => {
      console.log("proxyGalleryAsset error:", err.message);
      if (!res.headersSent) {
        res.status(502).json({ message: "Could not load asset" });
      }
    });
}

export async function destroyGalleryAsset(publicId, resourceType) {
  return cloudinary.uploader.destroy(publicId, { type: "authenticated", resource_type: resourceType });
}
