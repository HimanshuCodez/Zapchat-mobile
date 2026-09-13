import User from "../models/user.model.js";
import Message from "../models/message.model.js";
import cloudinary from "../utils/cloudinary.js";
import { getReceiverSocketId, io } from "../utils/socket.js";

export const getUsersForSidebar = async (req, res) => {
  try {
    const loggedInUserId = req.user._id;
    const pinnedIds = new Set((req.user.pinnedUsers || []).map((id) => id.toString()));
    const filteredUsers = await User.find({ _id: { $ne: loggedInUserId } }).select("-password");

    const usersWithPinFlag = filteredUsers.map((user) => ({
      ...user.toObject(),
      isPinned: pinnedIds.has(user._id.toString()),
    }));

    res.status(200).json(usersWithPinFlag);
  } catch (error) {
    console.error("Error in getUsersForSidebar: ", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const togglePinChat = async (req, res) => {
  try {
    const { id } = req.params;
    const user = await User.findById(req.user._id);

    const index = user.pinnedUsers.findIndex((pinnedId) => pinnedId.toString() === id);
    if (index === -1) {
      user.pinnedUsers.push(id);
    } else {
      user.pinnedUsers.splice(index, 1);
    }

    await user.save();
    res.status(200).json({ isPinned: index === -1 });
  } catch (error) {
    console.log("Error in togglePinChat controller: ", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const getMessages = async (req, res) => {
  try {
    const { id: userToChatId } = req.params;
    const myId = req.user._id;

    const messages = await Message.find({
      $or: [
        { senderId: myId, receiverId: userToChatId },
        { senderId: userToChatId, receiverId: myId },
      ],
    });

    res.status(200).json(messages);
  } catch (error) {
    console.log("Error in getMessages controller: ", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const sendMessage = async (req, res) => {
  try {
    const { text, image } = req.body;
    const { id: receiverId } = req.params;
    const senderId = req.user._id;

    let imageUrl;
    if (image) {
      // Upload base64 image to cloudinary
      const uploadResponse = await cloudinary.uploader.upload(image);
      imageUrl = uploadResponse.secure_url;
    }

    const newMessage = new Message({
      senderId,
      receiverId,
      text,
      image: imageUrl,
    });

    await newMessage.save();

    const receiverSocketId = getReceiverSocketId(receiverId);
    if (receiverSocketId) {
      io.to(receiverSocketId).emit("newMessage", newMessage);
    }

    res.status(201).json(newMessage);
  } catch (error) {
    console.log("Error in sendMessage controller: ", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
};