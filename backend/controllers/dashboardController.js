import { User } from "../models/userModel.js";
import { Event } from "../models/eventModel.js";
import { Booking } from "../models/bookingModel.js";
import { Campaign } from "../models/campaignModel.js";
import { Payment } from "../models/paymentModel.js";
import { differenceInYears } from "date-fns";

export const getDashboardKPIs = async (req, res) => {
  try {
    const [totalUsers, activeUsers, totalEvents] = await Promise.all([
      User.countDocuments(),
      User.countDocuments({
        lastActivity: { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) },
      }),
      Event.countDocuments(),
    ]);

    const ticketsResult = await Booking.aggregate([
      { $group: { _id: null, total: { $sum: "$quantity" } } },
    ]);

    const revenueResult = await Booking.aggregate([
      { $group: { _id: null, total: { $sum: "$totalPaid" } } },
    ]);

    const pendingResult = await Booking.aggregate([
      { $match: { paymentStatus: "pending" } },
      { $group: { _id: null, total: { $sum: "$totalPaid" } } },
    ]);

    let campaignsRunning = 0;
    try {
      campaignsRunning = await Campaign.countDocuments({ status: "running" });
    } catch {
      // Optional: Skip if Campaign model doesn't exist yet
    }

    const ticketsSold = ticketsResult[0]?.total || 0;
    const totalRevenue = revenueResult[0]?.total || 0;
    const pendingPayments = pendingResult[0]?.total || 0;

    const kpis = {
      totalUsers,
      activeUsers,
      totalEvents,
      ticketsSold,
      totalRevenue,
      pendingPayments,
      campaignsRunning,
      conversionRate: (ticketsSold / Math.max(totalUsers, 1)) * 100,
    };

    res.status(200).json(kpis);
  } catch (err) {
    console.error("❌ KPI Fetch Error:", err);
    res.status(500).json({ error: "Failed to fetch dashboard KPIs" });
  }
};

export const getRecentData = async (req, res) => {
  try {
    // Fetch 5 latest users
    const recentUsers = await User.find()
      .sort({ createdAt: -1 })
      .limit(5)
      .select("firstName lastName email createdAt");

    // Fetch 5 latest bookings with user info
    const recentBookings = await Booking.find()
      .sort({ createdAt: -1 })
      .limit(5)
      .populate("user", "firstName lastName email")
      .select("bookingId eventName totalPaid bookedDate createdAt");

    return res.status(200).json({
      recentUsers,
      recentBookings,
    });
  } catch (err) {
    console.error("❌ Recent Fetch Error:", err);
    res.status(500).json({ error: "Failed to fetch recent data" });
  }
};

export const getTopEvents = async (req, res) => {
  try {
    const aggregation = await Booking.aggregate([
      {
        $group: {
          _id: "$eventName",
          ticketsSold: { $sum: "$quantity" },
          totalRevenue: { $sum: "$totalPaid" },
        },
      },
    ]);

    // Sort by tickets sold (descending)
    const topByTickets = [...aggregation]
      .sort((a, b) => b.ticketsSold - a.ticketsSold)
      .slice(0, 5);

    // Sort by revenue (descending)
    const topByRevenue = [...aggregation]
      .sort((a, b) => b.totalRevenue - a.totalRevenue)
      .slice(0, 5);

    res.status(200).json({
      topByTickets,
      topByRevenue,
    });
  } catch (error) {
    console.error("❌ Failed to fetch top events:", error);
    res.status(500).json({ error: "Failed to fetch top events" });
  }
};

// 🧮 Spender Insights Controller
export const getSpenderInsights = async (req, res) => {
  try {
    // 🔝 Top Paying User
    const topUser = await User.findOne()
      .sort({ totalSpent: -1 })
      .select("firstName lastName email totalSpent city");

    // 🏙️ Top Cities by Revenue
    const topCities = await User.aggregate([
      {
        $group: {
          _id: "$city",
          totalSpent: { $sum: "$totalSpent" },
          users: { $sum: 1 },
        },
      },
      { $sort: { totalSpent: -1 } },
      { $limit: 5 },
    ]);

    res.status(200).json({
      topUser,
      topCities,
    });
  } catch (err) {
    console.error("❌ getSpenderInsights error:", err);
    res.status(500).json({ error: "Failed to fetch spender insights" });
  }
};

