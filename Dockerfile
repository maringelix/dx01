# Multi-stage build for production-ready fullstack app.
#
# Base image pinned to a specific digest. Bumped from node:18-alpine
# (EOL April 2025) to node:20 LTS (active maintenance until April 2026).
FROM node:20.11.0-alpine3.19@sha256:2f46fd49c767554c089a5eb219115313b72748d8f62f5eccb58ef52bc36db4ad AS builder

WORKDIR /app

# Copy package files
COPY package*.json ./
COPY server/package*.json ./server/
COPY client/package*.json ./client/

# Install dependencies
RUN npm install --omit=dev && \
    cd server && npm install --omit=dev && \
    cd ../client && npm install

# Copy source code
COPY . .

# Build frontend
RUN cd client && npm run build

# Production stage (same pinned digest as builder).
FROM node:20.11.0-alpine3.19@sha256:2f46fd49c767554c089a5eb219115313b72748d8f62f5eccb58ef52bc36db4ad

WORKDIR /app

# Install nginx and wget for serving frontend and proxying backend
RUN apk add --no-cache nginx wget

# Copy backend files
COPY --from=builder /app/server ./server
COPY --from=builder /app/server/node_modules ./server/node_modules

# Copy built frontend
COPY --from=builder /app/client/dist ./client/dist

# Copy nginx configuration
COPY docker/nginx.conf /etc/nginx/nginx.conf
COPY docker/default.conf /etc/nginx/http.d/default.conf

# Create nginx directories
RUN mkdir -p /run/nginx /var/log/nginx && \
    chown -R node:node /run/nginx /var/log/nginx /app

# Expose ports
EXPOSE 80

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=10s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost/health || exit 1

# Start script
COPY docker/start.sh /start.sh
RUN chmod +x /start.sh

CMD ["/start.sh"]
