import ScheduledMessage from "../models/scheduledMessageModel.js";

export const scheduleMessageHandler = async (req,res) => {
     try {
    const { message, channel, scheduledAt } = req.body;
    const {dropId} = req.params

    if (!dropId || !message || !channel || !scheduledAt) {
      return res.status(400).json({ error: "All fields are required" });
    }

    const scheduledMessage = await ScheduledMessage.create({
      drop: dropId,
      message,
      channel,
      scheduledAt
    });

    res.status(201).json({
      success: true,
      message: "Message scheduled successfully",
      data: scheduledMessage
    });
  } catch (err) {
    console.error("❌ Schedule Error:", err);
    res.status(500).json({ error: "Server error" });
  }
}



export const deleteScheduledMessageHandler = async (req, res) => {
  try {
    const { id } = req.params;

    const message = await ScheduledMessage.findById(id);
    if (!message) {
      return res.status(404).json({ error: 'Scheduled message not found' });
    }

    await ScheduledMessage.findByIdAndDelete(id);

    res.status(200).json({ success: true, message: 'Scheduled message deleted successfully' });
  } catch (error) {
    console.error('Error deleting scheduled message:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

export const updateScheduledMessageHandler = async (req, res) => {
  try {
    const { id } = req.params;
    const { message, channel, scheduledAt } = req.body;

    const updatedMessage = await ScheduledMessage.findByIdAndUpdate(
      id,
      { message, channel, scheduledAt },
      { new: true }
    );

    if (!updatedMessage) {
      return res.status(404).json({ error: 'Scheduled message not found' });
    }

    res.status(200).json({
      success: true,
      message: 'Scheduled message updated successfully',
      data: updatedMessage
    });
  } catch (error) {
    console.error('Error updating scheduled message:', error);
    res.status(500).json({ error: 'Server error' });
  }
};
