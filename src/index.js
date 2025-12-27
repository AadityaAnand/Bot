import 'dotenv/config';
import pkg from 'whatsapp-web.js';
const { Client, LocalAuth } = pkg;
import qrcodeTerminal from 'qrcode-terminal';
import QRCode from 'qrcode';
import cron from 'node-cron';
import { initializePlaid } from './services/plaid.js';
import { analyzeSpending, checkRecentTransactions } from './services/spending.js';
import { checkSocialMediaUsage } from './services/socialMedia.js';
import { generateResponse } from './services/personality.js';
import { handleMessage } from './handlers/messageHandler.js';

console.log('🤖 Starting Personal Assistant Bot...\n');

// Initialize WhatsApp client
const client = new Client({
    authStrategy: new LocalAuth(),
    puppeteer: {
        headless: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox']
    }
});

// QR Code for authentication
client.on('qr', async (qr) => {
    console.log('📱 Generating QR code...\n');

    // Save QR code as image
    try {
        await QRCode.toFile('whatsapp-qr.png', qr, {
            width: 400,
            margin: 2
        });
        console.log('✅ QR Code saved to: whatsapp-qr.png');
        console.log('📱 Open whatsapp-qr.png and scan it with WhatsApp on your phone!\n');
        console.log('   Steps:');
        console.log('   1. Open whatsapp-qr.png file');
        console.log('   2. Open WhatsApp on your phone');
        console.log('   3. Go to Settings → Linked Devices');
        console.log('   4. Tap "Link a Device"');
        console.log('   5. Scan the QR code from whatsapp-qr.png\n');
    } catch (error) {
        console.error('Error generating QR code image:', error);
    }

    // Also show in terminal (if it works)
    qrcodeTerminal.generate(qr, { small: true });
});

// Ready event
client.on('ready', async () => {
    console.log('✅ Bot is ready and connected!\n');
    console.log('📞 Waiting for messages...\n');

    // Initialize services
    await initializePlaid();

    // Schedule periodic checks
    scheduleMonitoring(client);
});

// Handle incoming messages
client.on('message', async (message) => {
    await handleMessage(client, message);
});

// Error handling
client.on('auth_failure', () => {
    console.error('❌ Authentication failed!');
});

client.on('disconnected', (reason) => {
    console.log('❌ Client disconnected:', reason);
});

// Schedule monitoring tasks
function scheduleMonitoring(client) {
    // Check spending every hour
    cron.schedule('0 * * * *', async () => {
        console.log('💰 Running spending check...');
        await checkRecentTransactions(client);
    });

    // Check social media usage every 2 hours during waking hours (8am - 11pm)
    cron.schedule('0 8-23/2 * * *', async () => {
        console.log('📱 Running social media usage check...');
        await checkSocialMediaUsage(client);
    });

    // Daily summary at 9 PM
    cron.schedule('0 21 * * *', async () => {
        console.log('📊 Generating daily summary...');
        const summary = await generateDailySummary();
        await sendToUser(client, summary);
    });

    console.log('⏰ Monitoring schedules set up:');
    console.log('   - Spending checks: Every hour');
    console.log('   - Social media checks: Every 2 hours (8am-11pm)');
    console.log('   - Daily summary: 9 PM\n');
}

// Send message to authorized user
async function sendToUser(client, message) {
    const userNumber = process.env.AUTHORIZED_USER_NUMBER;
    if (!userNumber) {
        console.error('❌ No authorized user number configured');
        return;
    }

    try {
        const chatId = userNumber.includes('@c.us') ? userNumber : `${userNumber}@c.us`;
        await client.sendMessage(chatId, message);
    } catch (error) {
        console.error('Error sending message:', error.message);
    }
}

// Generate daily summary
async function generateDailySummary() {
    const spendingSummary = await analyzeSpending();
    const socialMediaSummary = await checkSocialMediaUsage(null, true);

    const prompt = `Generate a sassy, passionate daily summary based on this data:

Spending: ${spendingSummary}
Social Media: ${socialMediaSummary}

Be honest and direct. If I wasted time or money, call me out. If I did well, be proud. Keep it real and conversational.`;

    return await generateResponse(prompt);
}

// Initialize client
client.initialize();

// Export for use in other modules
export { client, sendToUser };
