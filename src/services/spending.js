import { getTransactions, categorizeTransactions, isUnnecessarySpending } from './plaid.js';
import { generateSpendingAlert } from './personality.js';
import { sendToUser } from '../index.js';

let lastCheckedTransactionId = null;
const alertedTransactions = new Set();

/**
 * Analyze spending patterns
 * @returns {Promise<string>} - Summary of spending
 */
export async function analyzeSpending() {
    try {
        const transactions = await getTransactions(7);

        if (transactions.length === 0) {
            return 'No transactions found in the last 7 days.';
        }

        const { categories, total } = categorizeTransactions(transactions);

        let summary = `Total spent in last 7 days: $${total.toFixed(2)}\n\n`;

        Object.entries(categories)
            .sort((a, b) => b[1].total - a[1].total)
            .slice(0, 5)
            .forEach(([category, data]) => {
                summary += `${category}: $${data.total.toFixed(2)} (${data.count} transactions)\n`;
            });

        return summary;

    } catch (error) {
        console.error('Error analyzing spending:', error.message);
        return 'Error analyzing spending';
    }
}

/**
 * Check recent transactions and alert on unnecessary spending
 * @param {Object} client - WhatsApp client instance
 */
export async function checkRecentTransactions(client) {
    try {
        const transactions = await getTransactions(1); // Last 24 hours

        if (transactions.length === 0) {
            return;
        }

        // Sort by date, newest first
        transactions.sort((a, b) => new Date(b.date) - new Date(a.date));

        for (const transaction of transactions) {
            // Skip if we've already alerted about this transaction
            if (alertedTransactions.has(transaction.transaction_id)) {
                continue;
            }

            // Check if it's unnecessary spending
            if (isUnnecessarySpending(transaction)) {
                const amount = transaction.amount;
                const threshold = parseFloat(process.env.SPENDING_ALERT_THRESHOLD || 100);

                // Alert if above threshold
                if (amount >= threshold) {
                    const alert = await generateSpendingAlert({
                        amount: amount.toFixed(2),
                        category: transaction.category?.[0] || 'Unknown',
                        merchant: transaction.merchant_name || transaction.name,
                        date: transaction.date
                    });

                    if (client) {
                        await sendToUser(client, alert);
                    }

                    console.log(`💸 Spending alert sent for $${amount} at ${transaction.merchant_name}`);

                    // Mark as alerted
                    alertedTransactions.add(transaction.transaction_id);
                }
            }
        }

        // Clean up old alerted transactions (keep last 100)
        if (alertedTransactions.size > 100) {
            const arr = Array.from(alertedTransactions);
            alertedTransactions.clear();
            arr.slice(-100).forEach(id => alertedTransactions.add(id));
        }

    } catch (error) {
        console.error('Error checking recent transactions:', error.message);
    }
}

/**
 * Get spending summary for a specific period
 * @param {string} period - 'day', 'week', or 'month'
 * @returns {Promise<Object>} - Spending summary
 */
export async function getSpendingSummary(period = 'week') {
    const daysMap = {
        'day': 1,
        'week': 7,
        'month': 30
    };

    const days = daysMap[period] || 7;
    const transactions = await getTransactions(days);
    const { categories, total } = categorizeTransactions(transactions);

    return {
        period,
        days,
        total,
        categories,
        transactionCount: transactions.length
    };
}

/**
 * Identify spending trends
 * @returns {Promise<Object>} - Trend analysis
 */
export async function analyzeSpendingTrends() {
    try {
        const thisWeek = await getSpendingSummary('week');
        const thisMonth = await getSpendingSummary('month');

        const weeklyAverage = thisMonth.total / 4;
        const trend = thisWeek.total > weeklyAverage ? 'up' : 'down';
        const difference = Math.abs(thisWeek.total - weeklyAverage);
        const percentChange = (difference / weeklyAverage * 100).toFixed(1);

        return {
            thisWeek: thisWeek.total,
            weeklyAverage,
            trend,
            percentChange,
            topCategory: Object.entries(thisWeek.categories)
                .sort((a, b) => b[1].total - a[1].total)[0]
        };

    } catch (error) {
        console.error('Error analyzing spending trends:', error.message);
        return null;
    }
}

export { alertedTransactions };
