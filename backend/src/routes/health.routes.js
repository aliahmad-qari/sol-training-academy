import { Router } from 'express';
import mongoose from 'mongoose';

const router = Router();

/**
 * GET /api/v1/health
 * Lightweight liveness/readiness probe for Render/Railway health checks.
 * Reports process uptime and MongoDB connection state.
 */
router.get('/', (req, res) => {
  const states = ['disconnected', 'connected', 'connecting', 'disconnecting'];
  const dbState = states[mongoose.connection.readyState] || 'unknown';

  res.status(200).json({
    success: true,
    message: 'Service healthy',
    data: {
      status: 'ok',
      uptime: Math.round(process.uptime()),
      db: dbState,
      env: process.env.NODE_ENV || 'development',
    },
  });
});

export default router;
