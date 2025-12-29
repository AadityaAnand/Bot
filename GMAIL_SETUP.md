# Gmail Integration Setup

Your bot can now check your Gmail and notify you about **truly important emails only** - filtering out newsletters, promotions, and spam automatically using AI.

## What It Does

✅ Checks Gmail every 2 hours (9am-9pm)
✅ Uses AI to identify important emails (urgent, from real people, requiring action)
✅ Sends WhatsApp notifications for important emails only
✅ You can also ask "check email" anytime

## Setup Steps

### 1. Create Google Cloud Project

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Click **Create Project** or select existing project
3. Name it something like "WhatsApp Bot"
4. Click **Create**

### 2. Enable Gmail API

1. In your project, go to **APIs & Services** → **Library**
2. Search for "Gmail API"
3. Click on it and click **Enable**

### 3. Create OAuth 2.0 Credentials

1. Go to **APIs & Services** → **Credentials**
2. Click **Create Credentials** → **OAuth client ID**
3. If prompted, configure OAuth consent screen:
   - User Type: **External**
   - App name: "WhatsApp Bot"
   - User support email: Your email
   - Developer contact: Your email
   - Scopes: Skip for now
   - Test users: Add your Gmail address
   - Click **Save and Continue** through the steps
4. Back to **Create OAuth client ID**:
   - Application type: **Desktop app**
   - Name: "WhatsApp Bot Desktop"
   - Click **Create**
5. Download the JSON file (click Download icon)

### 4. Install Credentials

1. Rename the downloaded file to `gmail-credentials.json`
2. Move it to your bot's `data` folder:
   ```bash
   mv ~/Downloads/client_secret_*.json /Users/aadityaanand/LocalDocuments/Bot/data/gmail-credentials.json
   ```

### 5. Authorize the Bot

Run the authorization script:

```bash
cd /Users/aadityaanand/LocalDocuments/Bot
node src/scripts/authorize-gmail.js
```

This will:
1. Print a URL - **Copy it**
2. Open the URL in your browser
3. Sign in with your Gmail account
4. Click **Continue** (even if it says "Google hasn't verified this app")
5. Click **Allow** to grant access
6. Copy the authorization code from the browser
7. Paste it back in the terminal
8. Press Enter

### 6. Restart the Bot

```bash
pm2 restart whatsapp-bot
```

Check logs to confirm:
```bash
pm2 logs whatsapp-bot --lines 20
```

You should see:
```
✅ Gmail connected successfully
```

## How to Use

### Automatic Checks
The bot checks your email every 2 hours (9am-9pm) and sends you WhatsApp messages about important emails.

### Manual Check
Send a message in your bot chat:
```
check email
```

or

```
important emails
```

### What Counts as "Important"?

The bot's AI filters for:
- ✅ Real people (not automated/marketing)
- ✅ Requires a response or action
- ✅ Time-sensitive or urgent
- ✅ Work-related deadlines/meetings
- ✅ Personal messages from people you know
- ✅ Bills, payments, financial matters

**NOT important:**
- ❌ Newsletters, promotions, marketing
- ❌ Social media notifications
- ❌ Automated confirmations (shipping, orders)
- ❌ Spam or promotional content
- ❌ Generic updates or announcements

## Troubleshooting

### "Gmail credentials not found"
- Make sure `gmail-credentials.json` is in the `data/` folder
- Check the filename is exactly `gmail-credentials.json`

### "Gmail token not found"
- Run the authorization script: `node src/scripts/authorize-gmail.js`
- Follow the steps to authorize

### "Couldn't check emails"
- Gmail might not be authorized
- Run: `node src/scripts/authorize-gmail.js`
- Or check if your token expired (re-authorize)

### "Google hasn't verified this app"
- This is normal for personal projects
- Click **Continue** → **Go to [App Name]**
- It's safe because it's YOUR app

### No emails showing up
- The AI might be filtering them as not important
- Check your unread emails manually to see if they truly need attention
- The bot is strict - it only alerts for REALLY important stuff

## Privacy & Security

- Your credentials stay on your Mac - never uploaded anywhere
- The bot only has READ access to your Gmail
- It cannot send emails or modify anything
- All email checking happens locally through Google's official API
- You can revoke access anytime at [Google Account](https://myaccount.google.com/permissions)

## Example

When you get an important email, you'll receive a WhatsApp message like:

```
📧 Important Emails Alert

You have 2 important emails that need attention:

*From:* John Doe <john@company.com>
*Subject:* Urgent: Project deadline moved to Friday
_Can we meet tomorrow to discuss the timeline changes?_

*From:* billing@service.com
*Subject:* Payment Due - Invoice #12345
_Your payment of $99.00 is due in 3 days..._
```

## Disable Gmail Feature

If you want to turn off Gmail checking:

1. Delete or rename the credentials file:
   ```bash
   mv data/gmail-credentials.json data/gmail-credentials.json.bak
   ```

2. Restart bot:
   ```bash
   pm2 restart whatsapp-bot
   ```

The bot will continue working without Gmail features.
