import { createServer } from 'http';
import { Server } from 'socket.io';
import app from './src/app.js';
import connectDB from './src/config/db.js';
import { config } from './src/config/config.js';

// Connect to database
connectDB();

// Create HTTP server
const server = createServer(app);

// Initialize Socket.IO
const io = new Server(server, {
  cors: {
    origin: config.allowedOrigins,
    credentials: true,
  },
});

// Store connected users
const connectedUsers = new Map();

// Socket.IO connection handling
io.on('connection', (socket) => {
  console.log('🔌 New socket connection:', socket.id);

  // User joins with their ID
  socket.on('join', (userId) => {
    console.log(`👤 User ${userId} joined with socket ${socket.id}`);
    connectedUsers.set(userId, socket.id);
    socket.userId = userId;
  });

  // Handle disconnect
  socket.on('disconnect', () => {
    if (socket.userId) {
      console.log(`👤 User ${socket.userId} disconnected`);
      connectedUsers.delete(socket.userId);
    }
  });
});

// Make io and connectedUsers available globally
app.set('io', io);
app.set('connectedUsers', connectedUsers);

// Start server
const PORT = config.port;

server.listen(PORT, () => {
  console.log(`Server running in ${config.nodeEnv} mode on port ${PORT}`);
  console.log(`WebSocket server is ready`);
});
