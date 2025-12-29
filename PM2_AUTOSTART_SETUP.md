# 🚀 PM2 Auto-Start Setup

This will make your bot start automatically when your Mac boots up!

## Step 1: Enable Startup Script

Run this command (you'll need to enter your Mac password):

```bash
sudo env PATH=$PATH:/opt/homebrew/Cellar/node/24.2.0/bin /opt/homebrew/lib/node_modules/pm2/bin/pm2 startup launchd -u aadityaanand --hp /Users/aadityaanand
```

**Expected output:**
```
[PM2] Writing init configuration...
[PM2] Making script bootable at startup...
[PM2] Done.
```

## Step 2: Save Current Process List

This saves your current running bot configuration:

```bash
pm2 save
```

**Expected output:**
```
[PM2] Saving current process list...
[PM2] Successfully saved in /Users/aadityaanand/.pm2/dump.pm2
```

## ✅ Verify It Worked

Check the saved configuration:

```bash
cat ~/.pm2/dump.pm2
```

You should see your `whatsapp-bot` process listed.

## 🧪 Test Auto-Start

To test if it works:

1. **Stop PM2 completely:**
   ```bash
   pm2 kill
   ```

2. **Check nothing is running:**
   ```bash
   pm2 status
   ```
   Should show no processes.

3. **Resurrect the saved processes:**
   ```bash
   pm2 resurrect
   ```

4. **Check status again:**
   ```bash
   pm2 status
   ```
   Your bot should be back online!

## 🎯 What This Does

After setup:
- ✅ Bot starts automatically when you log into your Mac
- ✅ Bot survives when you close Terminal
- ✅ Bot survives when you restart your Mac
- ❌ Bot still stops when you shutdown/sleep Mac (for true 24/7, need cloud hosting)

## 🔧 Managing Auto-Start

### Disable auto-start:
```bash
pm2 unstartup launchd
```

### Re-enable after disabling:
```bash
pm2 startup
# Follow the command it gives you
pm2 save
```

### Update saved processes:
After making changes to your bot config, save again:
```bash
pm2 save
```

## 📝 Notes

- This only works while your Mac is ON
- If you close the lid (sleep), the bot pauses
- If you shutdown, the bot stops (but will restart on next boot)
- For true 24/7 uptime, you need cloud hosting (see deployment todo)

---

## ⚡ Quick Setup (Copy-Paste)

Just run these 2 commands:

```bash
# 1. Enable startup
sudo env PATH=$PATH:/opt/homebrew/Cellar/node/24.2.0/bin /opt/homebrew/lib/node_modules/pm2/bin/pm2 startup launchd -u aadityaanand --hp /Users/aadityaanand

# 2. Save current processes
pm2 save
```

Done! 🎉

---

**After running these commands, your bot will survive Mac restarts!**
