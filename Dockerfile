# Backend Dockerfile
FROM node:18-alpine

WORKDIR /app

COPY backend/package*.json ./

RUN apk add --no-cache python3 make g++ && npm install --build-from-source

COPY backend/ .

EXPOSE 3000

# Start the backend
CMD ["npm", "start"]