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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const puppeteer_1 = __importDefault(require("puppeteer"));
const axios_1 = __importDefault(require("axios"));
const client_1 = require("@prisma/client");
// Initialize Prisma client
const prisma = new client_1.PrismaClient();
// Fetch historical SOL price from CoinGecko (dd-mm-yyyy format)
function getSolPrice(date) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const response = yield axios_1.default.get(`https://api.coingecko.com/api/v3/coins/solana/history?date=${date}&localization=false`, { timeout: 5000 });
            return response.data.market_data.current_price.usd;
        }
        catch (error) {
            console.error(`Error fetching SOL price for ${date}:`, error.message);
            return 140; // Fallback: $140/SOL (2022 average)
        }
    });
}
// Scrape Rekt.news leaderboard for Solana exploits
function scrapeRekt() {
    return __awaiter(this, void 0, void 0, function* () {
        let browser;
        try {
            const url = 'https://rekt.news/leaderboard/';
            console.log(`Launching browser to scrape ${url}`);
            // Launch headless browser
            browser = yield puppeteer_1.default.launch({ headless: true });
            const page = yield browser.newPage();
            yield page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36');
            // Navigate and wait for table to load
            console.log('Navigating to page...');
            yield page.goto(url, { waitUntil: 'networkidle2', timeout: 30000 });
            yield page.waitForSelector('table', { timeout: 10000 }).catch(() => {
                console.warn('Table selector not found, dumping page content for debugging...');
                page.content().then((content) => console.log(content.slice(0, 500)));
            });
            // Extract table data
            console.log('Extracting table data...');
            const exploits = yield page.evaluate(() => {
                const solanaProtocols = ['Mango Markets', 'Wormhole', 'Cashio', 'Saber', 'Orca'];
                const exploits = [];
                const rows = document.querySelectorAll('table tr');
                rows.forEach((row) => {
                    var _a, _b, _c, _d, _e, _f;
                    const cols = row.querySelectorAll('td');
                    if (cols.length < 3)
                        return;
                    const protocol = (_b = (_a = cols[0]) === null || _a === void 0 ? void 0 : _a.textContent) === null || _b === void 0 ? void 0 : _b.trim();
                    const amount = (_d = (_c = cols[1]) === null || _c === void 0 ? void 0 : _c.textContent) === null || _d === void 0 ? void 0 : _d.trim();
                    const date = (_f = (_e = cols[2]) === null || _e === void 0 ? void 0 : _e.textContent) === null || _f === void 0 ? void 0 : _f.trim();
                    if (protocol &&
                        amount &&
                        date &&
                        solanaProtocols.some((p) => protocol.toLowerCase().includes(p.toLowerCase()))) {
                        const amountNum = parseFloat(amount.replace('$', '').replace('M', '')) * 1e6;
                        if (isNaN(amountNum))
                            return;
                        exploits.push({
                            protocol,
                            amount: amountNum,
                            date: new Date(date),
                            type: 'Unknown',
                            description: `Exploit on ${protocol} (Source: Rekt.news)`,
                            status: 'Unknown',
                            txIds: [],
                        });
                    }
                });
                return exploits;
            });
            console.log(`Found ${exploits.length} Solana exploits`);
            return exploits;
        }
        catch (error) {
            console.error('Error scraping Rekt.news:', error.message);
            return [];
        }
        finally {
            if (browser)
                yield browser.close();
        }
    });
}
// Ingest scraped data into Exploits table
function ingestRekt() {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const exploits = yield scrapeRekt();
            if (exploits.length === 0) {
                console.log('No exploits found to ingest');
                return;
            }
            for (const exploit of exploits) {
                // Validate date
                if (isNaN(exploit.date.getTime())) {
                    console.warn(`Invalid date for ${exploit.protocol}, skipping`);
                    continue;
                }
                // Convert date to CoinGecko format (dd-mm-yyyy)
                const dateParts = exploit.date.toLocaleDateString('en-GB').split('/');
                const dateStr = `${dateParts[0]}-${dateParts[1]}-${dateParts[2]}`;
                const solPrice = yield getSolPrice(dateStr);
                const fundsLost = BigInt(Math.round((exploit.amount / solPrice) * 1e9)); // USD to lamports
                yield prisma.exploit.upsert({
                    where: { id: exploit.id }, // Ensure exploit.id is a valid unique identifier
                    update: {},
                    create: {
                        date: exploit.date,
                        protocol: exploit.protocol,
                        type: exploit.type,
                        fundsLost,
                        txIds: exploit.txIds,
                        description: exploit.description,
                        codeSnippet: null,
                        status: exploit.status,
                    },
                });
            }
            console.log(`Ingested ${exploits.length} exploits successfully`);
        }
        catch (error) {
            console.error('Error ingesting Rekt data:', error.message);
        }
        finally {
            yield prisma.$disconnect();
        }
    });
}
ingestRekt().catch(console.error);
