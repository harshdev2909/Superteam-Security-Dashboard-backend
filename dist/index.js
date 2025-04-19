"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.prisma = exports.io = exports.app = void 0;
const express_1 = __importDefault(require("express"));
// import { config } from './config';
const client_1 = require("@prisma/client");
const socket_io_1 = require("socket.io");
const http_1 = __importDefault(require("http"));
const exploits_1 = __importDefault(require("./routes/exploits"));
const analytics_1 = __importDefault(require("./routes/analytics"));
const resources_1 = __importDefault(require("./routes/resources"));
// import contributionsRouter from './routes/contributions';
const app = (0, express_1.default)();
exports.app = app;
const server = http_1.default.createServer(app);
const io = new socket_io_1.Server(server);
exports.io = io;
const prisma = new client_1.PrismaClient();
exports.prisma = prisma;
app.use(express_1.default.json());
// Routes
app.use('/exploits', exploits_1.default);
app.use('/analytics', analytics_1.default);
app.use('/resources', resources_1.default);
// app.use('/contributions', contributionsRouter);
// WebSocket for live alerts
io.on('connection', (socket) => {
    console.log('Client connected');
    socket.on('disconnect', () => console.log('Client disconnected'));
});
// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ error: 'Internal server error' });
});
// Start server
server.listen(4000, () => {
    console.log(`Server running on port 4000`);
});
