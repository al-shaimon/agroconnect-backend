import User from '../auth/auth.model.js';
import {
  notifyVerificationApproved,
  notifyVerificationRejected,
} from '../../../utils/notificationHelper.js';

// @desc    Get all pending verifications
// @route   GET /api/admin/verifications/pending
// @access  Private/Admin
export const getPendingVerifications = async (req, res) => {
  try {
    const pendingUsers = await User.find({
      verificationStatus: 'pending',
      role: { $in: ['farmer', 'buyer'] },
    }).select('-password');

    res.status(200).json({
      success: true,
      count: pendingUsers.length,
      data: pendingUsers,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Get all verifications (all statuses)
// @route   GET /api/admin/verifications
// @access  Private/Admin
export const getAllVerifications = async (req, res) => {
  try {
    const { status, role, page = 1, limit = 10 } = req.query;

    const query = { role: { $in: ['farmer', 'buyer'] } };

    if (status) {
      query.verificationStatus = status;
    }

    if (role) {
      query.role = role;
    }

    const skip = (page - 1) * limit;

    const users = await User.find(query)
      .select('-password')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await User.countDocuments(query);

    res.status(200).json({
      success: true,
      count: users.length,
      total,
      page: parseInt(page),
      pages: Math.ceil(total / limit),
      data: users,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Get verification details
// @route   GET /api/admin/verifications/:id
// @access  Private/Admin
export const getVerificationDetails = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    res.status(200).json({
      success: true,
      data: user,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Approve verification
// @route   PUT /api/admin/verifications/:id/approve
// @access  Private/Admin
export const approveVerification = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    user.verificationStatus = 'approved';
    user.isVerified = true;
    user.rejectionReason = undefined;

    await user.save();

    // Get Socket.IO instance and connected users
    const io = req.app.get('io');
    const connectedUsers = req.app.get('connectedUsers');

    // Send notification and email to user
    await notifyVerificationApproved(user._id, user.name, io, connectedUsers).catch((err) =>
      console.error('Error notifying user:', err)
    );

    res.status(200).json({
      success: true,
      message: 'User verification approved successfully',
      data: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        verificationStatus: user.verificationStatus,
        isVerified: user.isVerified,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Reject verification
// @route   PUT /api/admin/verifications/:id/reject
// @access  Private/Admin
export const rejectVerification = async (req, res) => {
  try {
    const { reason } = req.body;

    if (!reason) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a rejection reason',
      });
    }

    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    user.verificationStatus = 'rejected';
    user.isVerified = false;
    user.rejectionReason = reason;

    await user.save();

    // Get Socket.IO instance and connected users
    const io = req.app.get('io');
    const connectedUsers = req.app.get('connectedUsers');

    // Send notification and email to user
    await notifyVerificationRejected(user._id, user.name, reason, io, connectedUsers).catch((err) =>
      console.error('Error notifying user:', err)
    );

    res.status(200).json({
      success: true,
      message: 'User verification rejected',
      data: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        verificationStatus: user.verificationStatus,
        isVerified: user.isVerified,
        rejectionReason: user.rejectionReason,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Get verification statistics
// @route   GET /api/admin/verifications/stats
// @access  Private/Admin
export const getVerificationStats = async (req, res) => {
  try {
    const stats = await User.aggregate([
      {
        $match: {
          role: { $in: ['farmer', 'buyer'] },
        },
      },
      {
        $group: {
          _id: '$verificationStatus',
          count: { $sum: 1 },
        },
      },
    ]);

    const roleStats = await User.aggregate([
      {
        $match: {
          role: { $in: ['farmer', 'buyer'] },
        },
      },
      {
        $group: {
          _id: {
            role: '$role',
            verificationStatus: '$verificationStatus',
          },
          count: { $sum: 1 },
        },
      },
    ]);

    const formattedStats = {
      total: 0,
      pending: 0,
      approved: 0,
      rejected: 0,
    };

    stats.forEach((stat) => {
      if (stat._id) {
        formattedStats[stat._id] = stat.count;
        formattedStats.total += stat.count;
      }
    });

    const roleBreakdown = {
      farmer: { pending: 0, approved: 0, rejected: 0 },
      buyer: { pending: 0, approved: 0, rejected: 0 },
    };

    roleStats.forEach((stat) => {
      if (stat._id.role && stat._id.verificationStatus) {
        roleBreakdown[stat._id.role][stat._id.verificationStatus] = stat.count;
      }
    });

    res.status(200).json({
      success: true,
      data: {
        overall: formattedStats,
        byRole: roleBreakdown,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
