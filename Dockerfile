# Backend Dockerfile
FROM node:18-alpine

WORKDIR /app

# Copy package files from backend folder
COPY backend/package*.json ./

# Install build dependencies for native modules (bcrypt, etc.)
RUN apk add --no-cache python3 make g++ && npm install --build-from-source

# Copy the rest of the backend application
COPY backend/ .

# Expose the backend port
EXPOSE 3000

# Start the backend
CMD ["npm", "start"]