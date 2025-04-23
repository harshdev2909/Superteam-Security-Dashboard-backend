import puppeteer from 'puppeteer';
import axios from 'axios';
import { PrismaClient } from '@prisma/client';

// Initialize Prisma client
const prisma = new PrismaClient();

// Fetch historical SOL price from CoinGecko (dd-mm-yyyy format)
async function getSolPrice(date: string): Promise<number> {
  try {
    const response = await axios.get(
      `https://api.coingecko.com/api/v3/coins/solana/history?date=${date}&localization=false`,
      { timeout: 5000 }
    );
    return response.data.market_data.current_price.usd;
  } catch (error) {
    console.error(`Error fetching SOL price for ${date}:`, (error as any).message);
    return 140; // Fallback: $140/SOL (2022 average)
  }
}

// Scrape Rekt.news leaderboard for Solana exploits
async function scrapeRekt(): Promise<any[]> {
  let browser;
  try {
    const url = 'https://rekt.news/leaderboard/';
    console.log(`Launching browser to scrape ${url}`);

    // Launch headless browser
    browser = await puppeteer.launch({ headless: true });
    const page = await browser.newPage();
    await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36');

    // Navigate and wait for table to load
    console.log('Navigating to page...');
    await page.goto(url, { waitUntil: 'networkidle2', timeout: 30000 });
    await page.waitForSelector('table', { timeout: 10000 }).catch(() => {
      console.warn('Table selector not found, dumping page content for debugging...');
      page.content().then((content) => console.log(content.slice(0, 500)));
    });

    // Extract table data
    console.log('Extracting table data...');
    const exploits = await page.evaluate(() => {
      const solanaProtocols = ['Mango Markets', 'Wormhole', 'Cashio', 'Saber', 'Orca'];
      const exploits: any[] = [];
      const rows = document.querySelectorAll('table tr');

      rows.forEach((row) => {
        const cols = row.querySelectorAll('td');
        if (cols.length < 3) return;

        const protocol = cols[0]?.textContent?.trim();
        const amount = cols[1]?.textContent?.trim();
        const date = cols[2]?.textContent?.trim();

        if (
          protocol &&
          amount &&
          date &&
          solanaProtocols.some((p) => protocol.toLowerCase().includes(p.toLowerCase()))
        ) {
          const amountNum = parseFloat(amount.replace('$', '').replace('M', '')) * 1e6;
          if (isNaN(amountNum)) return;

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
  } catch (error) {
    console.error('Error scraping Rekt.news:', (error as any).message);
    return [];
  } finally {
    if (browser) await browser.close();
  }
}

// Ingest scraped data into Exploits table
async function ingestRekt() {
  try {
    const exploits = await scrapeRekt();
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
      const solPrice = await getSolPrice(dateStr);
      const fundsLost = BigInt(Math.round((exploit.amount / solPrice) * 1e9)); // USD to lamports

      await prisma.exploit.upsert({
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
  } catch (error) {
    console.error('Error ingesting Rekt data:', (error as any).message);
  } finally {
    await prisma.$disconnect();
  }
}

ingestRekt().catch(console.error);