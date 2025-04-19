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
const express_1 = require("express");
const index_1 = require("../index");
// Helper function to convert BigInt to string
const serializeBigInt = (obj) => {
    return JSON.parse(JSON.stringify(obj, (key, value) => typeof value === 'bigint' ? value.toString() : value));
};
const router = (0, express_1.Router)();
// GET /analytics - Fetch all analytics metrics with optional filters
router.get('/', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { metricType } = req.query;
        const filters = {};
        if (metricType)
            filters.metricType = { equals: metricType };
        const analytics = yield index_1.prisma.analytics.findMany({
            where: filters,
            orderBy: { updatedAt: 'desc' },
        });
        // Serialize BigInt fields (if any)
        const serializedAnalytics = serializeBigInt(analytics);
        res.json(serializedAnalytics);
    }
    catch (error) {
        console.error('Error fetching analytics:', error);
        res.status(500).json({ error: 'Failed to fetch analytics' });
    }
}));
// GET /analytics/:id - Fetch a single analytic by ID
//@ts-ignore
router.get('/:id', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const analytic = yield index_1.prisma.analytics.findUnique({
            where: { id: req.params.id },
        });
        if (!analytic) {
            return res.status(404).json({ error: 'Analytic not found' });
        }
        // Serialize BigInt fields
        const serializedAnalytic = serializeBigInt(analytic);
        res.json(serializedAnalytic);
    }
    catch (error) {
        console.error('Error fetching analytic:', error);
        res.status(500).json({ error: 'Failed to fetch analytic' });
    }
}));
// POST /analytics - Create a new analytic (admin use)
//@ts-ignore
router.post('/', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { metricType, value } = req.body;
        // Basic validation
        if (!metricType || !value) {
            return res.status(400).json({ error: 'Missing required fields' });
        }
        const analytic = yield index_1.prisma.analytics.create({
            data: {
                metricType,
                value, // JSONB field for flexible metrics
            },
        });
        // Serialize BigInt fields
        const serializedAnalytic = serializeBigInt(analytic);
        res.status(201).json(serializedAnalytic);
    }
    catch (error) {
        console.error('Error creating analytic:', error);
        res.status(500).json({ error: 'Failed to create analytic' });
    }
}));
exports.default = router;
