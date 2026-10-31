import { io } from 'socket.io-client';

// Vercel serverless functions do not host a persistent Socket.IO server.
// Production tracking therefore uses the authenticated polling endpoint in Orders.jsx.
// Keep Socket.IO for local development only; never point production users at localhost.
const socket = import.meta.env.DEV
  ? io(import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000', {
      autoConnect: true,
      transports: ['websocket', 'polling']
    })
  : {
      emit: () => {},
      on: () => {},
      off: () => {},
      disconnect: () => {}
    };

export default socket;
