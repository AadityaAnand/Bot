# 🤖 Personal Productivity Assistant Bot

A WhatsApp bot powered by AI that helps you stay productive, manage your time, and keep track of important tasks and emails.

## 🎯 What It Does

Your personal assistant that runs 24/7 and helps you:

### 📊 Productivity Tracking
- **Activity Logging** - Just tell it what you did and it logs everything
- **Daily Summaries** - Get a recap of your day at 10 PM
- **Weekly Reports** - Sunday evening summaries of the week
- **Natural Language** - Just chat normally: "worked on project X for 2 hours"

### 📧 Smart Email Management
- **Important Emails Only** - AI filters out spam, newsletters, promotions
- **Auto-checks every 2 hours** (9am-9pm)
- **WhatsApp Notifications** - Get alerted about truly urgent emails
- **Manual Checks** - Ask "check email" anytime

### 💰 Financial Tracking
- **Spending Analysis** - Track where your money goes
- **Budget Alerts** - Get notified when you exceed limits
- **Account Balances** - Quick balance checks
- **Smart Categorization** - Automatic expense categorization

### ⏰ Smart Reminders
- **Time-based Reminders** - "remind me workout at 18:00"
- **Daily/Weekly Recurring** - Set it once, forget it
- **WhatsApp Notifications** - Reminders sent directly to you

### 🤖 AI Personality
- **Learns Your Style** - Matches how you text
- **Sassy & Supportive** - Keeps you accountable without being annoying
- **Conversational** - Chat naturally, it understands context

## 🚀 Current Status

✅ **Running** - Bot is live via PM2
✅ **Chat Filtering** - Only responds in Productivity Group
✅ **Activity Logging** - Tracks what you tell it
✅ **Daily/Weekly Summaries** - Automatic reports
✅ **Spending Tracking** - Ready (needs Plaid setup)
✅ **Gmail Integration** - Ready (needs authorization)
✅ **Reminders** - Fully functional
✅ **AI Personality** - Using Ollama (llama3.2)

## 📱 How to Use

### Activity Logging

Just tell the bot what you're doing:

```
worked on project proposal for 3 hours
```

```
meeting with client about new website
```

```
did 2 hours of coding
```

The bot logs everything and includes it in your daily summary at 10 PM.

### Email Checking

Ask anytime:
```
check email
```

Or let it auto-check every 2 hours and notify you of important emails.

### Summaries

```
summary
```
or
```
daily summary
```

Get today's activity recap.

```
weekly summary
```

Get this week's overview (also auto-sent Sunday 8pm).

### Financial Commands

```
spending
```
```
balance
```
```
set budget daily 50
```

### Reminders

```
remind me workout at 18:00
```
```
reminders
```
```
delete reminder 1
```

### General Chat

Just talk to it! It's an AI assistant:

```
what should I focus on today?
```

```
help me plan my day
```

## ⚙️ Setup

### Prerequisites
- ✅ Node.js installed
- ✅ PM2 running
- ✅ Ollama with llama3.2 model
- ✅ WhatsApp connected
- ⏺️ Gmail (optional - needs setup)
- ⏺️ Plaid (optional - needs API keys)

### Current Configuration

**Running:** Via PM2 (`pm2 status`)
**Responds In:** Productivity Group only
**Bot Chat ID:** `120363422242989040@g.us`

### Quick Commands

```bash
# Check bot status
pm2 status

# View logs
pm2 logs whatsapp-bot

# Restart bot
pm2 restart whatsapp-bot

# Stop bot
pm2 stop whatsapp-bot
```

## 📧 Gmail Setup (Optional but Recommended)

See [GMAIL_SETUP.md](GMAIL_SETUP.md) for detailed instructions.

**Quick steps:**
1. Create Google Cloud project
2. Enable Gmail API
3. Download OAuth credentials
4. Run: `node src/scripts/authorize-gmail.js`
5. Restart bot

**Result:** Bot will notify you about important emails automatically!

## 💰 Plaid Setup (Optional)

For financial tracking, you need Plaid API keys:

