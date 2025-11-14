# Build stage
FROM node:18-alpine AS builder
WORKDIR /app/server
COPY server/package*.json ./
RUN npm ci --only=production

# Runtime stage
FROM node:18-alpine
WORKDIR /app/server

# Install dumb-init to handle signals properly
RUN apk add --no-cache dumb-init

# Copy only production dependencies from builder
COPY --from=builder /app/server/node_modules ./node_modules

# Copy server code
COPY server .

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
  CMD node -e "require('http').get('http://localhost:5000/ping', (r) => {if (r.statusCode !== 200) throw new Error(r.statusCode)})"

# Expose port
EXPOSE 5000

# Use dumb-init to handle signals
ENTRYPOINT ["/sbin/dumb-init", "--"]

# Start the server
CMD ["node", "index.js"]
