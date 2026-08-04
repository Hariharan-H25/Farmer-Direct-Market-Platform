# Backend Dockerfile – Multi-stage Node 20 Alpine build
# Stage 1: Install production dependencies only
FROM node:20-alpine AS deps

WORKDIR /app

# Copy package files first for layer caching
COPY package*.json ./

# Install only production dependencies (no devDeps)
RUN npm ci --omit=dev

# Stage 2: Final runtime image
FROM node:20-alpine AS runner

WORKDIR /app

# Install dumb-init for proper signal handling in containers
RUN apk add --no-cache dumb-init

# Create uploads directory (product images)
RUN mkdir -p uploads logs

# Copy production node_modules from deps stage
COPY --from=deps /app/node_modules ./node_modules

# Copy source code (all backend files)
COPY . .

# Non-root user for security
RUN addgroup --system farmconnect && adduser --system --ingroup farmconnect farmapp
RUN chown -R farmapp:farmconnect /app
USER farmapp

# Expose backend port
EXPOSE 5000

# Health check — hits /health every 30s
HEALTHCHECK --interval=30s --timeout=10s --start-period=30s --retries=3 \
  CMD wget -qO- http://localhost:5000/health || exit 1

# Use dumb-init as PID 1 to handle signals properly
ENTRYPOINT ["dumb-init", "--"]
CMD ["node", "server.js"]
