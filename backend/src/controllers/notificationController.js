import {
  findNotificationsByUserId,
  markNotificationAsRead as markReadInDB,
  markAllNotificationsAsRead as markAllReadInDB,
  getUnreadNotificationCount,
} from '../repositories/notificationRepository.js';

// @desc    Get user notifications
// @route   GET /api/notifications
// @access  Private
export const getNotifications = async (req, res) => {
  try {
    const userId = req.user.id || req.user._id;

    const notifications = await findNotificationsByUserId(userId, { limit: 50 });
    const unreadCount = await getUnreadNotificationCount(userId);

    return res.json({
      success: true,
      unreadCount,
      notifications
    });
  } catch (error) {
    console.error('Get notifications error:', error);
    return res.status(500).json({ success: false, message: 'Failed to load notifications. Please try again later.' });
  }
};

// @desc    Mark a single notification as read
// @route   PATCH /api/notifications/:id/read
// @access  Private
export const markNotificationAsRead = async (req, res) => {
  try {
    const userId = req.user.id || req.user._id;
    const notification = await markReadInDB(req.params.id, userId);

    if (!notification) {
      return res.status(404).json({ success: false, message: 'Notification not found' });
    }

    const unreadCount = await getUnreadNotificationCount(userId);

    return res.json({ success: true, notification, unreadCount });
  } catch (error) {
    console.error('Mark notification read error:', error);
    return res.status(500).json({ success: false, message: 'Failed to update notification. Please try again later.' });
  }
};

// @desc    Mark all user notifications as read
// @route   PATCH /api/notifications/read-all
// @access  Private
export const markAllNotificationsAsRead = async (req, res) => {
  try {
    const userId = req.user.id || req.user._id;
    await markAllReadInDB(userId);

    return res.json({ success: true, message: 'All notifications marked as read', unreadCount: 0 });
  } catch (error) {
    console.error('Mark all notifications read error:', error);
    return res.status(500).json({ success: false, message: 'Failed to update notifications. Please try again later.' });
  }
};
