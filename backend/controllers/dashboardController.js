// controllers/dashboardController.js
import { User } from '../models/userModel.js';
import { Booking } from '../models/bookingModel.js';
import { Payment } from '../models/paymentModel.js';

export const getDashboardStats = async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const totalBookings = await Booking.countDocuments();

    const payments = await Payment.find({});
    const totalRevenue = payments.reduce((acc, p) => acc + (p.amount || 0), 0);

    const topSpenders = await User.find({})
      .sort({ totalSpent: -1 })
      .limit(5)
      .select('firstName lastName email totalSpent');

    const recentPayments = await Payment.find({})
      .sort({ transactionDate: -1 })
      .limit(5)
      .populate('user', 'firstName lastName')
      .select('amount transactionDate status currency');

    // Chart: Revenue Over Time
    const revenueMap = {};
    payments.forEach(p => {
      const month = new Date(p.transactionDate).toISOString().slice(0, 7); // yyyy-mm
      if (!revenueMap[month]) revenueMap[month] = 0;
      revenueMap[month] += p.amount || 0;
    });
    const revenueOverTime = Object.entries(revenueMap).map(([date, revenue]) => ({ date, revenue }));

    // Chart: Bookings Per Event
    const bookingCounts = await Booking.aggregate([
      { $group: { _id: "$eventName", bookings: { $sum: 1 } } }
    ]);
    const bookingsPerEvent = bookingCounts.map(b => ({ event: b._id, bookings: b.bookings }));

    // Chart: User Growth Per Month
    const userCounts = await User.aggregate([
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m", date: "$createdAt" } },
          users: { $sum: 1 }
        }
      },
      { $sort: { "_id": 1 } }
    ]);
    const userGrowth = userCounts.map(u => ({ month: u._id, users: u.users }));

    res.status(200).json({
      totalUsers,
      totalRevenue,
      totalBookings,
      topSpenders: topSpenders.map(u => ({
        name: `${u.firstName} ${u.lastName}`.trim(),
        email: u.email,
        spent: u.totalSpent,
      })),
      recentPayments: recentPayments.map(p => ({
        name: `${p.user?.firstName ?? ''} ${p.user?.lastName ?? ''}`.trim(),
        amount: p.amount,
        date: p.transactionDate,
        status: p.status,
        currency: p.currency
      })),
      chartData: {
        revenueOverTime,
        bookingsPerEvent,
        userGrowth
      }
    });

  } catch (err) {
    console.error('Dashboard stats error:', err);
    res.status(500).json({ message: 'Failed to fetch dashboard stats', error: err.message });
  }
};
