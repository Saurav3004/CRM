import Drop from "../models/dropModel.js";
import Subscriber from "../models/subscriberModel.js";
import InstagramSubscriber from "../models/InstagramSubscriberModel.js";
import ScheduledMessage from "../models/scheduledMessageModel.js";
import mongoose from "mongoose";

export const getAllDrops = async (req, res) => {
  try {
    // Get all drops
    const drops = await Drop.find({}).lean();

    const result = await Promise.all(
      drops.map(async (drop) => {
        // Count email/form subscribers
        const normalCount = await Subscriber.countDocuments({ dropIds: drop._id });

        // Count instagram subscribers
        const instaCount = await InstagramSubscriber.countDocuments({
          "subscribedDrops.drop": drop._id,
        });

        // Get the scheduled message (if exists)
        const scheduledMsg = await ScheduledMessage.findOne({ drop: drop._id }).lean();

        return {
          _id: drop._id,
          name: drop.name,
          status: drop.status,
          createdAt: drop.createdAt,
          subscribersCount: normalCount + instaCount,
          channel: scheduledMsg?.channel || null,
          scheduledAt: scheduledMsg?.scheduledAt || null,
        };
      })
    );

    res.status(200).json(result);
  } catch (error) {
    console.error("❌ Error in getAllDrops:", error);
    res.status(500).json({ message: "Server error" });
  }
};


export const getDropWithId = async (req, res) => {
  const { id } = req.params;

  // Validate ID
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({ error: 'Invalid Drop ID' });
  }

  try {
    // Directly fetch drop without populate
    const drop = await Drop.findById(id).lean();

    if (!drop) {
      return res.status(404).json({ error: 'Drop not found' });
    }

    // Count subscribers linked to this drop
    const subscribersCount = await Subscriber.countDocuments({
      subscribedDrops: id
    });

    return res.status(200).json({
      ...drop,
      subscribersCount
    });
  } catch (err) {
    console.error('[❌ Error fetching drop]:', err);
    return res.status(500).json({ error: 'Something went wrong. Please try again later.' });
  }
};

export const getMessagesByDropId = async (req, res) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({ error: 'Invalid drop ID' });
  }

  try {
    const messages = await ScheduledMessage.find({ drop: id }).sort({ sendTime: -1 }).lean();

    if (!messages || messages.length === 0) {
      return res.status(200).json({ messages: [], message: 'No messages found for this drop.' });
    }

    res.status(200).json({ messages });
  } catch (err) {
    console.error('Error fetching scheduled messages for drop:', err);
    res.status(500).json({ error: 'Server error while fetching messages' });
  }
};

export const updateDrop = async (req, res) => {
  const { id } = req.params;
  const { name, description, status } = req.body;

  try {
    const updatedDrop = await Drop.findByIdAndUpdate(
      id,
      { name, description, status },
      { new: true }
    );

    if (!updatedDrop) {
      return res.status(404).json({ message: 'Drop not found' });
    }

    res.json(updatedDrop);
  } catch (err) {
    console.error('Update Drop Error:', err);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const addScheduleMessage = async (req, res) => {
  const { id: dropId } = req.params;
  const { channel, message, scheduledAt, status } = req.body;

  try {
    const newMessage = new ScheduledMessage({
      dropId,
      channel,
      message,
      scheduledAt,
      status: status || 'scheduled',
    });

    await newMessage.save();
    res.status(201).json({ message: 'Scheduled message created', data: newMessage });
  } catch (err) {
    console.error('Create Scheduled Message Error:', err);
    res.status(500).json({ message: 'Internal server error' });
  }
}


export const deleteDropHandler = async (req, res) => {
  try {
    const { dropId } = req.params;

    if (!dropId) {
      return res.status(400).json({ error: "Drop ID is required" });
    }

    // Check if drop exists
    const drop = await Drop.findById(dropId);
    if (!drop) {
      return res.status(404).json({ error: "Drop not found" });
    }

    // Delete associated scheduled messages
    await ScheduledMessage.deleteMany({ drop: dropId });

    // Delete the drop itself
    await Drop.findByIdAndDelete(dropId);

    res.status(200).json({ success: true, message: "Drop and related messages deleted successfully" });
  } catch (error) {
    console.error("❌ Error deleting drop:", error);
    res.status(500).json({ error: "Server error while deleting drop" });
  }
};
