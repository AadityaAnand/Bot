import { Configuration, PlaidApi, PlaidEnvironments } from 'plaid';

let plaidClient = null;
let accessToken = null;

/**
 * Initialize Plaid client
 */
export async function initializePlaid() {
    try {
        const configuration = new Configuration({
            basePath: PlaidEnvironments[process.env.PLAID_ENV || 'sandbox'],
            baseOptions: {
                headers: {
                    'PLAID-CLIENT-ID': process.env.PLAID_CLIENT_ID,
                    'PLAID-SECRET': process.env.PLAID_SECRET,
                },
            },
        });

        plaidClient = new PlaidApi(configuration);
        console.log('✅ Plaid client initialized');

        // Note: In a real app, you'd retrieve the access token from your database
        // For now, we'll use an environment variable (you'll need to link an account first)
        accessToken = process.env.PLAID_ACCESS_TOKEN;

        if (!accessToken) {
            console.log('⚠️  No Plaid access token found. You need to link a bank account.');
            console.log('   Run the link flow first to get an access token.');
        }

    } catch (error) {
        console.error('❌ Error initializing Plaid:', error.message);
    }
}

/**
 * Create a Link token for account linking
 * @param {string} userId - User identifier
 * @returns {Promise<string>} - Link token
 */
export async function createLinkToken(userId) {
    try {
        const response = await plaidClient.linkTokenCreate({
            user: { client_user_id: userId },
            client_name: 'Personal Assistant Bot',
            products: ['transactions', 'auth'],
            country_codes: ['US'],
            language: 'en',
        });

        return response.data.link_token;
    } catch (error) {
        console.error('Error creating link token:', error.message);
        throw error;
    }
}

/**
 * Exchange public token for access token
 * @param {string} publicToken - Public token from Link
 * @returns {Promise<string>} - Access token
 */
export async function exchangePublicToken(publicToken) {
    try {
        const response = await plaidClient.itemPublicTokenExchange({
            public_token: publicToken,
        });

        accessToken = response.data.access_token;
        console.log('✅ Access token obtained. Add this to your .env file:');
        console.log(`PLAID_ACCESS_TOKEN=${accessToken}`);

        return accessToken;
    } catch (error) {
        console.error('Error exchanging public token:', error.message);
        throw error;
    }
}

/**
 * Get recent transactions
 * @param {number} days - Number of days to look back
 * @returns {Promise<Array>} - Array of transactions
 */
export async function getTransactions(days = 7) {
    if (!accessToken) {
        console.log('⚠️  No access token available');
        return [];
    }

    try {
        const endDate = new Date();
        const startDate = new Date();
        startDate.setDate(startDate.getDate() - days);

        const response = await plaidClient.transactionsGet({
            access_token: accessToken,
            start_date: startDate.toISOString().split('T')[0],
            end_date: endDate.toISOString().split('T')[0],
        });

        return response.data.transactions;
    } catch (error) {
        console.error('Error fetching transactions:', error.message);
        return [];
    }
}

/**
 * Get account balances
 * @returns {Promise<Array>} - Array of accounts with balances
 */
export async function getBalances() {
    if (!accessToken) {
        console.log('⚠️  No access token available');
        return [];
    }

    try {
        const response = await plaidClient.accountsBalanceGet({
            access_token: accessToken,
        });

        return response.data.accounts;
    } catch (error) {
        console.error('Error fetching balances:', error.message);
        return [];
    }
}

/**
 * Categorize transactions for analysis
 * @param {Array} transactions - Array of transactions
 * @returns {Object} - Categorized spending data
 */
export function categorizeTransactions(transactions) {
    const categories = {};
    let total = 0;

    transactions.forEach(transaction => {
        if (transaction.amount > 0) { // Positive amount = money out
            const category = transaction.category?.[0] || 'Uncategorized';

            if (!categories[category]) {
                categories[category] = {
                    total: 0,
                    count: 0,
                    transactions: []
                };
            }

            categories[category].total += transaction.amount;
            categories[category].count += 1;
            categories[category].transactions.push(transaction);
            total += transaction.amount;
        }
    });

    return { categories, total };
}

/**
 * Check if a transaction is unnecessary based on category
 * @param {Object} transaction - Transaction object
 * @returns {boolean} - Whether transaction is flagged as unnecessary
 */
export function isUnnecessarySpending(transaction) {
    const unnecessaryCategories = (process.env.UNNECESSARY_SPENDING_CATEGORIES || '')
        .toLowerCase()
        .split(',')
        .map(c => c.trim());

    if (unnecessaryCategories.length === 0) {
        return false;
    }

    const transactionCategory = transaction.category?.[0]?.toLowerCase() || '';

    return unnecessaryCategories.some(cat =>
        transactionCategory.includes(cat)
    );
}

export { plaidClient, accessToken };
