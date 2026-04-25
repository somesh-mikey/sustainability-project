# Backend Dockerfile for production
FROM node:18-alpine

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install production dependencies without requiring a lockfile
RUN npm install --omit=dev && npm cache clean --force

# Copy app code
COPY . .

# Create health check endpoint script
RUN echo '#!/bin/sh\ncurl -f http://localhost:${PORT:-5001}/health || exit 1' > /healthcheck.sh && chmod +x /healthcheck.sh

# Expose port
EXPOSE 5001

# Set environment variables
ENV NODE_ENV=production

# Start application
CMD ["node", "src/server.js"]
