# 🤖 Personal Productivity & Finance Assistant

A WhatsApp bot powered by AI that helps you stay productive and track your financial transactions.

## ✨ Features

### 📊 Productivity Tracking
- **Activity Logging** - Track everything you do throughout the day
- **Daily & Weekly Summaries** - Automated productivity reports
- **Natural Conversations** - Just chat normally with the AI assistant

### 💰 Financial Transaction Tracking
- **Spending Analysis** - Monitor where your money goes
- **Budget Alerts** - Get notified when you exceed limits
- **Account Balances** - Quick balance checks via Plaid
- **Smart Categorization** - Automatic expense categorization
- **Transaction History** - Keep track of all financial activities

### ⏰ Smart Reminders
- **Time-based Reminders** - Set reminders for specific times
- **Recurring Reminders** - Daily, weekly, or custom intervals
- **WhatsApp Notifications** - Delivered directly to your chat

### 🤖 AI-Powered Assistant
- **Conversational Interface** - Natural language understanding
- **Context Awareness** - Remembers your conversation history
- **Sassy Personality** - Keeps you accountable with a fun attitude
- **Powered by Google Gemini** - Latest AI technology

## 🛠️ Tech Stack

**Core:**
- **Node.js** - Runtime environment
- **WhatsApp Web.js** - WhatsApp integration
- **Google Gemini 2.5 Flash** - AI language model
- **PM2** - Process management for 24/7 uptime

**Integrations:**
- **Plaid API** - Bank account and transaction tracking
- **Gmail API** - Email monitoring (optional)

**Infrastructure:**
- **LocalAuth** - Persistent WhatsApp session
- **File-based Storage** - Activity and transaction logs
- **Scheduled Jobs** - Automated summaries and checks

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ installed
- WhatsApp account
- Google Gemini API key
- Plaid API credentials (for financial tracking)

### Installation

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```

3. Configure environment variables in `.env`:
   ```env
   GEMINI_API_KEY=your_gemini_api_key
   BOT_CHAT_ID=your_whatsapp_group_id
   AUTHORIZED_USER_NUMBER=your_phone_number

   # For financial tracking
   PLAID_CLIENT_ID=your_plaid_client_id
   PLAID_SECRET=your_plaid_secret
   PLAID_ENV=sandbox
   ```

4. Start with PM2:
   ```bash
   pm2 start ecosystem.config.cjs
   pm2 save
   pm2 startup
   ```

5. Scan QR code to link WhatsApp

## 📱 Usage Examples

**Log an activity:**
```
worked on project proposal for 3 hours
```

**Check spending:**
```
spending
```

**Get balance:**
```
balance
```

**Set a reminder:**
```
remind me workout at 18:00
```

**Daily summary:**
```
summary
```

## 📊 Automatic Schedules

| Time | Task |
|------|------|
| Every hour | Check spending & budgets |
| 8:00 AM | Morning motivation |
| 12:00 PM | Midday check-in |
| 9:00 PM | Evening wind-down |
| 10:00 PM | Daily summary |
| Sunday 8:00 PM | Weekly summary |

## 🔒 Privacy & Security

- All data stored locally on your device
- Plaid uses bank-grade encryption
- No data shared with third parties
- You control all integrations

## 📝 License

Personal use only.

---

**Built with ❤️ using Node.js, WhatsApp Web.js, Google Gemini, and Plaid**
