import express from 'express';
import mongoose from 'mongoose';

const router = express.Router();

/**
 * @openapi
 * /health:
 *   get:
 *     summary: System Health Monitoring Endpoint
 *     description: Returns operational status, MongoDB connection state, uptime, memory usage, and version info.
 *     tags:
 *       - Monitoring
 *     responses:
 *       200:
 *         description: System operational
 *       503:
 *         description: Database disconnected or degraded
 */
router.get('/', (req, res) => {
  const dbState = mongoose.connection.readyState;
  const dbStatusMap = {
    0: 'disconnected',
    1: 'connected',
    2: 'connecting',
    3: 'disconnecting',
  };

  const isDbConnected = dbState === 1;
  const memoryUsage = process.memoryUsage();

  const healthData = {
    status: isDbConnected ? 'OK' : 'DEGRADED',
    timestamp: new Date().toISOString(),
    uptime: Math.floor(process.uptime()),
    database: dbStatusMap[dbState] || 'unknown',
    memory: {
      rssMB: Math.round((memoryUsage.rss / 1024 / 1024) * 100) / 100,
      heapTotalMB: Math.round((memoryUsage.heapTotal / 1024 / 1024) * 100) / 100,
      heapUsedMB: Math.round((memoryUsage.heapUsed / 1024 / 1024) * 100) / 100,
    },
    environment: process.env.NODE_ENV || 'development',
    version: '5.0.0',
  };

  if (!isDbConnected) {
    return res.status(503).json(healthData);
  }

  res.status(200).json(healthData);
});

export default router;
