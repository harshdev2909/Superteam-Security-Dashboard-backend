import { WebSocketServer } from 'ws';
import { prisma } from '../index';

// Helper function to convert BigInt to string
const serializeBigInt = (obj: any): any => {
  return JSON.parse(
    JSON.stringify(obj, (key, value) =>
      typeof value === 'bigint' ? value.toString() : value
    )
  );
};

interface LiveAlert {
  id: string;
  timestamp: string;
  protocol: string;
  type: string;
  severity: 'critical' | 'high' | 'medium' | 'low';
  status: 'active' | 'investigating' | 'resolved';
  description: string;
  estimatedLoss?: string;
  transactionId?: string;
  attackerAddress?: string;
  affectedAddresses?: string[];
  technicalDetails?: string;
}

// Simulate alert generation (replace with Solana blockchain monitoring)
async function generateAlert(): Promise<LiveAlert> {
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

  const alert: LiveAlert = {
    id: `alert-${Date.now()}`,
    timestamp: new Date().toISOString(),
    protocol: protocols[Math.floor(Math.random() * protocols.length)],
    type: types[Math.floor(Math.random() * types.length)],
    severity: severities[Math.floor(Math.random() * severities.length)] as LiveAlert['severity'],
    status: statuses[Math.floor(Math.random() * statuses.length)] as LiveAlert['status'],
    description: `Detected potential issue on ${protocols[0]}. Investigation ongoing.`,
    estimatedLoss: Math.random() > 0.5 ? `$${Math.random() * 10}M` : undefined,
    transactionId: Math.random() > 0.3 ? `tx_${Math.random().toString(36).substring(2, 15)}` : undefined,
    attackerAddress: Math.random() > 0.4 ? `0x${Math.random().toString(16).substring(2, 42)}` : undefined,
    technicalDetails: 'Suspicious activity detected in smart contract execution.',
  };

  try {
    await prisma.alert.create({
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
  } catch (error) {
    console.error('Failed to save alert to database:', error);
  }

  return alert;
}

// WebSocket server setup
export function setupLiveTrackerWebSocket(server: import('http').Server) {
  const wss = new WebSocketServer({ server, path: '/api/live-tracker' });

  wss.on('connection', (ws) => {
    console.log('Client connected to live tracker');

    // Send recent alerts on connection
    prisma.alert
      .findMany({
        orderBy: { timestamp: 'desc' },
        take: 10, // Last 10 alerts
      })
      .then((alerts) => {
        ws.send(JSON.stringify({ type: 'initial', data: serializeBigInt(alerts) }));
      })
      .catch((error) => {
        console.error('Failed to fetch recent alerts:', error);
        ws.send(JSON.stringify({ type: 'error', message: 'Failed to fetch recent alerts' }));
      });

    // Simulate new alerts every 10-30 seconds
    const alertInterval = setInterval(async () => {
      if (Math.random() < 0.3) { // 30% chance
        const newAlert = await generateAlert();
        ws.send(JSON.stringify({ type: 'alert', data: serializeBigInt(newAlert) }));
      }
    }, 10000);

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