# Use official Node.js runtime as base image
FROM node:18-alpine

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci --only=production

# Copy application code
COPY . .

# Create ian user
RUN addgroup -g 1001 -S ian && \
    adduser -S ian -u 1001

# Create directories for ian user
RUN mkdir -p /home/ian/.ian && \
    chown -R ian:ian /home/ian

# Switch to ian user
USER ian

# Set environment variables
ENV NODE_ENV=production

# Expose port (if running as server)
EXPOSE 3000

# Make CLI executable
RUN chmod +x bin/ian.js

# Default command
CMD ["node", "src/index.js"]