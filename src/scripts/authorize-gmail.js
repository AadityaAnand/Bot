import { google } from 'googleapis';
import fs from 'fs';
import path from 'path';
import readline from 'readline';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const SCOPES = ['https://www.googleapis.com/auth/gmail.readonly'];
const TOKEN_PATH = path.join(process.cwd(), 'data', 'gmail-token.json');
const CREDENTIALS_PATH = path.join(process.cwd(), 'data', 'gmail-credentials.json');

async function authorize() {
    // Check if credentials exist
    if (!fs.existsSync(CREDENTIALS_PATH)) {
        console.log('\n❌ Gmail credentials not found!\n');
        console.log('To set up Gmail integration:\n');
        console.log('1. Go to https://console.cloud.google.com/');
        console.log('2. Create a new project or select existing one');
        console.log('3. Enable Gmail API');
        console.log('4. Go to Credentials → Create OAuth 2.0 Client ID');
        console.log('5. Application type: Desktop app');
        console.log('6. Download the credentials JSON file');
        console.log('7. Save it as: data/gmail-credentials.json\n');
        process.exit(1);
    }

    const credentials = JSON.parse(fs.readFileSync(CREDENTIALS_PATH, 'utf8'));
    const { client_secret, client_id, redirect_uris } = credentials.installed || credentials.web;
    const oAuth2Client = new google.auth.OAuth2(client_id, client_secret, redirect_uris[0]);

    // Get authorization URL
    const authUrl = oAuth2Client.generateAuthUrl({
        access_type: 'offline',
        scope: SCOPES,
    });

    console.log('\n📧 Gmail Authorization\n');
    console.log('Open this URL in your browser:\n');
    console.log(authUrl);
    console.log('\n');

    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout,
    });

    rl.question('Enter the authorization code from the browser: ', async (code) => {
        rl.close();

        try {
            const { tokens } = await oAuth2Client.getToken(code);
            oAuth2Client.setCredentials(tokens);

            // Save token
            fs.writeFileSync(TOKEN_PATH, JSON.stringify(tokens, null, 2));
            console.log('\n✅ Token saved successfully!\n');
            console.log('Gmail integration is now active.');
            console.log('Restart your bot to enable Gmail features.\n');
        } catch (error) {
            console.error('\n❌ Error getting token:', error.message);
            process.exit(1);
        }
    });
}

authorize();
