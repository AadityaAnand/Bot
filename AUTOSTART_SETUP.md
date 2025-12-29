# PM2 Auto-Start Setup Guide

Your WhatsApp bot is currently running with PM2! 🎉

## Current Status

✅ Bot is running in the background with PM2
✅ Process list has been saved
⏳ Auto-start on boot needs to be configured (requires your password)

## To Enable Auto-Start on Boot

You need to run ONE command manually (requires your password):

### Option 1: Run the setup script
```bash
./setup-autostart.sh
```

### Option 2: Run the command directly
```bash
sudo env PATH=$PATH:/opt/homebrew/Cellar/node/24.2.0/bin /opt/homebrew/lib/node_modules/pm2/bin/pm2 startup launchd -u aadityaanand --hp /Users/aadityaanand
```

**Enter your Mac password when prompted.**

## What This Does

After running the command above:
1. PM2 will create a Launch Agent in macOS
2. Your bot will automatically start every time you boot your Mac
3. The bot will run in the background even after terminal closes
4. No need to manually start the bot ever again!

## Verify It's Working

After running the setup command:

1. **Check PM2 status:**
   ```bash
   pm2 status
   ```
   You should see `whatsapp-bot` as `online`

2. **Restart your Mac** (to test auto-start)

3. **After reboot, check again:**
   ```bash
   pm2 list
   ```
   The bot should be running automatically!

## Useful PM2 Commands

```bash
# View bot status
pm2 status

# View live logs
pm2 logs whatsapp-bot

# Stop the bot
pm2 stop whatsapp-bot

# Restart the bot
pm2 restart whatsapp-bot

# Remove from PM2 (but keep auto-start enabled)
pm2 delete whatsapp-bot

# Disable auto-start on boot
pm2 unstartup launchd
```

## Current Setup

- **Bot Name:** whatsapp-bot
- **Status:** Online ✅
- **Auto-Start:** Not configured yet ⏳
- **Process Saved:** Yes ✅
- **Config File:** ecosystem.config.cjs

## Troubleshooting

### If auto-start doesn't work after reboot:

1. Check if PM2 daemon is running:
   ```bash
   pm2 ping
   ```

2. Check saved processes:
   ```bash
   pm2 list
   ```

3. If bot isn't running, resurrect it:
   ```bash
   pm2 resurrect
   ```

4. Re-save the process list:
   ```bash
   pm2 save
   ```

### If you see "PM2 not found" after reboot:

The PATH might not be set correctly. Run the startup command again:
```bash
pm2 startup
```
Then copy and run the command it gives you with sudo.

## Next Steps

1. **Run the auto-start setup** (see commands above)
2. **Test by rebooting** your Mac
3. **Send a message** to your WhatsApp bot to verify it's working
4. **Enjoy** your 24/7 running bot! 🤖

---

**Note:** The bot is ALREADY running right now via PM2. The auto-start setup just ensures it starts automatically after a reboot.
