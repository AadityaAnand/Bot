# Setup Guide

Complete setup instructions for your Personal Assistant Bot.

## Prerequisites Checklist

- [ ] Node.js v18+ installed
- [ ] Ollama installed
- [ ] WhatsApp account
- [ ] Plaid account (free)

## Step-by-Step Setup

### 1. Install Dependencies

```bash
npm install
```

### 2. Set Up Ollama

Ollama is a free, local AI that powers the bot's personality.

```bash
# Install Ollama from https://ollama.ai
# Then pull a model:
ollama pull llama3.2

# Verify it's working:
ollama run llama3.2 "Hello"
```

**Alternative models:**
- `llama3.2` (Recommended, 3GB)
- `llama3.2:1b` (Faster, smaller, 1.3GB)
- `mistral` (Good alternative, 4GB)

### 3. Configure Environment Variables

```bash
cp .env.example .env
```

Edit `.env` with your settings:

```bash
# Required - Your phone number
AUTHORIZED_USER_NUMBER=1234567890

# Ollama (default works if Ollama is running)
OLLAMA_BASE_URL=http://localhost:11434
OLLAMA_MODEL=llama3.2

# Plaid (get from https://dashboard.plaid.com/)
PLAID_CLIENT_ID=your_client_id_here
PLAID_SECRET=your_sandbox_secret_here
PLAID_ENV=sandbox

# Optional - Customize thresholds
MAX_SOCIAL_MEDIA_HOURS_PER_DAY=2
SPENDING_ALERT_THRESHOLD=100
UNNECESSARY_SPENDING_CATEGORIES=entertainment,dining,shopping
```

### 4. Set Up Plaid (Financial Tracking)

#### 4a. Create Plaid Account

1. Go to https://dashboard.plaid.com/signup
2. Sign up for free (Sandbox is free forever)
3. Create an application
4. Get your `PLAID_CLIENT_ID` and `PLAID_SECRET`
5. Add them to your `.env` file

#### 4b. Link Your Bank Account

**Option 1: Using the Web Interface (Easiest)**

1. Start the Plaid setup utility:
```bash
node src/utils/plaidSetup.js
```

2. Open `plaid-link.html` in your browser
3. Enter the link token from step 1
4. Click "Connect Bank Account"
5. Follow Plaid's flow to link your account
6. Copy the public token shown
7. Paste it into the setup utility
8. Copy the access token to your `.env` file

**Option 2: Using Sandbox (Testing Only)**

For testing without real bank accounts:

1. In `.env`, set `PLAID_ENV=sandbox`
2. Use these sandbox credentials in the link flow:
   - Username: `user_good`
   - Password: `pass_good`
3. This gives you fake transaction data to test with

### 5. Set Up Social Media APIs (Optional)

The bot will work without these, but you'll need to log usage manually.

#### Instagram

1. Create a Facebook Developer account
2. Create an app with Instagram Basic Display
3. Get your access token
4. Add to `.env`: `INSTAGRAM_ACCESS_TOKEN=your_token`

#### Twitter/X

1. Go to https://developer.twitter.com/
2. Create a developer account and app
3. Get your Bearer Token
4. Add to `.env`: `TWITTER_BEARER_TOKEN=your_token`

#### YouTube

1. Go to https://console.cloud.google.com/
2. Create a project and enable YouTube Data API v3
3. Create API credentials
4. Add to `.env`: `YOUTUBE_API_KEY=your_key`

**Note:** TikTok doesn't have easy API access. You'll need to log usage manually.

### 6. Start the Bot

```bash
npm start
```

You'll see a QR code. Scan it with WhatsApp on your phone:

1. Open WhatsApp
2. Go to Settings → Linked Devices
3. Tap "Link a Device"
4. Scan the QR code

The bot should connect and say "Bot is ready!"

## Using the Bot

### Commands

Send these messages to interact with the bot:

- **"help"** - See all commands
- **"spending"** - View spending summary
- **"balance"** - Check account balances
- **"social media"** - See usage summary
- **"log instagram 45"** - Log 45 minutes on Instagram
- **"learn my style"** - Analyze your texting style
- **"reset"** - Clear conversation history

### Automatic Monitoring

The bot will automatically:

- ✅ Check spending every hour
- ✅ Monitor social media every 2 hours (8am-11pm)
- ✅ Send a daily summary at 9 PM
- ✅ Alert you about unnecessary spending
- ✅ Call you out for excessive social media use

### Manual Social Media Logging

Since social media APIs are limited, log your usage:

```
log instagram 30
log tiktok 45
log youtube 60
log twitter 20
```

## Troubleshooting

### Bot won't connect to WhatsApp

- Make sure WhatsApp Web works in your browser first
- Try deleting `.wwebjs_auth` folder and rescanning
- Check you're not already connected on another device

### Ollama errors

```bash
# Check if Ollama is running:
curl http://localhost:11434

# If not, start it:
ollama serve

# Pull the model again:
ollama pull llama3.2
```

### Plaid errors

- Check your credentials in `.env`
- Make sure you're using sandbox mode for testing
- Verify your access token is correct

### No spending alerts

- Make sure `PLAID_ACCESS_TOKEN` is set in `.env`
- Check `SPENDING_ALERT_THRESHOLD` (default is $100)
- Verify `UNNECESSARY_SPENDING_CATEGORIES` is set

## Production Deployment

⚠️ **Important Notes:**

1. **Plaid Production**: Sandbox is free, but production requires a paid plan and compliance review
2. **WhatsApp**: This uses unofficial WhatsApp Web automation. Not approved by WhatsApp.
3. **Security**: Keep your `.env` file secure. Never commit it to git.

For production use, consider:
- Running on a VPS or cloud server
- Using a process manager like PM2
- Setting up proper logging
- Implementing database storage for persistence
- Building a proper web interface for Plaid linking

## Next Steps

1. Chat with your bot to train it on your texting style
2. Link your real accounts (or use sandbox for testing)
3. Set your usage thresholds in `.env`
4. Let the bot keep you accountable!

Need help? Check the main README or create an issue.
