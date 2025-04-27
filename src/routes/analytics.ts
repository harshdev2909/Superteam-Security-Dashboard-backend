import { Router } from 'express';
import { prisma } from '../index';
import { subMonths, format, parseISO } from 'date-fns';
import { ExploitMetadata } from '../types/exploitMetadata';

const router = Router();

// Helper function to convert BigInt to string
const serializeBigInt = (obj: any): any => {
  return JSON.parse(
    JSON.stringify(obj, (key, value) =>
      typeof value === 'bigint' ? value.toString() : value
    )
  );
};

// Runtime validation for metadata
const isExploitMetadata = (metadata: any): metadata is ExploitMetadata => {
  return (
    metadata != null &&
    typeof metadata === 'object' &&
    'timeline' in metadata &&
    Array.isArray(metadata.timeline) &&
    metadata.timeline.every(
      (item: any) => typeof item === 'object' && 'time' in item && 'description' in item
    )
  );
};

// Mock SOL to USD conversion rate (replace with real API, e.g., CoinGecko)
const SOL_TO_USD_RATE = 150; // $150 per SOL

router.get('/', async (req, res) => {
  try {
    const { timeRange = 'all', currency = 'sol' } = req.query;

    // Determine date filter based on timeRange
    let startDate: Date;
    switch (timeRange) {
      case 'month':
        startDate = subMonths(new Date(), 1);
        break;
      case 'quarter':
        startDate = subMonths(new Date(), 3);
        break;
      case 'year':
        startDate = subMonths(new Date(), 12);
        break;
      case 'all':
      default:
        startDate = new Date(0); // Epoch start
        break;
    }

    // Fetch exploits within time range
    const exploits = await prisma.exploit.findMany({
      where: {
        date: { gte: startDate },
      },
      select: {
        id: true,
        date: true,
        protocol: true,
        type: true,
        fundsLost: true,
        metadata: true,
      },
    });

    // Compute totalExploits
    const totalExploits = exploits.length;

    // Compute totalFundsLost (in SOL or USD)
    let totalFundsLost = exploits.reduce((sum, exploit) => {
      return sum + Number(exploit.fundsLost) / 1e9; // Convert lamports to SOL
    }, 0);
    if (currency === 'usd') {
      totalFundsLost *= SOL_TO_USD_RATE / 1e6; // Convert SOL to millions USD
    }

    // Compute avgResponseTime (in hours)
    const responseTimes = exploits
      .filter(
        (exploit): exploit is {
          id: string;
          date: Date;
          protocol: string;
          type: string;
          fundsLost: bigint;
          metadata: any;
        } => {
          return exploit.metadata !== null && isExploitMetadata(exploit.metadata as unknown as ExploitMetadata);
        }
      )
      .map((exploit) => {
        const timeline = exploit.metadata.timeline;
        if (timeline.length < 2) return 0;
        const start = parseISO(timeline[0].time);
        const end = parseISO(timeline[timeline.length - 1].time);
        return (end.getTime() - start.getTime()) / (1000 * 60 * 60); // Hours
      });
    const avgResponseTime =
      responseTimes.length > 0
        ? responseTimes.reduce((sum, time) => sum + time, 0) / responseTimes.length
        : 0;

    // Compute mostCommonType and exploitTypes
    const typeCounts = exploits.reduce((acc, exploit) => {
      acc[exploit.type] = (acc[exploit.type] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    const mostCommonType = Object.entries(typeCounts).reduce((a, b) => (b[1] > a[1] ? b : a), ['', 0])[0];
    const typeColors: Record<string, string> = {
      Reentrancy: '#10B981',
      'Flash Loan Attack': '#3B82F6',
      'Oracle Manipulation': '#8B5CF6',
      'Access Control': '#EC4899',
      'Logic Error': '#F59E0B',
    };
    const exploitTypes = Object.entries(typeCounts).map(([name, value]) => ({
      name,
      value,
      fill: typeColors[name] || '#6B7280',
    }));

    // Compute fundsLostOverTime (within time range)
    const fundsLostByMonth = exploits.reduce((acc, exploit) => {
      const month = format(new Date(exploit.date), 'yyyy-MM');
      acc[month] = (acc[month] || 0) + Number(exploit.fundsLost) / 1e9; // In SOL
      return acc;
    }, {} as Record<string, number>);
    const months = timeRange === 'all' ? 12 : timeRange === 'year' ? 12 : timeRange === 'quarter' ? 3 : 1;
    const fundsLostOverTime = Array.from({ length: months }, (_, i) => {
      const date = format(subMonths(new Date(), months - 1 - i), 'yyyy-MM');
      let value = fundsLostByMonth[date] || 0;
      if (currency === 'usd') {
        value *= SOL_TO_USD_RATE / 1e6; // Convert SOL to millions USD
      }
      return { date, value };
    });

    // Compute protocolFrequency
    const protocolCategories: Record<string, string> = {
      SolFlare: 'DeFi',
      SolYield: 'Lending',
      SolStake: 'Staking',
      SolSwap: 'DEX',
      SolLend: 'Lending',
      SolBridge: 'Bridge',
      SolVault: 'Vault',
      SolFarm: 'Yield',
      SolDAO: 'DAO',
      SolNFT: 'NFT',
    };
    const protocolCounts = exploits.reduce((acc, exploit) => {
      acc[exploit.protocol] = (acc[exploit.protocol] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    const protocolFrequency = Object.entries(protocolCounts).map(([protocol, count]) => ({
      protocol,
      category: protocolCategories[protocol] || 'Unknown',
      count,
    }));

    const analyticsData = {
      totalExploits,
      totalFundsLost,
      avgResponseTime: Number(avgResponseTime.toFixed(1)),
      mostCommonType,
      exploitTypes,
      fundsLostOverTime,
      protocolFrequency,
    };

    console.log('Analytics response:', analyticsData);

    res.json(serializeBigInt(analyticsData));
  } catch (error) {
    console.error('Error computing analytics:', error);
    res.status(500).json({ error: 'Failed to compute analytics' });
  }
});

export default router;