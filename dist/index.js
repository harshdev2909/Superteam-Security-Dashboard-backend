"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.prisma = exports.io = exports.app = void 0;
const express_1 = __importDefault(require("express"));
// import { config } from './config';
const socket_io_1 = require("socket.io");
const http_1 = __importDefault(require("http"));
const client_1 = require("@prisma/client");
const exploits_1 = __importDefault(require("./routes/exploits"));
const analytics_1 = __importDefault(require("./routes/analytics"));
const resources_1 = __importDefault(require("./routes/resources"));
const contributions_1 = __importDefault(require("./routes/contributions"));
const live_tracker_1 = require("./routes/live-tracker");
const cors_1 = __importDefault(require("cors"));
const app = (0, express_1.default)();
exports.app = app;
const server = http_1.default.createServer(app);
const io = new socket_io_1.Server(server);
exports.io = io;
const prisma = new client_1.PrismaClient();
exports.prisma = prisma;
app.use((0, cors_1.default)());
app.use(express_1.default.json());
// Routes
app.use('/exploits', exploits_1.default);
app.use('/analytics', analytics_1.default);
app.use('/resources', resources_1.default);
app.use('/contributions', contributions_1.default);
// WebSocket for live alerts
io.on('connection', (socket) => {
    console.log('Client connected');
    socket.on('disconnect', () => console.log('Client disconnected'));
});
(0, live_tracker_1.setupLiveTrackerWebSocket)(server);
// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ error: 'Internal server error' });
});
// Start server
server.listen(4000, () => {
    console.log(`Server running on port 4000`);
});
