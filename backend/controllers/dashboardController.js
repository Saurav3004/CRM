// controllers/dashboardController.js
import { User } from '../models/userModel.js';
import { Booking } from '../models/bookingModel.js';
import { Payment } from '../models/paymentModel.js';

export const getDashboardStats = async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const totalBookings = await Booking.countDocuments();
    // const totalRevenueData = await Payment.aggregate([
    //   { $match: { status: 'Eventbrite Completed' } },
    //   { $group: { _id: null, total: { $sum: '$amount' } } }
    // ]);

    const totalAmount = await Payment.find()
    const totalRevenueData = totalAmount.map((total) => {
      return total.amount;
     
    }).reduce((prev,next) => {
      return prev + next
    },0)
    
    const totalRevenue = totalRevenueData

    const topSpenders = await User.find({})
      .sort({ totalSpent: -1 })
      .limit(5)
      .select('firstName lastName email totalSpent');

    const recentPayments = await Payment.find({})
      .sort({ transactionDate: -1 })
      .limit(5)
      .populate('user', 'firstName lastName')
      .select('amount transactionDate status currency');

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
        currency:p.currency
        
      }))

    });
  } catch (err) {
    console.error('Dashboard stats error:', err);
    res.status(500).json({ message: 'Failed to fetch dashboard stats' });
  }
};
