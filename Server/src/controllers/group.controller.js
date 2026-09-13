import Group from "../models/group.model.js";
import Message from "../models/message.model.js";
import cloudinary from "../utils/cloudinary.js";
import { getReceiverSocketId, io } from "../utils/socket.js";

function emitToMembers(memberIds, excludeUserId, event, payload) {
  memberIds.forEach((memberId) => {
    const id = memberId.toString();
    if (excludeUserId && id === excludeUserId.toString()) return;
    const socketId = getReceiverSocketId(id);
    if (socketId) {
      io.to(socketId).emit(event, payload);
    }
  });
}

export const createGroup = async (req, res) => {
  try {
    const { name, memberIds } = req.body;
    const creatorId = req.user._id;

    if (!name || !name.trim()) {
      return res.status(400).json({ error: "Group name is required" });
    }
    if (!Array.isArray(memberIds) || memberIds.length < 1) {
      return res.status(400).json({ error: "Select at least one member" });
    }

    const members = Array.from(new Set([...memberIds, creatorId.toString()]));

    const group = await Group.create({
      name: name.trim(),
      members,
      admins: [creatorId],
      createdBy: creatorId,
    });

    const populatedGroup = await Group.findById(group._id).populate("members", "-password");

    emitToMembers(members, creatorId, "newGroup", populatedGroup);

    res.status(201).json(populatedGroup);
  } catch (error) {
    console.log("Error in createGroup controller: ", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const getGroups = async (req, res) => {
  try {
    const groups = await Group.find({ members: req.user._id })
      .populate("members", "-password")
      .sort({ updatedAt: -1 });

    res.status(200).json(groups);
  } catch (error) {
    console.log("Error in getGroups controller: ", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const getGroupMessages = async (req, res) => {
  try {
    const { id: groupId } = req.params;
    const group = await Group.findById(groupId);

    if (!group || !group.members.some((memberId) => memberId.toString() === req.user._id.toString())) {
      return res.status(403).json({ error: "You are not a member of this group" });
    }

    const messages = await Message.find({ groupId }).sort({ createdAt: 1 });

    res.status(200).json(messages);
  } catch (error) {
    console.log("Error in getGroupMessages controller: ", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const sendGroupMessage = async (req, res) => {
  try {
    const { id: groupId } = req.params;
    const { text, image } = req.body;
    const senderId = req.user._id;

    const group = await Group.findById(groupId);
    if (!group || !group.members.some((memberId) => memberId.toString() === senderId.toString())) {
      return res.status(403).json({ error: "You are not a member of this group" });
    }

    let imageUrl;
    if (image) {
      const uploadResponse = await cloudinary.uploader.upload(image);
      imageUrl = uploadResponse.secure_url;
    }

    const newMessage = await Message.create({
      senderId,
      groupId,
      text,
      image: imageUrl,
    });

    emitToMembers(group.members, senderId, "newGroupMessage", newMessage);

    res.status(201).json(newMessage);
  } catch (error) {
    console.log("Error in sendGroupMessage controller: ", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const addGroupMembers = async (req, res) => {
  try {
    const { id: groupId } = req.params;
    const { memberIds } = req.body;
    const requesterId = req.user._id;

    const group = await Group.findById(groupId);
    if (!group) return res.status(404).json({ error: "Group not found" });
    if (!group.admins.some((adminId) => adminId.toString() === requesterId.toString())) {
      return res.status(403).json({ error: "Only admins can add members" });
    }

    const newMembers = (memberIds || []).filter(
      (id) => !group.members.some((memberId) => memberId.toString() === id)
    );
    group.members.push(...newMembers);
    await group.save();

    const populatedGroup = await Group.findById(group._id).populate("members", "-password");
    emitToMembers(group.members, null, "groupUpdated", populatedGroup);

    res.status(200).json(populatedGroup);
  } catch (error) {
    console.log("Error in addGroupMembers controller: ", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const removeGroupMember = async (req, res) => {
  try {
    const { id: groupId, memberId } = req.params;
    const requesterId = req.user._id;

    const group = await Group.findById(groupId);
    if (!group) return res.status(404).json({ error: "Group not found" });
    if (!group.admins.some((adminId) => adminId.toString() === requesterId.toString())) {
      return res.status(403).json({ error: "Only admins can remove members" });
    }

    const removedMembers = group.members.filter((m) => m.toString() !== memberId);
    group.members = group.members.filter((m) => m.toString() !== memberId);
    group.admins = group.admins.filter((a) => a.toString() !== memberId);
    await group.save();

    const populatedGroup = await Group.findById(group._id).populate("members", "-password");
    emitToMembers([...group.members, memberId], null, "groupUpdated", populatedGroup);

    res.status(200).json(populatedGroup);
  } catch (error) {
    console.log("Error in removeGroupMember controller: ", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const leaveGroup = async (req, res) => {
  try {
    const { id: groupId } = req.params;
    const userId = req.user._id;

    const group = await Group.findById(groupId);
    if (!group) return res.status(404).json({ error: "Group not found" });

    group.members = group.members.filter((m) => m.toString() !== userId.toString());
    group.admins = group.admins.filter((a) => a.toString() !== userId.toString());
    await group.save();

    emitToMembers([...group.members, userId], null, "groupUpdated", group);

    res.status(200).json({ success: true });
  } catch (error) {
    console.log("Error in leaveGroup controller: ", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
};
