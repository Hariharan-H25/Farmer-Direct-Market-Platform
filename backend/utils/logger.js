import winston from 'winston';
import fs from 'fs';
import path from 'path';

const isServerless = Boolean(process.env.VERCEL || process.env.AWS_LAMBDA_FUNCTION_NAME || process.env.NODE_ENV === 'production');

const transports = [
  new winston.transports.Console({
    format: winston.format.combine(
      winston.format.colorize(),
      winston.format.printf(({ level, message, timestamp, stack }) => {
        return `${timestamp || new Date().toISOString()} [${level}]: ${stack || message}`;
      })
    ),
  }),
];

// Only attempt file logging in non-serverless local dev environments
if (!isServerless) {
  try {
    const logDir = 'logs';
    if (!fs.existsSync(logDir)) {
      fs.mkdirSync(logDir, { recursive: true });
    }
    transports.push(
      new winston.transports.File({
        filename: path.join(logDir, 'error.log'),
        level: 'error',
        maxsize: 5242880, // 5MB
        maxFiles: 5,
      }),
      new winston.transports.File({
        filename: path.join(logDir, 'combined.log'),
        maxsize: 10485760, // 10MB
        maxFiles: 5,
      })
    );
  } catch (err) {
    // Silently fall back to console only if filesystem is read-only
    console.warn('File logging disabled (read-only or missing directory):', err.message);
  }
}

const customFormat = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  winston.format.errors({ stack: true }),
  winston.format.splat(),
  winston.format.json()
);

const logger = winston.createLogger({
  level: process.env.NODE_ENV === 'production' ? 'info' : 'debug',
  format: customFormat,
  defaultMeta: { service: 'farmconnect-backend' },
  transports,
});

logger.stream = {
  write: (message) => {
    logger.info(message.trim());
  },
};

export default logger;
