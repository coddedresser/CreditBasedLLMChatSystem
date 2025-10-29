const app = require('./app');
const http = require('http');
const socketIO = require('socket.io');
const { initializeSocket } = require('./sockets/socketHandler');
require('dotenv').config(); // MUST be at the top
const PORT = process.env.PORT || 5000;
const server = http.createServer(app);

// Initialize Socket.IO
const io = socketIO(server, {
  cors: {
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    methods: ['GET', 'POST'],
    credentials: true
  }
});

initializeSocket(io);

server.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📡 Socket.IO initialized`);
});