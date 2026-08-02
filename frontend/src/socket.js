import { io } from 'socket.io-client';

// Shared singleton Socket.IO connection
const socket = io('http://localhost:5000', {
  autoConnect: true,
  transports: ['websocket', 'polling']
});

socket.on('connect', () => {
  console.log('⚡ Connected to real-time WebSockets server:', socket.id);
});

socket.on('disconnect', () => {
  console.log('🔥 Disconnected from WebSockets server');
});

export default socket;
