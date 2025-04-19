import { Router } from 'express';
import { prisma } from '../index';

// Helper function to convert BigInt to string
const serializeBigInt = (obj: any): any => {
  return JSON.parse(
    JSON.stringify(obj, (key, value) =>
      typeof value === 'bigint' ? value.toString() : value
    )
  );
};

const router = Router();

// GET /analytics - Fetch all analytics metrics with optional filters
router.get('/', async (req, res) => {
  try {
    const { metricType } = req.query;
    const filters: any = {};

    if (metricType) filters.metricType = { equals: metricType as string };

    const analytics = await prisma.analytics.findMany({
      where: filters,
      orderBy: { updatedAt: 'desc' },
    });

    // Serialize BigInt fields (if any)
    const serializedAnalytics = serializeBigInt(analytics);
    res.json(serializedAnalytics);
  } catch (error) {
    console.error('Error fetching analytics:', error);
    res.status(500).json({ error: 'Failed to fetch analytics' });
  }
});

// GET /analytics/:id - Fetch a single analytic by ID
//@ts-ignore
router.get('/:id', async (req, res) => {
  try {
    const analytic = await prisma.analytics.findUnique({
      where: { id: req.params.id },
    });

    if (!analytic) {
      return res.status(404).json({ error: 'Analytic not found' });
    }

    // Serialize BigInt fields
    const serializedAnalytic = serializeBigInt(analytic);
    res.json(serializedAnalytic);
  } catch (error) {
    console.error('Error fetching analytic:', error);
    res.status(500).json({ error: 'Failed to fetch analytic' });
  }
});

// POST /analytics - Create a new analytic (admin use)
//@ts-ignore
router.post('/', async (req, res) => {
  try {
    const { metricType, value } = req.body;

    // Basic validation
    if (!metricType || !value) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const analytic = await prisma.analytics.create({
      data: {
        metricType,
        value, // JSONB field for flexible metrics
      },
    });

    // Serialize BigInt fields
    const serializedAnalytic = serializeBigInt(analytic);
    res.status(201).json(serializedAnalytic);
  } catch (error) {
    console.error('Error creating analytic:', error);
    res.status(500).json({ error: 'Failed to create analytic' });
  }
});

export default router;