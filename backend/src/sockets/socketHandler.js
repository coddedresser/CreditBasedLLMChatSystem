const { verifyToken } = require('../config/jwt');
const Notification = require('../models/Notification');

const connectedUsers = new Map();

const initializeSocket = (io) => {
  io.on('connection', (socket) => {
    console.log('New socket connection:', socket.id);

    // Authenticate socket connection
    socket.on('authenticate', async (token) => {
      try {
        const decoded = verifyToken(token);
        if (decoded) {
          socket.userId = decoded.id;
          connectedUsers.set(decoded.id, socket.id);
          socket.emit('authenticated', { userId: decoded.id });
          console.log(`User ${decoded.id} authenticated`);

          // Send unread notifications count
          const unreadCount = await Notification.getUnreadCount(decoded.id);
          socket.emit('unread_count', { count: unreadCount });
        } else {
          socket.emit('authentication_error', { error: 'Invalid token' });
        }
      } catch (error) {
        console.error('Authentication error:', error);
        socket.emit('authentication_error', { error: 'Authentication failed' });
      }
    });

    // Handle disconnection
    socket.on('disconnect', () => {
      if (socket.userId) {
        connectedUsers.delete(socket.userId);
        console.log(`User ${socket.userId} disconnected`);
      }
    });
  });

  // Global notification handler
  global.sendNotification = async (userId, notification) => {
    const socketId = connectedUsers.get(userId);
    if (socketId) {
      io.to(socketId).emit('notification', notification);
    }
  };

  // Broadcast to all users
  global.broadcastNotification = async (notification) => {
    io.emit('notification', notification);
  };

  console.log('Socket.IO initialized successfully');
};

module.exports = { initializeSocket };