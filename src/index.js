import 'dotenv/config';
import pkg from 'whatsapp-web.js';
const { Client, LocalAuth } = pkg;
import qrcodeTerminal from 'qrcode-terminal';
import QRCode from 'qrcode';
import cron from 'node-cron';
import express from 'express';
import { initializePlaid } from './services/plaid.js';
import { analyzeSpending, checkRecentTransactions } from './services/spending.js';
import { generateResponse } from './services/personality.js';
import { handleMessage } from './handlers/messageHandler.js';
import { checkBudgetAlerts } from './services/budget.js';
import { startReminders } from './services/reminders.js';
import { initializeGmail, checkImportantEmails } from './services/gmail.js';
import { generateDailySummary as generateActivityDailySummary, generateWeeklySummary, cleanOldActivities } from './services/activity.js';

console.log('🤖 Starting Personal Assistant Bot...\n');

// Create HTTP server for Render (required to stay alive)
const app = express();
const PORT = process.env.PORT || 3000;

app.get('/', (req, res) => {
    res.send('WhatsApp Bot is running! 🤖');
});

app.get('/health', (req, res) => {
    res.json({ status: 'ok', uptime: process.uptime() });
});

app.listen(PORT, '0.0.0.0', () => {
    console.log(`🌐 HTTP server running on port ${PORT}`);
});

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

    // Generate QR code as Data URL (works in Railway logs!)
    try {
        const qrDataURL = await QRCode.toDataURL(qr, {
            width: 400,
            margin: 2,
            color: {
                dark: '#000000',
                light: '#FFFFFF'
            }
        });

        console.log('✅ QR Code generated successfully!\n');
        console.log('🔗 SCAN THIS QR CODE:\n');
        console.log('Copy this entire URL and paste it in your browser:\n');
        console.log(qrDataURL);
        console.log('\n📱 Steps to scan:');
        console.log('   1. Copy the long data:image/png;base64... URL above');
        console.log('   2. Paste it in your browser address bar and press Enter');
        console.log('   3. The QR code will display in your browser');
        console.log('   4. Open WhatsApp on your phone');
        console.log('   5. Go to Settings → Linked Devices → Link a Device');
        console.log('   6. Scan the QR code from your browser\n');
    } catch (error) {
        console.error('Error generating QR code:', error);
    }

    // Also save as file (for local use)
    try {
        await QRCode.toFile('whatsapp-qr.png', qr, {
            width: 400,
            margin: 2
        });
        console.log('📁 QR Code also saved to: whatsapp-qr.png\n');
    } catch (error) {
        // Ignore file save errors in cloud environment
    }

    // Show terminal QR (backup method)
    console.log('📱 Terminal QR Code (backup - try to scan from screen):\n');
    qrcodeTerminal.generate(qr, { small: true });
});

// Ready event
client.on('ready', async () => {
    console.log('✅ Bot is ready and connected!\n');
    console.log('📞 Waiting for messages...\n');

    // Initialize services
    await initializePlaid();
    await initializeGmail();

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

    // Check important emails every 2 hours (9am-9pm)
    cron.schedule('0 9-21/2 * * *', async () => {
        console.log('📧 Checking important emails...');
        await checkImportantEmails(client);
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
        await sendToUser(client, summary);
    });

    // Weekly summary - Sunday at 8 PM
    cron.schedule('0 20 * * 0', async () => {
        console.log('📅 Generating weekly summary...');
        const summary = generateWeeklySummary();
        await sendToUser(client, summary);
    });

    // Clean old activities - Daily at 2 AM
    cron.schedule('0 2 * * *', async () => {
        console.log('🧹 Cleaning old activities...');
        cleanOldActivities();
    });

    console.log('⏰ Monitoring schedules set up:');
    console.log('   - Spending checks: Every hour');
    console.log('   - Email checks: Every 2 hours (9am-9pm)');
    console.log('   - Morning motivation: 8 AM');
    console.log('   - Midday check-in: 12 PM');
    console.log('   - Evening wind-down: 9 PM');
    console.log('   - Daily summary: 10 PM');
    console.log('   - Weekly summary: Sunday 8 PM');
    console.log('   - Data cleanup: Daily 2 AM\n');
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
    const activitySummary = generateActivityDailySummary();

    const prompt = `Generate a sassy, passionate daily summary based on this data:

Activity Today: ${activitySummary}
Spending: ${spendingSummary}

Be honest and direct. Call out any lazy or wasteful behavior. If they did well, show pride. Keep it real and conversational.`;

    return await generateResponse(prompt);
}

// Initialize client
client.initialize();

// Export for use in other modules
export { client, sendToUser };
