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
// GET /contributions - Fetch all contributions with optional status filter
router.get('/', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { status } = req.query;
        const filters = {};
        if (status)
            filters.status = { equals: status };
        const contributions = yield index_1.prisma.contribution.findMany({
            where: filters,
            orderBy: { createdAt: 'desc' },
        });
        // Serialize response
        const serializedContributions = serializeBigInt(contributions);
        res.json(serializedContributions);
    }
    catch (error) {
        console.error('Error fetching contributions:', error);
        res.status(500).json({ error: 'Failed to fetch contributions' });
    }
}));
// GET /contributions/:id - Fetch a single contribution by ID
//@ts-ignore
router.get('/:id', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const contribution = yield index_1.prisma.contribution.findUnique({
            where: { id: req.params.id },
        });
        if (!contribution) {
            return res.status(404).json({ error: 'Contribution not found' });
        }
        // Serialize response
        const serializedContribution = serializeBigInt(contribution);
        res.json(serializedContribution);
    }
    catch (error) {
        console.error('Error fetching contribution:', error);
        res.status(500).json({ error: 'Failed to fetch contribution' });
    }
}));
// POST /contributions - Submit a new contribution
//@ts-ignore
router.post('/', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { title, description, txIds, evidenceUrl, submitter } = req.body;
        // Basic validation
        if (!title || !description) {
            return res.status(400).json({ error: 'Missing required fields' });
        }
        const contribution = yield index_1.prisma.contribution.create({
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
    }
    catch (error) {
        console.error('Error creating contribution:', error);
        res.status(500).json({ error: 'Failed to create contribution' });
    }
}));
exports.default = router;
