// tunnel.js
// This script creates public tunnels for the frontend (Vite dev server) and backend (Express API)
// using the 'localtunnel' package. It prints the generated URLs which work on any device/network.
// Run: npm run tunnel

import lt from 'localtunnel';

const FRONTEND_PORT = 5173; // Vite dev server
const BACKEND_PORT = 5000; // Express server

async function startTunnel(port, subdomainHint) {
  try {
    const tunnel = await lt({ port, subdomain: subdomainHint });
    console.log(`✅ Tunnel for port ${port} → ${tunnel.url}`);
    console.log(`   Share this URL on any device (mobile, PC) with any network.`);
    // Keep process alive while tunnel is open
    tunnel.on('close', () => {
      console.log(`❌ Tunnel on port ${port} closed`);
    });
    return tunnel;
  } catch (err) {
    console.error(`❌ Failed to create tunnel on port ${port}:`, err.message);
  }
}

(async () => {
  // Optionally provide a subdomain (if you have a paid localtunnel plan). Omit for random.
  const frontTunnel = await startTunnel(FRONTEND_PORT);
  const backTunnel = await startTunnel(BACKEND_PORT);
  // Keep the script running until manually stopped.
  // Press Ctrl+C to end.
})();
