import { generateResponse, analyzeTextingStyle, resetContext } from '../services/personality.js';
import { analyzeSpending, getSpendingSummary, analyzeSpendingTrends } from '../services/spending.js';
import { checkSocialMediaUsage, logUsage, getPlatformUsage } from '../services/socialMedia.js';
import { getBalances } from '../services/plaid.js';

// Store user messages for style analysis
const userMessageHistory = [];

/**
 * Handle incoming WhatsApp messages
 * @param {Object} client - WhatsApp client
 * @param {Object} message - WhatsApp message object
 */
export async function handleMessage(client, message) {
    try {
        // Only respond to authorized user
        const authorizedNumber = process.env.AUTHORIZED_USER_NUMBER;
        if (!authorizedNumber) {
            console.log('⚠️  No authorized user configured');
            return;
        }

        const senderNumber = message.from.replace('@c.us', '');
        if (senderNumber !== authorizedNumber) {
            console.log(`🚫 Ignoring message from unauthorized number: ${senderNumber}`);
            return;
        }

        const messageBody = message.body.trim();
        console.log(`📨 Received: "${messageBody}"`);

        // Store message for style analysis
        userMessageHistory.push(messageBody);
        if (userMessageHistory.length > 100) {
            userMessageHistory.shift();
        }

        // Check for commands
        const response = await processCommand(messageBody, client);

        // Send response
        if (response) {
            await message.reply(response);
            console.log(`✅ Sent: "${response.substring(0, 50)}..."`);
        }

    } catch (error) {
        console.error('Error handling message:', error.message);
        await message.reply("Ugh, I'm having technical issues. Give me a sec...");
    }
}

/**
 * Process user commands and generate responses
 * @param {string} messageBody - User message
 * @param {Object} client - WhatsApp client
 * @returns {Promise<string>} - Response message
 */
async function processCommand(messageBody, client) {
    const lower = messageBody.toLowerCase();

    // Help command
    if (lower === 'help' || lower === '/help') {
        return getHelpMessage();
    }

    // Spending commands
    if (lower.includes('spending') || lower.includes('spent')) {
        return await handleSpendingQuery(lower);
    }

    // Balance check
    if (lower.includes('balance') || lower.includes('money')) {
        return await handleBalanceQuery();
    }

    // Social media commands
    if (lower.includes('social media') || lower.includes('screen time')) {
        return await handleSocialMediaQuery();
    }

    // Log social media usage manually
    if (lower.startsWith('log ')) {
        return handleLogUsage(messageBody);
    }

    // Reset conversation context
    if (lower === 'reset' || lower === 'forget') {
        resetContext();
        return "Alright, clean slate. What's up?";
    }

    // Learn user's texting style
    if (lower === 'learn my style' || lower === 'analyze style') {
        if (userMessageHistory.length < 10) {
            return "I need more messages from you to learn your style. Keep texting!";
        }

        const stylePrompt = analyzeTextingStyle(userMessageHistory);
        await generateResponse(stylePrompt);
        return "Got it! I've analyzed your texting style and I'll match it from now on.";
    }

    // General conversation - use AI
    return await generateResponse(messageBody);
}

/**
 * Get help message
 * @returns {string} - Help text
 */
function getHelpMessage() {
    return `Hey! Here's what I can do:

💰 Finance:
- "spending" - See spending summary
- "balance" - Check account balances

📱 Social Media:
- "social media" - Usage summary
- "log [platform] [minutes]" - Log usage
  Example: "log instagram 45"

🤖 Bot Commands:
- "learn my style" - Analyze your texting
- "reset" - Clear conversation history
- "help" - This message

Just chat with me normally and I'll keep you accountable!`;
}

/**
 * Handle spending-related queries
 * @param {string} query - User query
 * @returns {Promise<string>} - Response
 */
async function handleSpendingQuery(query) {
    try {
        let period = 'week';

        if (query.includes('today') || query.includes('day')) {
            period = 'day';
        } else if (query.includes('month')) {
            period = 'month';
        }

        const summary = await getSpendingSummary(period);
        const trends = await analyzeSpendingTrends();

        let response = `💰 Spending Summary (${period}):\n\n`;
        response += `Total: $${summary.total.toFixed(2)}\n`;
        response += `Transactions: ${summary.transactionCount}\n\n`;

        // Top 3 categories
        const topCategories = Object.entries(summary.categories)
            .sort((a, b) => b[1].total - a[1].total)
            .slice(0, 3);

        if (topCategories.length > 0) {
            response += 'Top Categories:\n';
            topCategories.forEach(([cat, data]) => {
                response += `- ${cat}: $${data.total.toFixed(2)}\n`;
            });
        }

        if (trends) {
            response += `\n📊 Trend: ${trends.trend === 'up' ? '📈' : '📉'} ${trends.percentChange}% vs avg`;
        }

        return response;

    } catch (error) {
        console.error('Error handling spending query:', error.message);
        return "Couldn't fetch your spending data. Check if Plaid is set up correctly.";
    }
}

/**
 * Handle balance queries
 * @returns {Promise<string>} - Response
 */
async function handleBalanceQuery() {
    try {
        const accounts = await getBalances();

        if (accounts.length === 0) {
            return "No accounts linked. Make sure Plaid is configured!";
        }

        let response = '💳 Account Balances:\n\n';

        accounts.forEach(account => {
            const balance = account.balances.current || 0;
            const name = account.name || 'Unknown Account';
            response += `${name}: $${balance.toFixed(2)}\n`;
        });

        return response;

    } catch (error) {
        console.error('Error fetching balances:', error.message);
        return "Couldn't get your balances. Check your Plaid setup.";
    }
}

/**
 * Handle social media queries
 * @returns {Promise<string>} - Response
 */
async function handleSocialMediaQuery() {
    const summary = await checkSocialMediaUsage(null, true);
    return `📱 ${summary}`;
}

/**
 * Handle manual usage logging
 * @param {string} message - Log command
 * @returns {string} - Confirmation message
 */
function handleLogUsage(message) {
    // Parse: "log instagram 45" or "log tiktok 30"
    const parts = message.toLowerCase().split(' ');

    if (parts.length < 3) {
        return "Usage: log [platform] [minutes]\nExample: log instagram 45";
    }

    const platform = parts[1];
    const minutes = parseInt(parts[2]);

    if (isNaN(minutes)) {
        return "Minutes must be a number!";
    }

    const validPlatforms = ['instagram', 'twitter', 'tiktok', 'youtube'];
    if (!validPlatforms.includes(platform)) {
        return `Unknown platform. Use: ${validPlatforms.join(', ')}`;
    }

    const result = logUsage(platform, minutes);

    if (result.logged) {
        return `✅ Logged ${minutes} min on ${platform}. Total today: ${result.totalHours.toFixed(1)}h`;
    } else {
        return `❌ ${result.error}`;
    }
}

export { userMessageHistory };
