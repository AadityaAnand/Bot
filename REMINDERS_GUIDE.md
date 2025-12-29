# Reminders Guide

Your bot now supports powerful reminder features with **instant activation** - no restart needed!

## ✨ What's New

1. **⚡ Instant Activation** - Reminders start working immediately when you create them
2. **🔄 Interval Reminders** - Set hourly reminders between specific times
3. **No Restart Required** - Everything works right away!

## 📋 Reminder Types

### 1. One-Time Reminder

Remind you once at a specific time.

**Syntax:**
```
remind me [message] at [time]
```

**Examples:**
```
remind me take medicine at 14:00
remind me call mom at 19:30
```

### 2. Daily Reminder

Remind you every day at the same time.

**Syntax:**
```
remind me [message] at [time] daily
```

or

```
remind me [message] at [time] every day
```

**Examples:**
```
remind me workout at 18:00 daily
remind me journal at 21:00 every day
```

### 3. Weekly Reminder

Remind you once per week on a specific day.

**Syntax:**
```
remind me [message] at [time] weekly
```

**Examples:**
```
remind me team meeting at 10:00 weekly
```

### 4. **⭐ Interval Reminder (NEW!)**

Remind you every N hours between two times.

**Syntax:**
```
remind me [message] every [N] hour(s) from [start] to [end]
```

**Examples:**
```
remind me walk for 10 minutes every 1 hour from 10:00 to 20:00
```

This will remind you at:
- 10:00
- 11:00
- 12:00
- ... every hour until 20:00

**Another example:**
```
remind me take a break every 2 hours from 09:00 to 17:00
```

This reminds you at: 9:00, 11:00, 13:00, 15:00, 17:00

## 📝 Managing Reminders

### List All Reminders

```
reminders
```

Shows all active reminders with their IDs.

### Delete a Reminder

```
delete reminder [id]
```

Example:
```
delete reminder 1
```

## ⚡ Key Features

### Instant Activation

**Before:** Had to restart the bot after creating a reminder

**Now:** Reminders activate immediately when created!

**Example:**
```
You: remind me test at 15:30
Bot: ✅ Reminder set!
     Message: test
     Time: 15:30
     Frequency: once
     Active immediately!
```

The reminder will fire at 15:30 without any restart!

### Flexible Time Format

- Use 24-hour format: `HH:MM`
- Examples: `09:00`, `14:30`, `18:00`, `23:45`

## 💡 Use Cases

### Stay Active at Work

```
remind me walk for 10 minutes every 1 hour from 10:00 to 20:00
```

Get hourly walking reminders throughout the day!

### Take Regular Breaks

```
remind me take a break every 2 hours from 09:00 to 17:00
```

### Drink Water

```
remind me drink water every 1 hour from 08:00 to 22:00
```

### Medication Schedule

```
remind me take vitamin at 08:00 daily
remind me take medicine at 20:00 daily
```

### Work Routine

```
remind me standup meeting at 10:00 every day
remind me review tasks at 17:00 every day
```

## 🎯 Examples

### Single Reminder
```
You: remind me call dentist at 15:00
Bot: ✅ Reminder set!
     Message: call dentist
     Time: 15:00
     Frequency: once
     Active immediately!
```

At 15:00, you'll get:
```
Bot: 🤖 ⏰ Reminder: call dentist
```

### Interval Reminder
```
You: remind me stretch every 1 hour from 10:00 to 18:00
Bot: ✅ Interval reminder set!
     Message: stretch
     Every: 1 hour(s)
     From: 10:00 to 18:00
     Active immediately!
```

You'll get reminded at: 10:00, 11:00, 12:00, 13:00, 14:00, 15:00, 16:00, 17:00, 18:00

### Viewing Reminders
```
You: reminders
Bot: ⏰ Your Reminders:

     #1: stretch
        ⏱️ interval (every 1h from 10:00 to 18:00)

     #2: call dentist
        ⏱️ 15:00 (once)

     Use "delete reminder [id]" to remove a reminder.
```

### Deleting a Reminder
```
You: delete reminder 2
Bot: ✅ Deleted reminder #2
```

## 🔍 Troubleshooting

### Reminder not firing?

1. Check that it's listed when you send `reminders`
2. Make sure the time is in 24-hour format
3. Check the bot is running: `pm2 status`
4. View logs: `pm2 logs whatsapp-bot`

### Wrong time zone?

The bot uses your Mac's time zone. Check with:
```bash
date
```

### Interval reminder too frequent/not frequent enough?

Adjust the interval hours:
- Every 30 minutes? Not supported yet (whole hours only)
- Every 2 hours: `every 2 hours from ...`
- Every 3 hours: `every 3 hours from ...`

## 📚 Quick Reference

| Command | Purpose |
|---------|---------|
| `remind me [msg] at [time]` | One-time reminder |
| `remind me [msg] at [time] daily` | Daily reminder |
| `remind me [msg] every [N] hour from [start] to [end]` | Interval reminder |
| `reminders` | List all reminders |
| `delete reminder [id]` | Delete a reminder |

## 🎉 Pro Tips

1. **Combine with activity logging** - Use reminders to prompt logging:
   ```
   remind me log what I did every 2 hours from 10:00 to 18:00
   ```

2. **Stay healthy** - Set hourly walk reminders
   ```
   remind me walk every 1 hour from 09:00 to 17:00
   ```

3. **Pomodoro-style** - Work breaks every 25 minutes... wait, that's not supported yet. Use hourly for now!

4. **Daily routine** - Set daily reminders for habits
   ```
   remind me morning pages at 08:00 daily
   remind me review day at 21:00 daily
   ```

---

**All reminders activate instantly - no restart needed!** 🚀
