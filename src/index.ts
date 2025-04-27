import express from 'express';
// import { config } from './config';
import { Server } from 'socket.io';
import http from 'http';
import { PrismaClient } from '@prisma/client';
import exploitsRouter from './routes/exploits';
import analyticsRouter from './routes/analytics';
import resourcesRouter from './routes/resources';
import contributionsRouter from './routes/contributions';
import { setupLiveTrackerWebSocket } from './routes/live-tracker';
import cors from 'cors'
const app = express();
const server = http.createServer(app);
const io = new Server(server);
const prisma = new PrismaClient();
app.use(cors())
app.use(express.json());
// Routes
app.use('/exploits', exploitsRouter);
app.use('/analytics', analyticsRouter);
app.use('/resources', resourcesRouter);
app.use('/contributions', contributionsRouter);

// WebSocket for live alerts
io.on('connection', (socket) => {
  console.log('Client connected');
  socket.on('disconnect', () => console.log('Client disconnected'));
});
setupLiveTrackerWebSocket(server);

// Error handling middleware
app.use((err: Error, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Internal server error' });
});

// Start server
server.listen(4000, () => {
  console.log(`Server running on port 4000`);
});

export { app, io, prisma };