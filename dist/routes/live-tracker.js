"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.setupLiveTrackerWebSocket = setupLiveTrackerWebSocket;
const ws_1 = require("ws");
const index_1 = require("../index");
// Helper function to convert BigInt to string
const serializeBigInt = (obj) => {
    return JSON.parse(JSON.stringify(obj, (key, value) => typeof value === 'bigint' ? value.toString() : value));
};
// Simulate alert generation (replace with Solana blockchain monitoring)
function generateAlert() {
    return __awaiter(this, void 0, void 0, function* () {
        const protocols = ['SolDEX', 'SolBridge', 'SolYield', 'SolVault', 'SolSwap'];
        const types = [
            'Price Manipulation',
            'Suspicious Activity',
            'Flash Loan Attack',
            'Unauthorized Transfer',
            'Contract Exploit',
        ];
        const severities = ['critical', 'high', 'medium', 'low'];
        const statuses = ['active', 'investigating', 'resolved'];
        // Simulate fetching recent transactions or exploits
        const alert = {
            id: `alert-${Date.now()}`,
            timestamp: new Date().toISOString(),
            protocol: protocols[Math.floor(Math.random() * protocols.length)],
            type: types[Math.floor(Math.random() * types.length)],
            severity: severities[Math.floor(Math.random() * severities.length)],
            status: statuses[Math.floor(Math.random() * statuses.length)],
            description: `Detected potential issue on ${protocols[0]}. Investigation ongoing.`,
            estimatedLoss: Math.random() > 0.5 ? `$${Math.random() * 10}M` : undefined,
            transactionId: Math.random() > 0.3 ? `tx_${Math.random().toString(36).substring(2, 15)}` : undefined,
            attackerAddress: Math.random() > 0.4 ? `0x${Math.random().toString(16).substring(2, 42)}` : undefined,
            technicalDetails: 'Suspicious activity detected in smart contract execution.',
        };
        // Save alert to database
        yield index_1.prisma.alert.create({
            data: {
                id: alert.id,
                timestamp: new Date(alert.timestamp),
                protocol: alert.protocol,
                type: alert.type,
                severity: alert.severity,
                status: alert.status,
                description: alert.description,
                estimatedLoss: alert.estimatedLoss,
                transactionId: alert.transactionId,
                attackerAddress: alert.attackerAddress,
                technicalDetails: alert.technicalDetails,
            },
        });
        return alert;
    });
}
// WebSocket server setup
function setupLiveTrackerWebSocket(server) {
    const wss = new ws_1.WebSocketServer({ server, path: '/api/live-tracker' });
    wss.on('connection', (ws) => {
        console.log('Client connected to live tracker');
        // Send recent alerts on connection
        index_1.prisma.alert
            .findMany({
            orderBy: { timestamp: 'desc' },
            take: 10, // Last 10 alerts
        })
            .then((alerts) => {
            ws.send(JSON.stringify({ type: 'initial', data: serializeBigInt(alerts) }));
        });
        // Simulate new alerts every 10-30 seconds
        const alertInterval = setInterval(() => __awaiter(this, void 0, void 0, function* () {
            if (Math.random() < 0.3) { // 30% chance
                const newAlert = yield generateAlert();
                ws.send(JSON.stringify({ type: 'alert', data: serializeBigInt(newAlert) }));
            }
        }), 10000);
        ws.on('close', () => {
            console.log('Client disconnected from live tracker');
            clearInterval(alertInterval);
        });
        ws.on('error', (error) => {
            console.error('WebSocket error:', error);
        });
    });
    console.log('Live tracker WebSocket running on /api/live-tracker');
}
