import { generateResponse, analyzeTextingStyle, resetContext } from '../services/personality.js';
import { analyzeSpending, getSpendingSummary, analyzeSpendingTrends } from '../services/spending.js';
import { getBalances } from '../services/plaid.js';
import { setBudget, getBudgetSummary, checkBudget } from '../services/budget.js';
import { createReminder, deleteReminder, getReminderSummary } from '../services/reminders.js';
import { logActivity, getTodayActivities, generateDailySummary, generateWeeklySummary } from '../services/activity.js';
import { getImportantEmails } from '../services/gmail.js';

// Store user messages for style analysis
const userMessageHistory = [];

/**
 * Handle incoming WhatsApp messages
 * @param {Object} client - WhatsApp client
 * @param {Object} message - WhatsApp message object
 */
// Track bot's own responses to avoid infinite loops
const botResponses = new Set();

export async function handleMessage(client, message) {
    try {
        // If this is a message from you (fromMe = true), process it
        if (message.fromMe) {
            const messageBody = message.body.trim();

            // Skip if this is a bot response we just sent
            if (botResponses.has(messageBody)) {
                console.log('🤖 Skipping bot\'s own response');
                botResponses.delete(messageBody); // Clean up
                return;
            }

            // Check if we should only respond in a specific chat
            const botChatId = process.env.BOT_CHAT_ID;
            if (botChatId && botChatId.trim() !== '') {
                // Only respond in the designated chat
                // Use 'to' field for groups, 'from' for direct messages
                const currentChatId = message.to || message.from;
                console.log(`🔍 Current chat: ${currentChatId}, Allowed chat: ${botChatId}`);

                if (currentChatId !== botChatId) {
                    console.log('⏭️  Skipping - not in designated bot chat');
                    return;
                }
            }

            console.log('✅ Processing your own message');
            console.log(`📨 Your message: "${messageBody}"`);

            // Check for commands and respond
            const response = await processCommand(messageBody, client);
            if (response) {
                // Add bot prefix so you can tell it's the bot responding
                const botResponse = `🤖 ${response}`;

                // Track this response to avoid processing it again
                botResponses.add(botResponse);

                // Send to the same chat
                await message.reply(botResponse);
                console.log(`✅ Sent: "${botResponse.substring(0, 50)}..."`);

                // Clean up old responses (keep last 10)
                if (botResponses.size > 10) {
                    const arr = Array.from(botResponses);
                    botResponses.clear();
                    arr.slice(-10).forEach(r => botResponses.add(r));
                }
            }
            return;
        }

        // Otherwise, check if it's from authorized user
        const authorizedNumber = process.env.AUTHORIZED_USER_NUMBER;
        if (!authorizedNumber) {
            console.log('⚠️  No authorized user configured');
            return;
        }

        // Debug: Show what we're receiving
        console.log(`🔍 Message from: ${message.from}`);
        console.log(`🔍 Authorized number: ${authorizedNumber}`);

        const senderNumber = message.from.replace('@c.us', '').replace('@g.us', '');
        console.log(`🔍 Cleaned sender: ${senderNumber}`);

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

    // Activity logging commands
    if (lower.includes('worked on') || lower.includes('meeting with') || lower.includes('did ')) {
        return handleActivityLog(messageBody);
    }

    // Daily summary
    if (lower.includes('daily summary') || lower === 'summary') {
        return generateDailySummary();
    }

    // Weekly summary
    if (lower.includes('weekly summary') || lower === 'week summary') {
        return generateWeeklySummary();
    }

    // Email check
    if (lower.includes('check email') || lower.includes('important email')) {
        return await handleEmailCheck();
    }

    // Budget commands
    if (lower.includes('budget')) {
        return await handleBudgetCommand(messageBody);
    }

    // Reminder commands
    if (lower.includes('remind') || lower.includes('reminder')) {
        return handleReminderCommand(messageBody);
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

📊 Productivity:
- Just tell me what you did! I'll log it
  Example: "worked on project X for 2 hours"
  Example: "meeting with the team"
- "summary" or "daily summary" - Today's recap
- "weekly summary" - This week's overview

📧 Email:
- "check email" - See important emails only
- Auto-checks every 2 hours (9am-9pm)

💰 Finance:
- "spending" - See spending summary
- "balance" - Check account balances
- "budget" - View all budgets
- "set budget [period] [amount]" - Set budget
  Example: "set budget daily 50"

⏰ Reminders:
- "remind me [message] at [time]" - Set reminder
  Example: "remind me workout at 18:00"
- "reminders" - View all reminders
- "delete reminder [id]" - Delete a reminder

🤖 Bot Commands:
- "learn my style" - Analyze your texting
- "reset" - Clear conversation history
- "help" - This message

Just chat naturally! I'll track everything and keep you accountable.`;
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
 * Handle activity logging
 * @param {string} message - Activity message
 * @returns {string} - Confirmation message
 */
function handleActivityLog(message) {
    // Use AI to extract activity details
    // For now, just log the whole message as activity
    logActivity(message);

    return `✅ Activity logged! I'll include this in your daily summary.`;
}

/**
 * Check important emails
 * @returns {Promise<string>} - Email summary
 */
async function handleEmailCheck() {
    try {
        const emails = await getImportantEmails();

        if (emails.length === 0) {
            return "📧 No important emails right now. You're all caught up!";
        }

        let response = `📧 You have ${emails.length} important email${emails.length > 1 ? 's' : ''}:\n\n`;

        for (const email of emails.slice(0, 5)) {
            response += `*From:* ${email.from}\n`;
            response += `*Subject:* ${email.subject}\n`;
            response += `_${email.snippet}_\n\n`;
        }

        if (emails.length > 5) {
            response += `_...and ${emails.length - 5} more_`;
        }

        return response;
    } catch (error) {
        return "📧 Couldn't check emails. Make sure Gmail is set up! Run: node src/scripts/authorize-gmail.js";
    }
}

/**
 * Handle budget commands
 * @param {string} message - Budget command
 * @returns {Promise<string>} - Response message
 */
async function handleBudgetCommand(message) {
    const lower = message.toLowerCase();

    // Set budget command
    if (lower.startsWith('set budget')) {
        // Parse: "set budget daily 50" or "set budget entertainment 100"
        const parts = message.split(' ');

        if (parts.length < 4) {
            return "Usage: set budget [period/category] [amount]\nExample: set budget daily 50";
        }

        const period = parts[2].toLowerCase();
        const amount = parseFloat(parts[3]);

        if (isNaN(amount) || amount <= 0) {
            return "Amount must be a positive number!";
        }

        setBudget(period, amount);
        return `✅ Set ${period} budget to $${amount.toFixed(2)}`;
    }

    // Check specific budget
    if (lower.includes('daily budget') || lower.includes('weekly budget') || lower.includes('monthly budget')) {
        let period = 'daily';
        if (lower.includes('weekly')) period = 'weekly';
        if (lower.includes('monthly')) period = 'monthly';

        const status = await checkBudget(period);

        if (status.status === 'no_budget_set') {
            return `No ${period} budget set. Use "set budget ${period} [amount]" to create one.`;
        }

        const emoji = status.status === 'over_budget' ? '🔴' : status.status === 'warning' ? '🟡' : '🟢';
        return `${emoji} ${period.charAt(0).toUpperCase() + period.slice(1)} Budget:\n` +
               `Spent: $${status.spent.toFixed(2)} / $${status.budget}\n` +
               `Remaining: $${status.remaining.toFixed(2)}\n` +
               `Used: ${status.percentUsed}%`;
    }

    // Show all budgets
    return await getBudgetSummary();
}

/**
 * Handle reminder commands
 * @param {string} message - Reminder command
 * @returns {string} - Response message
 */
function handleReminderCommand(message) {
    const lower = message.toLowerCase();

    // List reminders
    if (lower === 'reminders' || lower === 'list reminders' || lower === 'show reminders') {
        return getReminderSummary();
    }

    // Delete reminder
    if (lower.startsWith('delete reminder')) {
        const parts = message.split(' ');
        const id = parseInt(parts[2]);

        if (isNaN(id)) {
            return "Usage: delete reminder [id]\nExample: delete reminder 1";
        }

        const success = deleteReminder(id);
        if (success) {
            return `✅ Deleted reminder #${id}`;
        } else {
            return `❌ Reminder #${id} not found`;
        }
    }

    // Create interval reminder - "remind me [message] every [N] hours from [start] to [end]"
    const intervalMatch = message.match(/remind me (.+) every (\d+) hours? from (\d{1,2}:\d{2}) to (\d{1,2}:\d{2})/i);
    if (intervalMatch) {
        const reminderMessage = intervalMatch[1].trim();
        const intervalHours = parseInt(intervalMatch[2]);
        const startTime = intervalMatch[3];
        const endTime = intervalMatch[4];

        try {
            createReminder(reminderMessage, 'interval', 'interval', null, {
                startTime,
                endTime,
                intervalHours
            });

            return `✅ Interval reminder set!\n` +
                   `Message: ${reminderMessage}\n` +
                   `Every: ${intervalHours} hour(s)\n` +
                   `From: ${startTime} to ${endTime}\n` +
                   `Active immediately!`;
        } catch (error) {
            return `❌ Error: ${error.message}`;
        }
    }

    // Create reminder - "remind me [message] at [time]"
    if (lower.startsWith('remind me')) {
        const match = message.match(/remind me (.+) at (\d{1,2}:\d{2})/i);

        if (!match) {
            return "Usage:\n" +
                   "remind me [message] at [time]\n" +
                   "remind me [message] every [N] hours from [start] to [end]\n\n" +
                   "Examples:\n" +
                   "remind me workout at 18:00\n" +
                   "remind me walk every 1 hour from 10:00 to 20:00";
        }

        const reminderMessage = match[1].trim();
        const time = match[2];

        try {
            // Check if it includes frequency
            let frequency = 'once';
            if (lower.includes('daily') || lower.includes('every day')) {
                frequency = 'daily';
            } else if (lower.includes('weekly') || lower.includes('every week')) {
                frequency = 'weekly';
            }

            createReminder(reminderMessage, time, frequency);

            return `✅ Reminder set!\n` +
                   `Message: ${reminderMessage}\n` +
                   `Time: ${time}\n` +
                   `Frequency: ${frequency}\n` +
                   `Active immediately!`;
        } catch (error) {
            return `❌ Error: ${error.message}`;
        }
    }

    return "Try:\n" +
           "'remind me [message] at [time]'\n" +
           "'remind me [message] every [N] hours from [start] to [end]'\n" +
           "'reminders' to view all";
}

export { userMessageHistory };
