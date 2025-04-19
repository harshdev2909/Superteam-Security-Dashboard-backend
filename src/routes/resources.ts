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

// GET /contributions - Fetch all contributions with optional status filter
router.get('/', async (req, res) => {
  try {
    const { status } = req.query;
    const filters: any = {};

    if (status) filters.status = { equals: status as string };

    const contributions = await prisma.contribution.findMany({
      where: filters,
      orderBy: { createdAt: 'desc' },
    });

    // Serialize response
    const serializedContributions = serializeBigInt(contributions);
    res.json(serializedContributions);
  } catch (error) {
    console.error('Error fetching contributions:', error);
    res.status(500).json({ error: 'Failed to fetch contributions' });
  }
});

// GET /contributions/:id - Fetch a single contribution by ID
//@ts-ignore
router.get('/:id', async (req, res) => {
  try {
    const contribution = await prisma.contribution.findUnique({
      where: { id: req.params.id },
    });

    if (!contribution) {
      return res.status(404).json({ error: 'Contribution not found' });
    }

    // Serialize response
    const serializedContribution = serializeBigInt(contribution);
    res.json(serializedContribution);
  } catch (error) {
    console.error('Error fetching contribution:', error);
    res.status(500).json({ error: 'Failed to fetch contribution' });
  }
});

// POST /contributions - Submit a new contribution
//@ts-ignore
router.post('/', async (req, res) => {
  try {
    const { title, description, txIds, evidenceUrl, submitter } = req.body;

    // Basic validation
    if (!title || !description) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const contribution = await prisma.contribution.create({
      data: {
        title,
        description,
        txIds: txIds || [],
        evidenceUrl,
        submitter,
        status: 'Pending',
      },
    });

    // Serialize response
    const serializedContribution = serializeBigInt(contribution);
    res.status(201).json(serializedContribution);
  } catch (error) {
    console.error('Error creating contribution:', error);
    res.status(500).json({ error: 'Failed to create contribution' });
  }
});

export default router;