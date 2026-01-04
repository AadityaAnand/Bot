# 🚀 Deploy to Railway (Free 24/7 Hosting)

Your WhatsApp bot will run 24/7 in the cloud - even when your Mac is off!

## ⚡ Quick Deploy (5 minutes)

### Step 1: Push to GitHub

Your code is ready! Just push the deployment files:

```bash
cd /Users/aadityaanand/LocalDocuments/Bot

git add Dockerfile railway.json .dockerignore DEPLOYMENT_GUIDE.md
git commit -m "Add Railway deployment config"
git push origin main
```

### Step 2: Create Railway Account

1. Go to https://railway.app/
2. Click **Login** → **Login with GitHub**
3. Authorize Railway to access your GitHub

### Step 3: Deploy from GitHub

1. Click **New Project**
2. Select **Deploy from GitHub repo**
3. Choose **AadityaAnand/Bot**
4. Railway will automatically detect the Dockerfile and start building!

### Step 4: Add Environment Variables

After deployment starts, go to your project:

1. Click on your service
2. Go to **Variables** tab
3. Click **+ New Variable** and add these:

**Required:**
- `GEMINI_API_KEY` - Your Google Gemini API key (REDACTED-GEMINI-API-KEY)
- `BOT_CHAT_ID` - Your WhatsApp group chat ID (120363422242989040@g.us)
- `AUTHORIZED_USER_NUMBER` - Your authorized user number (12409359669)

**Optional (if you set them up):**
- `PLAID_CLIENT_ID` - Your Plaid client ID
- `PLAID_SECRET` - Your Plaid secret key
- `PLAID_ACCESS_TOKEN` - Your Plaid access token

### Step 5: Get Your Environment Variables

To get the values from your local .env file:

```bash
cat .env
```

Copy each value and paste into Railway's variables.

### Step 6: First Time Setup - Scan QR Code

After deployment completes:

1. Click **View Logs** in Railway
2. Wait for the bot to start
3. Look for the QR code in logs (it'll appear as ASCII art)
4. Open WhatsApp on your phone
5. Go to **Settings** → **Linked Devices** → **Link a Device**
6. Scan the QR code from Railway logs

**Note:** You might need to expand the logs or screenshot them to see the full QR code.

### Step 7: Keep Bot Alive (Important!)

Railway's free tier might pause your service after inactivity. To prevent this:

1. In Railway, go to **Settings** tab
2. Scroll to **Networking**
3. Note your public URL (something like: `yourbot.up.railway.app`)
4. Set up a free monitoring service (optional):
   - Use https://uptimerobot.com/ (free)
   - Ping your Railway URL every 5 minutes
   - This keeps your bot awake

## 🔧 Monitoring Your Bot

### Check if Bot is Running

1. Go to Railway dashboard
2. Click on your service
3. Check **Deployments** - should show "Active"
4. Click **View Logs** to see real-time logs

### View Logs

```
Railway Dashboard → Your Service → View Logs
```

You'll see:
- ✅ Bot is ready and connected!
- ⏰ Reminder triggers
- 📧 Email checks
- 💰 Spending checks
- All your bot's activity!

### Restart Bot

If something goes wrong:

1. Go to your service in Railway
2. Click **...** (three dots) → **Restart**

## 🔄 Updating Your Bot

When you make changes locally:

```bash
# Make your changes
git add .
git commit -m "Your update message"
git push origin main
```

Railway will **automatically detect the push** and redeploy! No need to do anything else.

## 💾 Important: Session Persistence

**Problem:** Railway containers restart occasionally, which disconnects WhatsApp.

**Solution:** Use Railway's persistent volumes (coming soon to this guide) OR:
- Accept that you'll need to re-scan QR code occasionally
- Usually Railway is stable and restarts are rare

**When you need to re-authenticate:**
1. Check Railway logs
2. Look for QR code
3. Scan it again from WhatsApp

## 🆓 Free Tier Limits

Railway free tier includes:
- ✅ 500 hours/month (enough for 24/7!)
- ✅ $5 free credit/month
- ✅ Automatic HTTPS
- ✅ Automatic deployments from GitHub

**This is more than enough for your bot!**

## 🔐 Security Notes

- ✅ Never commit .env file (already in .gitignore)
- ✅ All secrets are stored in Railway's environment variables
- ✅ Your WhatsApp session is stored securely in the container
- ✅ Only you can access your Railway dashboard

## ❌ Troubleshooting

### "Build Failed"

Check Railway logs. Common issues:
- Missing environment variables
- Node version mismatch (we use Node 20)

**Fix:** Make sure all required env vars are set.

### "Can't Scan QR Code"

The QR code appears in Railway logs but might be hard to see:

1. Click **View Logs**
2. Wait for "Scan QR code" message
3. Look for ASCII art QR code
4. Take a screenshot if needed
5. Zoom in on screenshot
6. Scan with WhatsApp

**Alternative:** Use your phone's WhatsApp Web scanner and scan from computer screen.

### "Bot Not Responding"

1. Check Railway deployment status (should be "Active")
2. View logs - look for errors
3. Make sure all environment variables are set correctly
4. Restart the service

### "Session Lost After Restart"

This is normal on first deploy. After Railway restarts:
- Session might be lost
- You'll need to scan QR code again
- This happens rarely after initial setup

## 📊 Cost Estimate

**Free tier is enough**, but if you upgrade:
- ~$0-5/month for basic bot usage
- Most WhatsApp bots use minimal resources
- Railway charges based on actual usage

## 🎯 After Deployment

Once deployed:
1. ✅ Bot runs 24/7 in the cloud
2. ✅ No need to keep your Mac on
3. ✅ Automatic updates when you push to GitHub
4. ✅ Free for personal use
5. ✅ Scales automatically if needed

## 📱 Testing After Deployment

Send to your WhatsApp bot:
```
help
```

You should get a response! If yes, you're live! 🎉

## 🔄 Alternative: Render.com

If Railway doesn't work, try Render:

1. Go to https://render.com/
2. Sign up with GitHub
3. Create **New Web Service**
4. Connect **AadityaAnand/Bot** repo
5. Settings:
   - **Name:** whatsapp-bot
   - **Environment:** Docker
   - **Plan:** Free
6. Add environment variables (same as Railway)
7. Deploy!

Render has similar free tier limits.

## 🆘 Need Help?

Check Railway logs first:
```
Railway Dashboard → Your Service → View Logs
```

Common log messages:
- `✅ Bot is ready and connected!` - Everything works!
- `Scan QR code` - Need to authenticate
- `Session closed` - Need to reconnect (restart)
- `Error:` - Check the error message

---

## ⚡ Quick Reference

**Deploy Command:**
```bash
git add . && git commit -m "update" && git push origin main
```

**Check Logs:**
Railway Dashboard → View Logs

**Restart Bot:**
Railway Dashboard → ... → Restart

**Add Env Vars:**
Railway Dashboard → Variables → + New Variable

---

🎉 **You're all set! Your bot will now run 24/7 in the cloud!**
