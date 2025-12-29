# 🧪 Testing Guide

Quick tests to verify your bot is working properly!

## ✅ Test 1: Interval Reminders (NEW!)

Send this message to your bot:

```
remind me test walk every 1 hour from 14:00 to 17:00
```

**Expected Response:**
```
🤖 ✅ Interval reminder set!
Message: test walk
Every: 1 hour(s)
From: 14:00 to 17:00
Active immediately!
```

**What should happen:**
- You'll get reminded at 14:00 (2 PM), 15:00 (3 PM), 16:00 (4 PM), and 17:00 (5 PM)
- No restart needed!

**To verify it's scheduled:**
```
reminders
```

You should see it in your active reminders list.

**To clean up after testing:**
```
delete reminder [id]
```

---

## ✅ Test 2: Activity Logging

Send these messages to your bot:

```
worked on testing the new bot features for 30 minutes
```

```
meeting with my productivity assistant
```

```
did some code review
```

**Expected Response for each:**
```
🤖 ✅ Activity logged! I'll include this in your daily summary.
```

**To verify:**
```
summary
```

You should see all your logged activities!

---

## ✅ Test 3: Regular Reminder (Already Working)

```
remind me test at 15:30
```

**Expected Response:**
```
🤖 ✅ Reminder set!
Message: test
Time: 15:30
Frequency: once
Active immediately!
```

Notice it says "Active immediately!" instead of asking you to restart!

---

## ✅ Test 4: Daily Reminder

```
remind me daily standup at 09:00 daily
```

**Expected Response:**
```
🤖 ✅ Reminder set!
Message: daily standup
Time: 09:00
Frequency: daily
Active immediately!
```

This will remind you every day at 9 AM.

---

## ✅ Test 5: List All Reminders

```
reminders
```

**Expected Response:**
```
🤖 ⏰ Your Reminders:

#1: test walk
   ⏱️ interval (every 1h from 14:00 to 17:00)

#2: test
   ⏱️ 15:30 (once)

#3: daily standup
   ⏱️ 09:00 (daily)

Use "delete reminder [id]" to remove a reminder.
```

---

## ✅ Test 6: Delete Reminder

```
delete reminder 2
```

**Expected Response:**
```
🤖 ✅ Deleted reminder #2
```

---

## 🎯 Quick Test Sequence

Here's a quick sequence to test everything in 5 minutes:

1. **Create an interval reminder for the next hour:**
   ```
   remind me test every 1 hour from 14:00 to 15:00
   ```

2. **Check it was created:**
   ```
   reminders
   ```

3. **Log an activity:**
   ```
   worked on testing the bot
   ```

4. **Check the summary:**
   ```
   summary
   ```

5. **Delete the test reminder:**
   ```
   delete reminder 1
   ```

---

## 🔍 Checking Logs

If something isn't working, check the logs:

```bash
pm2 logs whatsapp-bot --lines 100
```

Look for:
- `✅ Reminder created and activated` - means it worked!
- `⏰ Triggering reminder` - means a reminder fired
- Any error messages

---

## 🚨 Troubleshooting

### Reminder didn't fire?
1. Check the time format is correct (HH:MM in 24-hour format)
2. Run `reminders` to see if it's in the list
3. Check logs: `pm2 logs whatsapp-bot`

### Bot not responding?
1. Check status: `pm2 status`
2. Make sure you're in the correct chat (Productivity Group)
3. Check logs for errors

### "Session closed" errors in logs?
- This is normal! It happens during scheduled tasks
- The bot will reconnect automatically
- If bot stops responding, restart: `pm2 restart whatsapp-bot`

---

## ✅ Success Criteria

After testing, you should have:
- ✅ Created an interval reminder successfully
- ✅ Verified it shows in `reminders` list
- ✅ Logged activities successfully
- ✅ Seen activities in `summary`
- ✅ Deleted test reminders

---

## 🎉 Next Steps

Once testing is complete:
1. Set up real reminders you'll actually use
2. Configure PM2 auto-start (see TODO list)
3. Optionally set up Gmail integration
4. Wait for your first daily summary at 10 PM!
