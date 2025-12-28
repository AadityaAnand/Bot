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
import { checkBudgetAlerts } from './services/budget.js';
import { startReminders } from './services/reminders.js';

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

    // Start reminders
    startReminders(client);

    // Schedule periodic checks
    scheduleMonitoring(client);
});

// Handle incoming messages
client.on('message', async (message) => {
    console.log('🎯 MESSAGE EVENT TRIGGERED!');
    console.log('   From:', message.from);
    console.log('   Body:', message.body);
    console.log('   Type:', message.type);
    await handleMessage(client, message);
});

// Track last processed message to prevent loops
let lastProcessedMessageId = null;

// Handle messages you send (including to yourself)
client.on('message_create', async (message) => {
    console.log('🎯 MESSAGE_CREATE EVENT TRIGGERED!');
    console.log('   From:', message.from);
    console.log('   To:', message.to);
    console.log('   Body:', message.body);
    console.log('   Type:', message.type);

    // Prevent processing the same message twice
    if (message.id._serialized === lastProcessedMessageId) {
        console.log('   ⏭️  Skipping already processed message');
        return;
    }

    // Only process if it's from you to yourself or in a group
    if (message.fromMe) {
        console.log('   This is YOUR message, processing...');
        lastProcessedMessageId = message.id._serialized;
        await handleMessage(client, message);
    }
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
    // Check spending and budget every hour
    cron.schedule('0 * * * *', async () => {
        console.log('💰 Running spending and budget check...');
        await checkRecentTransactions(client);
        await checkBudgetAlerts(client);
    });

    // Check social media usage every 2 hours during waking hours (8am - 11pm)
    cron.schedule('0 8-23/2 * * *', async () => {
        console.log('📱 Running social media usage check...');
        await checkSocialMediaUsage(client);
    });

    // Morning motivation - 8 AM
    cron.schedule('0 8 * * *', async () => {
        console.log('☀️ Sending morning motivation...');
        const motivation = await generateResponse("Send a short, sassy morning motivation message to start the day strong. Keep it under 2 sentences.");
        await sendToUser(client, `🤖 ${motivation}`);
    });

    // Midday check-in - 12 PM
    cron.schedule('0 12 * * *', async () => {
        console.log('🌞 Sending midday check-in...');
        const checkIn = await generateResponse("Send a quick midday check-in. Ask how their morning went and remind them to stay focused. Keep it brief and sassy.");
        await sendToUser(client, `🤖 ${checkIn}`);
    });

    // Evening wind-down reminder - 9 PM
    cron.schedule('0 21 * * *', async () => {
        console.log('🌙 Sending evening reminder...');
        const reminder = await generateResponse("Remind them to start winding down, prep for tomorrow, and get good sleep. Be supportive but firm about self-care.");
        await sendToUser(client, `🤖 ${reminder}`);
    });

    // Daily summary - 10 PM
    cron.schedule('0 22 * * *', async () => {
        console.log('📊 Generating daily summary...');
        const summary = await generateDailySummary();
        await sendToUser(client, `🤖 ${summary}`);
    });

    console.log('⏰ Monitoring schedules set up:');
    console.log('   - Spending checks: Every hour');
    console.log('   - Social media checks: Every 2 hours (8am-11pm)');
    console.log('   - Morning motivation: 8 AM');
    console.log('   - Midday check-in: 12 PM');
    console.log('   - Evening wind-down: 9 PM');
    console.log('   - Daily summary: 10 PM\n');
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