export const getTrendsData = async (req, res) => {
  try {
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 5);
    sixMonthsAgo.setDate(1); // Start of the month

    const trends = await Booking.aggregate([
      {
        $match: {
          createdAt: { $gte: sixMonthsAgo },
        },
      },
      {
        $group: {
          _id: {
            month: { $month: "$createdAt" },
            year: { $year: "$createdAt" },
          },
          bookings: { $sum: 1 },
          tickets: { $sum: "$quantity" },
          revenue: { $sum: "$totalPaid" },
        },
      },
      {
        $sort: {
          "_id.year": 1,
          "_id.month": 1,
        },
      },
    ]);

    // Convert month numbers to names
    const result = trends.map((t) => {
      const date = new Date(t._id.year, t._id.month - 1);
      const month = date.toLocaleString("default", { month: "short" });
      return {
        month,
        bookings: t.bookings,
        tickets: t.tickets,
        revenue: t.revenue,
      };
    });

    res.json(result);
  } catch (err) {
    console.error("📉 Trend Fetch Error:", err);
    res.status(500).json({ error: "Failed to fetch trend data" });
  }
};

// controllers/dashboardController.js

export const getSegmentsOverview = async (req, res) => {
  try {
    const [byCity, byGender, marketingOptIn, activeCount] = await Promise.all([
      User.aggregate([
        { $match: { city: { $ne: null } } },
        { $group: { _id: "$city", count: { $sum: 1 } } },
        { $sort: { count: -1 } },
        { $limit: 5 },
      ]),
      User.aggregate([
        { $match: { gender: { $ne: null } } },
        { $group: { _id: "$gender", count: { $sum: 1 } } },
      ]),
      User.aggregate([
        {
          $group: {
            _id: "$marketingOptIn",
            count: { $sum: 1 },
          },
        },
      ]),
      User.countDocuments({
        lastActivity: { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) },
      }),
    ]);

    const grouped = byGender.reduce((acc, item) => {
  const key = item._id.charAt(0).toUpperCase() + item._id.slice(1).toLowerCase();
  acc[key] = (acc[key] || 0) + item.count;
  return acc;
}, {});

const result = Object.entries(grouped).map(([key, count]) => ({
  _id: key,
  count
}));

    res.json({
      byCity,
      byGender:result,
      marketingOptIn,
      activeUsers: activeCount,
    });
  } catch (err) {
    console.error("❌ Segment Fetch Error:", err);
    res.status(500).json({ error: "Failed to fetch segments" });
  }
};

export const getFunnelData = async (req, res) => {
  try {
    const [totalUsers, usersWithBookings, usersWithPayments] =
      await Promise.all([
        User.countDocuments(),
        Booking.distinct("user"),
        Payment.distinct("user"),
      ]);

    const funnel = {
      totalUsers,
      withBookings: usersWithBookings.length,
      withPayments: usersWithPayments.length,
    };

    res.json(funnel);
  } catch (err) {
    console.error("❌ Funnel Fetch Error:", err);
    res.status(500).json({ error: "Failed to fetch funnel data" });
  }
};

export const getAgeDistribution = async (req, res) => {
  try {
    const users = await User.find({ dob: { $exists: true, $ne: null } }).select(
      "dob"
    );

    const ageGroups = {
      "Under 18": 0,
      "18-24": 0,
      "25-34": 0,
      "35-44": 0,
      "45-54": 0,
      "55+": 0,
    };

    const today = new Date();

    users.forEach((user) => {
      const age = differenceInYears(today, new Date(user.dob));
      if (age < 18) ageGroups["Under 18"]++;
      else if (age <= 24) ageGroups["18-24"]++;
      else if (age <= 34) ageGroups["25-34"]++;
      else if (age <= 44) ageGroups["35-44"]++;
      else if (age <= 54) ageGroups["45-54"]++;
      else ageGroups["55+"]++;
    });

    res.json(ageGroups);
  } catch (err) {
    console.error("❌ Age Distribution Error:", err);
    res.status(500).json({ error: "Failed to calculate age distribution" });
  }
};
