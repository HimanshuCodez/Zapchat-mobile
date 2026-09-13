import Status from "../models/status.model.js";
import cloudinary from "../utils/cloudinary.js";
import { io } from "../utils/socket.js";

export const getStatuses = async (req, res) => {
  try {
    const myId = req.user._id;
    const statuses = await Status.find({ expiresAt: { $gt: new Date() } })
      .sort({ createdAt: 1 })
      .populate("userId", "fullname profilePic");

    const grouped = new Map();
    for (const status of statuses) {
      const uid = status.userId._id.toString();
      if (!grouped.has(uid)) {
        grouped.set(uid, { user: status.userId, statuses: [] });
      }
      grouped.get(uid).statuses.push({
        _id: status._id,
        image: status.image,
        caption: status.caption,
        backgroundColor: status.backgroundColor,
        song: status.song,
        createdAt: status.createdAt,
        viewedByMe: status.viewers.some((v) => v.toString() === myId.toString()),
      });
    }

    res.status(200).json(Array.from(grouped.values()));
  } catch (error) {
    console.log("Error in getStatuses controller: ", error.message);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const createStatus = async (req, res) => {
  try {
    const { image, caption, backgroundColor, song } = req.body;
    const userId = req.user._id;

    if (!image && !caption) {
      return res.status(400).json({ message: "Add a photo or caption for your status" });
    }

    let imageUrl;
    if (image) {
      const uploadResponse = await cloudinary.uploader.upload(image);
      imageUrl = uploadResponse.secure_url;
    }

    const newStatus = new Status({
      userId,
      image: imageUrl,
      caption,
      backgroundColor,
      song,
    });

    await newStatus.save();
    await newStatus.populate("userId", "fullname profilePic");

    io.emit("newStatus", {
      user: newStatus.userId,
      status: {
        _id: newStatus._id,
        image: newStatus.image,
        caption: newStatus.caption,
        backgroundColor: newStatus.backgroundColor,
        song: newStatus.song,
        createdAt: newStatus.createdAt,
        viewedByMe: false,
      },
    });

    res.status(201).json(newStatus);
  } catch (error) {
    console.log("Error in createStatus controller: ", error.message);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const viewStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user._id;

    const status = await Status.findById(id);
    if (!status) {
      return res.status(404).json({ message: "Status not found" });
    }

    const alreadyViewed = status.viewers.some((v) => v.toString() === userId.toString());
    if (status.userId.toString() !== userId.toString() && !alreadyViewed) {
      status.viewers.push(userId);
      await status.save();
    }

    res.status(200).json({ message: "Status viewed" });
  } catch (error) {
    console.log("Error in viewStatus controller: ", error.message);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const deleteStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user._id;

    const status = await Status.findById(id);
    if (!status) {
      return res.status(404).json({ message: "Status not found" });
    }

    if (status.userId.toString() !== userId.toString()) {
      return res.status(403).json({ message: "You can only delete your own status" });
    }

    await status.deleteOne();
    io.emit("statusDeleted", { statusId: id, userId: status.userId.toString() });

    res.status(200).json({ message: "Status deleted" });
  } catch (error) {
    console.log("Error in deleteStatus controller: ", error.message);
    res.status(500).json({ message: "Internal server error" });
  }
};
