const Notification = require('../models/Notification');

exports.createNotification = async (userId, title, message, type = 'info') => {
  try {
    const notification = await Notification.create(userId, title, message, type);
    return notification;
  } catch (error) {
    console.error('Create notification error:', error);
    return null;
  }
};

exports.broadcastNotification = async (userIds, title, message, type = 'info') => {
  try {
    const notifications = await Promise.all(
      userIds.map(userId => Notification.create(userId, title, message, type))
    );
    return notifications;
  } catch (error) {
    console.error('Broadcast notification error:', error);
    return [];
  }
};