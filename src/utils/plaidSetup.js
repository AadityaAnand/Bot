import 'dotenv/config';
import { createLinkToken, exchangePublicToken } from '../services/plaid.js';
import readline from 'readline';

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

function question(query) {
    return new Promise(resolve => rl.question(query, resolve));
}

async function setupPlaid() {
    console.log('\n🏦 Plaid Account Setup\n');
    console.log('This utility will help you link your bank accounts.\n');

    try {
        // Step 1: Create Link Token
        console.log('Step 1: Creating Link Token...');
        const userId = 'user_' + Date.now();
        const linkToken = await createLinkToken(userId);

        console.log('\n✅ Link Token Created!\n');
        console.log('Step 2: Visit Plaid Link');
        console.log('========================================');
        console.log('Unfortunately, linking requires a web interface.');
        console.log('For now, you have two options:\n');

        console.log('Option 1: Use Plaid Sandbox (Testing)');
        console.log('- Go to: https://dashboard.plaid.com/');
        console.log('- Use sandbox credentials to test\n');

        console.log('Option 2: Build a Simple Web Interface');
        console.log('- Create a simple HTML page with Plaid Link');
        console.log('- Use this link token:', linkToken);
        console.log('- Exchange the public token you receive\n');

        const hasPublicToken = await question('Do you have a public token to exchange? (yes/no): ');

        if (hasPublicToken.toLowerCase() === 'yes') {
            const publicToken = await question('\nEnter your public token: ');

            console.log('\nExchanging token...');
            const accessToken = await exchangePublicToken(publicToken.trim());

            console.log('\n✅ Success! Your access token:');
            console.log(accessToken);
            console.log('\nAdd this to your .env file:');
            console.log(`PLAID_ACCESS_TOKEN=${accessToken}\n`);
        } else {
            console.log('\nNo problem! You can set this up later.');
            console.log('See the README for more details.\n');
        }

    } catch (error) {
        console.error('\n❌ Error:', error.message);
    } finally {
        rl.close();
    }
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
    setupPlaid();
}

export { setupPlaid };
