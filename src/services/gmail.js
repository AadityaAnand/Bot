import { google } from 'googleapis';
import fs from 'fs';
import path from 'path';
import { generateResponse } from './personality.js';

const SCOPES = ['https://www.googleapis.com/auth/gmail.readonly'];
const TOKEN_PATH = path.join(process.cwd(), 'data', 'gmail-token.json');
const CREDENTIALS_PATH = path.join(process.cwd(), 'data', 'gmail-credentials.json');

let gmailClient = null;

/**
 * Load or initialize Gmail client
 */
export async function initializeGmail() {
    try {
        // Check if credentials file exists
        if (!fs.existsSync(CREDENTIALS_PATH)) {
            console.log('⚠️  Gmail credentials not found. Gmail features disabled.');
            console.log('   To enable Gmail: Place credentials.json in data/gmail-credentials.json');
            return false;
        }

        const credentials = JSON.parse(fs.readFileSync(CREDENTIALS_PATH, 'utf8'));
        const { client_secret, client_id, redirect_uris } = credentials.installed || credentials.web;
        const oAuth2Client = new google.auth.OAuth2(client_id, client_secret, redirect_uris[0]);

        // Check if we have a token saved
        if (fs.existsSync(TOKEN_PATH)) {
            const token = JSON.parse(fs.readFileSync(TOKEN_PATH, 'utf8'));
            oAuth2Client.setCredentials(token);
            gmailClient = google.gmail({ version: 'v1', auth: oAuth2Client });
            console.log('✅ Gmail connected successfully\n');
            return true;
        } else {
            console.log('⚠️  Gmail token not found. Please authorize:');
            console.log(`   Run: node src/scripts/authorize-gmail.js\n`);
            return false;
        }
    } catch (error) {
        console.error('❌ Gmail initialization error:', error.message);
        return false;
    }
}

/**
 * Get unread emails from the last 24 hours
 */
export async function getUnreadEmails() {
    if (!gmailClient) {
        console.log('Gmail not initialized');
        return [];
    }

    try {
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        const query = `is:unread after:${Math.floor(yesterday.getTime() / 1000)}`;

        const response = await gmailClient.users.messages.list({
            userId: 'me',
            q: query,
            maxResults: 50
        });

        const messages = response.data.messages || [];
        const emails = [];

        for (const message of messages) {
            const email = await gmailClient.users.messages.get({
                userId: 'me',
                id: message.id,
                format: 'full'
            });

            const headers = email.data.payload.headers;
            const subject = headers.find(h => h.name === 'Subject')?.value || '(No Subject)';
            const from = headers.find(h => h.name === 'From')?.value || 'Unknown';
            const date = headers.find(h => h.name === 'Date')?.value || '';

            // Get email body
            let body = '';
            if (email.data.payload.parts) {
                const textPart = email.data.payload.parts.find(part => part.mimeType === 'text/plain');
                if (textPart && textPart.body.data) {
                    body = Buffer.from(textPart.body.data, 'base64').toString('utf-8');
                }
            } else if (email.data.payload.body.data) {
                body = Buffer.from(email.data.payload.body.data, 'base64').toString('utf-8');
            }

            // Truncate body for AI analysis (first 500 chars)
            body = body.substring(0, 500);

            emails.push({
                id: message.id,
                subject,
                from,
                date,
                body,
                snippet: email.data.snippet
            });
        }

        return emails;
    } catch (error) {
        console.error('Error fetching emails:', error.message);
        return [];
    }
}

/**
 * Use AI to determine if an email is important
 */
async function isEmailImportant(email) {
    const prompt = `Analyze this email and determine if it's TRULY IMPORTANT and needs immediate attention.

From: ${email.from}
Subject: ${email.subject}
Preview: ${email.snippet}

Criteria for IMPORTANT emails:
- From a real person (not automated/marketing)
- Requires a response or action
- Time-sensitive or urgent
- Work-related deadlines or meetings
- Personal messages from people you know
- Bills, payments, or financial matters

NOT important:
- Newsletters, promotions, marketing
- Social media notifications
- Automated confirmations (order shipped, etc.)
- Spam or promotional content
- Generic updates or announcements

Respond with ONLY "YES" if it's important, or "NO" if it's not. Be strict - only say YES for emails that truly need attention.`;

    const response = await generateResponse(prompt);
    const answer = response.trim().toUpperCase();

    return answer.includes('YES');
}

/**
 * Filter emails to only show important ones
 */
export async function getImportantEmails() {
    const emails = await getUnreadEmails();

    if (emails.length === 0) {
        return [];
    }

    console.log(`📧 Analyzing ${emails.length} unread emails...`);

    const importantEmails = [];

    for (const email of emails) {
        const important = await isEmailImportant(email);
        if (important) {
            importantEmails.push(email);
        }
    }

    console.log(`   ✅ Found ${importantEmails.length} important emails\n`);
    return importantEmails;
}

/**
 * Check emails and notify about important ones
 */
export async function checkImportantEmails(client) {
    if (!gmailClient) {
        return;
    }

    try {
        const importantEmails = await getImportantEmails();

        if (importantEmails.length === 0) {
            console.log('📧 No important emails to report');
            return;
        }

        // Format message
        let message = `📧 *Important Emails Alert*\n\n`;
        message += `You have ${importantEmails.length} important email${importantEmails.length > 1 ? 's' : ''} that need attention:\n\n`;

        for (const email of importantEmails.slice(0, 5)) { // Max 5 emails
            message += `*From:* ${email.from}\n`;
            message += `*Subject:* ${email.subject}\n`;
            message += `_${email.snippet}_\n\n`;
        }

        if (importantEmails.length > 5) {
            message += `_...and ${importantEmails.length - 5} more_\n`;
        }

        // Send to bot chat
        const botChatId = process.env.BOT_CHAT_ID;
        if (botChatId) {
            await client.sendMessage(botChatId, message);
            console.log(`✅ Sent important emails notification`);
        }
    } catch (error) {
        console.error('Error checking important emails:', error.message);
    }
}

export default {
    initializeGmail,
    getUnreadEmails,
    getImportantEmails,
    checkImportantEmails
};
