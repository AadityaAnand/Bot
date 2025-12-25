# Personal Assistant WhatsApp Bot

A sassy, passionate personal assistant bot that helps you stay productive by monitoring your finances, social media usage, and keeping you accountable.

## Features

- **Financial Monitoring**: Tracks spending across bank accounts and credit cards via Plaid
- **Social Media Tracking**: Monitors time spent on Instagram, Twitter/X, TikTok, and YouTube
- **Productivity Enforcement**: Sends sassy reminders when you're wasting time or money
- **Personality**: Uses Ollama (local AI) to mimic your texting style and be your passionate accountability partner

## Prerequisites

1. **Node.js** (v18 or higher)
2. **Ollama** installed locally ([https://ollama.ai](https://ollama.ai))
3. **Plaid Account** (free sandbox for testing: [https://dashboard.plaid.com/](https://dashboard.plaid.com/))
4. **WhatsApp** on your phone

## Setup

1. Install dependencies:
```bash
npm install
```

2. Set up Ollama:
```bash
# Install Ollama, then pull a model
ollama pull llama3.2
```

3. Copy `.env.example` to `.env` and fill in your credentials:
```bash
cp .env.example .env
```

4. Start the bot:
```bash
npm start
```

5. Scan the QR code with WhatsApp on your phone

## How It Works

1. **WhatsApp Integration**: Uses `whatsapp-web.js` to connect to WhatsApp Web
2. **Financial Monitoring**: Polls Plaid API for transaction data and analyzes spending patterns
3. **Social Media Tracking**: Integrates with various social media APIs to track usage
4. **AI Personality**: Uses Ollama running locally to generate responses in your style
5. **Scheduled Checks**: Runs periodic checks and sends proactive messages

## Configuration

Edit thresholds in `.env`:
- `MAX_SOCIAL_MEDIA_HOURS_PER_DAY`: Daily social media time limit
- `SPENDING_ALERT_THRESHOLD`: Dollar amount to trigger spending alerts
- `UNNECESSARY_SPENDING_CATEGORIES`: Categories that trigger reprimands

## Note on APIs

- **Plaid**: Free sandbox mode for testing. Production requires paid plan.
- **Social Media APIs**: May have rate limits. Check respective documentation.
- **Ollama**: Completely free and runs locally on your machine.
