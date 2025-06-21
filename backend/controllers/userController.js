
import { User } from "../models/userModel.js";
import { Booking } from "../models/bookingModel.js";
import { Event } from "../models/eventModel.js";


export const importCSVData = async (req, res) => {
  try {
    const data = JSON.parse(req.body.data);
    const importType = req.body.importType || 'lead';
    const mode = req.body.mode || 'live'; // 'live' or 'historical'

    if (!Array.isArray(data) || data.length === 0) {
      return res.status(400).json({ message: "Invalid or empty data" });
    }

    const bookings = [];
    const leads = [];

    for (const row of data) {
      const {
        firstName,
        lastName,
        email,
        dob,
        mobile,
        ticketType,
        eventName,
        eventDate,
        venue,
        ticketPrice,
        quantity
      } = row;

      if (!email) continue;

      // 1. Find or create user
      let user = await User.findOne({ email });
      if (!user) {
        user = await User.create({
          email,
          firstName,
          lastName,
          gender,
          dob,
          fullName: `${firstName} ${lastName}` || email.split("@")[0],
          mobile,
          totalSpent: 0
        });
      }

      // 2. If no eventName, treat as lead
      if (!eventName || eventName.trim() === '') {
        leads.push(user);
        continue;
      }

      // 3. Find event
      const event = await Event.findOne({
        eventName: new RegExp(`^${eventName.trim()}$`, "i"),
        venue: new RegExp(`^${(venue || "Unknown Venue").trim()}$`, "i")
      });

      if (!event) {
        console.warn(`Event not found: ${eventName}`);
        continue;
      }

      // 4. Find matching ticket type
      const ticket = event.ticketTypes.find(
        t => t.type.toLowerCase() === (ticketType || '').toLowerCase()
      );

      if (!ticket) {
        console.warn(`Ticket type '${ticketType}' not found in event '${eventName}'`);
        continue;
      }

      const qty = Number(quantity || 1);
      const price = parseFloat(ticketPrice || ticket.price || 0);
      const totalAmount = qty * price;

      // 5. In live mode, check availability
      if (mode === 'live') {
        if (ticket.quantity < qty) {
          console.warn(`Not enough ${ticketType} tickets for ${eventName}`);
          continue;
        }

        // Subtract from stock
        ticket.quantity -= qty;
        await event.save();
      }

      // 6. Update user's totalSpent
      await User.updateOne(
        { _id: user._id },
        { $inc: { totalSpent: totalAmount } }
      );

      // 7. Create booking
      bookings.push({
        user: user._id,
        event: event._id,
        ticketType,
        quantity: qty,
        bookingDate: eventDate ? new Date(eventDate) : new Date()
      });
    }

    let bookingResult = [];
    if (bookings.length > 0) {
      bookingResult = await Booking.insertMany(bookings);
    }

    return res.status(200).json({
      message: `Imported ${bookingResult.length} bookings (${mode} mode) and ${leads.length} leads.`,
      details: {
        bookingsCreated: bookingResult.length,
        leadsImported: leads.length,
        modeUsed: mode
      }
    });
  } catch (error) {
    console.error("Import Error:", error);
    res.status(500).json({
      message: "Import failed",
      error: error.message,
      stack: process.env.NODE_ENV === "development" ? error.stack : undefined
    });
  }
};




export const getAllUsers = async (req, res) => {
  try {
    const users = await User.find();

    const userIds = users.map((user) => user._id);

    const bookings = await Booking.find({ user: { $in: userIds } })
      .populate('event')
      .populate('user');

    const userMap = {};

    users.forEach(user => {
      userMap[user._id] = {
        ...user.toObject(),
        bookings: [],
        totalSpent: user.totalSpent || 0
      };
    });

    bookings.forEach(booking => {
      const userId = booking.user._id.toString();
      if (userMap[userId]) {
        userMap[userId].bookings.push(booking);
      }
    });

    const finalUsers = Object.values(userMap).map(user => {
      const eventIds = new Set();

      user.bookings.forEach(booking => {
        if (booking.event?._id) {
          eventIds.add(String(booking.event._id));
        }
      });

      return {
        ...user,
        totalUniqueEvents: eventIds.size,
        totalBookings: user.bookings.length
      };
    });

    return res.status(200).json({
      message: "Users fetched",
      users: finalUsers
    });

  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Internal server error" });
  }
};



export const getUserProfile = async (req, res) => {
  const id = req.params["id"];

  const user = await User.findById(id);

  const bookings = await Booking.find({ user: user._id });

  const uniqueEventIds = new Set(
    bookings.map((booking) => booking.event.toString())
  );
  const uniqueEventsBooked = uniqueEventIds.size;

  console.log(bookings);

  return res.status(200).json({
    user,
    bookings,
    uniqueEventsBooked,
  });
};
