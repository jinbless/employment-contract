# Multi-stage build

# Stage 1: Build Frontend
FROM node:20-alpine AS frontend-builder

WORKDIR /app/frontend

# Copy frontend files
COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build

# Stage 2: Production
FROM node:20-alpine AS production

WORKDIR /app

# Copy backend files
COPY server/package*.json ./server/
RUN cd server && npm ci --only=production

COPY server/ ./server/

# Copy built frontend
COPY --from=frontend-builder /app/frontend/dist ./dist

# Copy data files (legal XLSX, templates CSV)
COPY data/legal/*.xlsx ./data/legal/
COPY data/templates/*.csv ./data/templates/

# Environment
ENV NODE_ENV=production
ENV PORT=3002

EXPOSE 3002

# Start server
CMD ["node", "server/index.js"]
