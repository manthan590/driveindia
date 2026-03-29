FROM node:20.19-alpine

WORKDIR /app

# Copy backend
COPY backend/package*.json ./backend/
RUN cd backend && npm install --production

COPY backend/ ./backend/
COPY frontend/ ./frontend/
COPY database/ ./database/

EXPOSE 10000

CMD ["node", "backend/server.js"]