1. Sign up at [Plaid](https://plaid.com)
2. Get your credentials
3. Add to `.env`:
   ```
   PLAID_CLIENT_ID=your_client_id
   PLAID_SECRET=your_secret
   PLAID_ENV=sandbox
   ```
4. Run account linking flow
5. Restart bot

## 📅 Automatic Schedules

The bot runs these tasks automatically:

| Time | Task |
|------|------|
| Every hour | Check spending & budgets |
| Every 2 hours (9am-9pm) | Check important emails |
| 8:00 AM | Morning motivation message |
| 12:00 PM | Midday check-in |
| 9:00 PM | Evening wind-down reminder |
| 10:00 PM | Daily activity & spending summary |
| Sunday 8:00 PM | Weekly summary |
| 2:00 AM | Clean old data (keeps last 30 days) |

## 🎨 Features Breakdown

### What Works Without Setup
- ✅ Activity logging
- ✅ Daily/weekly summaries
- ✅ AI conversations
- ✅ Reminders
- ✅ Style learning
- ✅ Scheduled motivational messages

### What Needs Setup
- 📧 Gmail - Needs Google Cloud OAuth (15 min setup)
- 💰 Plaid - Needs API keys + bank linking (20 min setup)

## 💬 Example Conversation

**You:** worked on the client presentation for 3 hours

**Bot:** ✅ Activity logged! I'll include this in your daily summary.

---

**You:** check email

**Bot:** 📧 You have 2 important emails:

*From:* John Doe <john@company.com>
*Subject:* Meeting tomorrow at 10am
_Can you confirm your attendance?_

---

**You:** summary

**Bot:** 📊 *Activity Summary*

Total activities: 5
Total time tracked: 6h 30m

*Work* (3 activities, 5h)
  • worked on client presentation
  • team meeting with Sarah
  • code review for project X

*Personal* (2 activities, 1h 30m)
  • gym workout
  • read for 30 minutes

## 📝 Commands Reference

See full list: Send `help` to the bot

## 🛠️ Troubleshooting

### Bot not responding
- Check PM2 status: `pm2 status`
- View logs: `pm2 logs whatsapp-bot`
- Make sure you're in the Productivity Group chat

### Gmail not working
- Run authorization: `node src/scripts/authorize-gmail.js`
- See [GMAIL_SETUP.md](GMAIL_SETUP.md)

### Reminders not firing
- Restart bot: `pm2 restart whatsapp-bot`
- Check reminder format: Must be 24-hour time (HH:MM)

### AI not responding
- Check Ollama is running: `ollama list`
- Verify model exists: `ollama pull llama3.2`

## 📁 Project Structure

```
Bot/
├── src/
│   ├── index.js              # Main bot entry point
│   ├── handlers/
│   │   └── messageHandler.js # Command processing
│   ├── services/
│   │   ├── activity.js       # Activity logging
│   │   ├── gmail.js          # Email integration
│   │   ├── personality.js    # AI responses
│   │   ├── spending.js       # Financial tracking
│   │   ├── budget.js         # Budget management
│   │   └── reminders.js      # Reminder system
│   └── scripts/
│       └── authorize-gmail.js # Gmail OAuth flow
├── data/
│   ├── activities.json       # Activity logs
│   ├── user-style.json       # Learned texting style
│   └── gmail-token.json      # Gmail auth (after setup)
├── .env                      # Configuration
├── ecosystem.config.cjs      # PM2 config
├── README.md                 # This file
└── GMAIL_SETUP.md           # Gmail setup guide
```

## 🔒 Privacy & Security

- All data stays on your Mac
- Gmail: READ-only access
- Plaid: Uses industry-standard bank APIs
- No data sent to third parties
- You can revoke access anytime

## 🎯 Future Ideas

Here are features we could add:

- 📅 Calendar integration (Google Calendar)
- 🏃 Fitness tracking via Apple Health
- 📚 Book/article reading tracker
- 🎯 Goal setting & progress tracking
- 📈 Productivity analytics dashboard
- 🌐 Notion integration for syncing
- 🎵 Spotify/music listening analysis
- ⏱️ Pomodoro timer integration

## 📞 Getting Help

**Send to bot:** `help`

**Check logs:** `pm2 logs whatsapp-bot`

**Common issues:**
- Bot setup: Check [SETUP_BOT_CHAT.md](SETUP_BOT_CHAT.md)
- Gmail setup: Check [GMAIL_SETUP.md](GMAIL_SETUP.md)
- PM2 guide: Check [PM2_GUIDE.md](PM2_GUIDE.md)

## 📜 License

Personal use only.

---

**Built with:**
- Node.js
- WhatsApp Web.js
- Ollama (llama3.2)
- Google Gmail API
- Plaid API
- PM2

---

🤖 **Your productivity assistant is running 24/7!**

Just chat naturally and let it help you stay on track.
