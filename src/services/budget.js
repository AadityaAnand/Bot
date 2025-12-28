import { getTransactions, categorizeTransactions } from './plaid.js';
import { generateResponse } from './personality.js';
import { sendToUser } from '../index.js';

// Budget storage (in production, use a database)
const budgets = {
    daily: null,
    weekly: null,
    monthly: null,
    categories: {}
};

/**
 * Set a budget
 * @param {string} period - 'daily', 'weekly', 'monthly', or category name
 * @param {number} amount - Budget amount
 */
export function setBudget(period, amount) {
    const validPeriods = ['daily', 'weekly', 'monthly'];

    if (validPeriods.includes(period)) {
        budgets[period] = amount;
        console.log(`💵 Set ${period} budget to $${amount}`);
    } else {
        // It's a category budget
        budgets.categories[period.toLowerCase()] = amount;
        console.log(`💵 Set ${period} category budget to $${amount}`);
    }

    return {
        period,
        amount,
        set: true
    };
}

/**
 * Get current budgets
 * @returns {Object} - All budget settings
 */
export function getBudgets() {
    return {
        daily: budgets.daily,
        weekly: budgets.weekly,
        monthly: budgets.monthly,
        categories: { ...budgets.categories }
    };
}

/**
 * Check if spending is within budget
 * @param {string} period - 'daily', 'weekly', or 'monthly'
 * @returns {Promise<Object>} - Budget status
 */
export async function checkBudget(period = 'daily') {
    const daysMap = {
        'daily': 1,
        'weekly': 7,
        'monthly': 30
    };

    const days = daysMap[period] || 1;
    const budget = budgets[period];

    if (!budget) {
        return {
            period,
            budget: null,
            spent: 0,
            remaining: 0,
            percentUsed: 0,
            status: 'no_budget_set'
        };
    }

    const transactions = await getTransactions(days);
    const { total } = categorizeTransactions(transactions);

    const remaining = budget - total;
    const percentUsed = (total / budget) * 100;

    let status = 'good';
    if (percentUsed >= 100) {
        status = 'over_budget';
    } else if (percentUsed >= 80) {
        status = 'warning';
    }

    return {
        period,
        budget,
        spent: total,
        remaining,
        percentUsed: percentUsed.toFixed(1),
        status
    };
}

/**
 * Check category budgets
 * @returns {Promise<Array>} - Status of all category budgets
 */
export async function checkCategoryBudgets() {
    const transactions = await getTransactions(30); // Last 30 days
    const { categories } = categorizeTransactions(transactions);

    const results = [];

    for (const [categoryName, budgetAmount] of Object.entries(budgets.categories)) {
        let spent = 0;

        // Find matching category in transactions
        for (const [transCategory, data] of Object.entries(categories)) {
            if (transCategory.toLowerCase().includes(categoryName)) {
                spent = data.total;
                break;
            }
        }

        const remaining = budgetAmount - spent;
        const percentUsed = (spent / budgetAmount) * 100;

        let status = 'good';
        if (percentUsed >= 100) {
            status = 'over_budget';
        } else if (percentUsed >= 80) {
            status = 'warning';
        }

        results.push({
            category: categoryName,
            budget: budgetAmount,
            spent,
            remaining,
            percentUsed: percentUsed.toFixed(1),
            status
        });
    }

    return results;
}

/**
 * Send budget alert if over budget
 * @param {Object} client - WhatsApp client
 */
export async function checkBudgetAlerts(client) {
    // Check daily budget
    if (budgets.daily) {
        const dailyStatus = await checkBudget('daily');

        if (dailyStatus.status === 'over_budget') {
            const alert = await generateResponse(
                `The user has spent $${dailyStatus.spent.toFixed(2)} today, which is over their $${dailyStatus.budget} daily budget. Roast them for going over budget.`
            );
            await sendToUser(client, `🤖 💸 ${alert}`);
        } else if (dailyStatus.status === 'warning') {
            const alert = await generateResponse(
                `The user has spent $${dailyStatus.spent.toFixed(2)} today (${dailyStatus.percentUsed}% of their $${dailyStatus.budget} daily budget). Warn them they're getting close to their limit.`
            );
            await sendToUser(client, `🤖 ⚠️ ${alert}`);
        }
    }

    // Check category budgets
    const categoryStatuses = await checkCategoryBudgets();
    for (const catStatus of categoryStatuses) {
        if (catStatus.status === 'over_budget') {
            const alert = await generateResponse(
                `The user has spent $${catStatus.spent.toFixed(2)} on ${catStatus.category} this month, which is over their $${catStatus.budget} budget for that category. Call them out on it.`
            );
            await sendToUser(client, `🤖 💸 ${alert}`);
        }
    }
}

/**
 * Get budget summary for display
 * @returns {Promise<string>} - Formatted budget summary
 */
export async function getBudgetSummary() {
    let summary = '💰 Budget Summary:\n\n';

    // Daily budget
    if (budgets.daily) {
        const daily = await checkBudget('daily');
        const emoji = daily.status === 'over_budget' ? '🔴' : daily.status === 'warning' ? '🟡' : '🟢';
        summary += `${emoji} Daily: $${daily.spent.toFixed(2)} / $${daily.budget} (${daily.percentUsed}%)\n`;
    }

    // Weekly budget
    if (budgets.weekly) {
        const weekly = await checkBudget('weekly');
        const emoji = weekly.status === 'over_budget' ? '🔴' : weekly.status === 'warning' ? '🟡' : '🟢';
        summary += `${emoji} Weekly: $${weekly.spent.toFixed(2)} / $${weekly.budget} (${weekly.percentUsed}%)\n`;
    }

    // Monthly budget
    if (budgets.monthly) {
        const monthly = await checkBudget('monthly');
        const emoji = monthly.status === 'over_budget' ? '🔴' : monthly.status === 'warning' ? '🟡' : '🟢';
        summary += `${emoji} Monthly: $${monthly.spent.toFixed(2)} / $${monthly.budget} (${monthly.percentUsed}%)\n`;
    }

    // Category budgets
    const categories = await checkCategoryBudgets();
    if (categories.length > 0) {
        summary += '\nCategory Budgets:\n';
        for (const cat of categories) {
            const emoji = cat.status === 'over_budget' ? '🔴' : cat.status === 'warning' ? '🟡' : '🟢';
            summary += `${emoji} ${cat.category}: $${cat.spent.toFixed(2)} / $${cat.budget}\n`;
        }
    }

    if (!budgets.daily && !budgets.weekly && !budgets.monthly && Object.keys(budgets.categories).length === 0) {
        summary = 'No budgets set yet. Use "set budget [period] [amount]" to create one.';
    }

    return summary;
}

export { budgets };
