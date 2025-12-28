# PM2 Usage Guide

PM2 is a process manager that keeps your bot running 24/7 in the background.

## Quick Start

### Start the bot with PM2:
```bash
pm2 start ecosystem.config.js
```

### View bot status:
```bash
pm2 status
```

### View logs (live):
```bash
pm2 logs whatsapp-bot
```

### Stop the bot:
```bash
pm2 stop whatsapp-bot
```

### Restart the bot:
```bash
pm2 restart whatsapp-bot
```

### Delete from PM2:
```bash
pm2 delete whatsapp-bot
```

## Auto-start on System Boot

To make the bot start automatically when your computer boots:

```bash
# Generate startup script
pm2 startup

# Save current process list
pm2 save
```

Now the bot will automatically start when you restart your computer!

## Monitoring

### View detailed info:
```bash
pm2 show whatsapp-bot
```

### Monitor CPU and memory:
```bash
pm2 monit
```

### View logs from files:
```bash
# Error logs
cat logs/error.log

# Output logs
cat logs/output.log

# Combined logs
cat logs/combined.log
```

## Useful Commands

### Clear logs:
```bash
pm2 flush
```

### Reload (zero downtime restart):
```bash
pm2 reload whatsapp-bot
```

### Update PM2:
```bash
npm install -g pm2@latest
pm2 update
```

## Troubleshooting

### Bot not responding?
1. Check if it's running: `pm2 status`
2. Check logs for errors: `pm2 logs whatsapp-bot --err`
3. Restart: `pm2 restart whatsapp-bot`

### Memory issues?
```bash
# Check memory usage
pm2 monit

# Restart to free memory
pm2 restart whatsapp-bot
```

### WhatsApp disconnected?
You may need to re-scan the QR code. The bot saves the session, but if it expires:
1. Stop PM2: `pm2 stop whatsapp-bot`
2. Delete auth folder: `rm -rf .wwebjs_auth`
3. Start normally to get new QR: `npm start`
4. After scanning, stop and restart with PM2: `pm2 start ecosystem.config.js`

## Normal Usage (without PM2)

If you prefer to run the bot in the terminal (not in background):

```bash
npm start
```

The bot will stop when you close the terminal or press Ctrl+C.
