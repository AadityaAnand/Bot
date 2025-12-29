# How to Set Up Your Bot Chat

The bot will now ONLY respond in ONE specific chat that you designate. Here's how to set it up:

## Step 1: Choose Your Bot Chat

Create or choose a chat where you want the bot to work. Options:
- Create a new group called "My Assistant" (just you)
- Use an existing group with just you
- Use your "Message Yourself" chat

## Step 2: Get the Chat ID

1. **Send a message in your chosen chat** (any message)

2. **Check the PM2 logs immediately:**
   ```bash
   pm2 logs whatsapp-bot --lines 50
   ```

3. **Look for a line like this:**
   ```
   🔍 Current chat: 120363XXXXXXXXXX@g.us, Allowed chat:
   ```
   or
   ```
   🔍 Current chat: 12409359669@c.us, Allowed chat:
   ```

4. **Copy that chat ID** (the part before "Allowed chat:")
   - For groups: looks like `120363XXXXXXXXXX@g.us`
   - For direct chats: looks like `12409359669@c.us`

## Step 3: Set the Chat ID

1. **Open the .env file:**
   ```bash
   nano .env
   ```

2. **Find this line:**
   ```
   BOT_CHAT_ID=
   ```

3. **Paste your chat ID:**
   ```
   BOT_CHAT_ID=120363XXXXXXXXXX@g.us
   ```

4. **Save and exit** (Ctrl+X, then Y, then Enter)

## Step 4: Restart the Bot

```bash
pm2 restart whatsapp-bot
```

## Step 5: Test It!

1. **Send "help" in your designated chat** - Bot should respond ✅
2. **Send "help" in any other chat** - Bot should NOT respond ✅

## Current Behavior

**Right now:** `BOT_CHAT_ID` is empty, so the bot responds in ALL chats (temporary)

**After setup:** Bot will ONLY respond in the chat you specified

## Example

If your chat ID is `120363289471234567@g.us`:

```env
BOT_CHAT_ID=120363289471234567@g.us
```

Then the bot will ONLY work in that specific group!

## To Disable (Respond Everywhere)

If you want the bot to respond in all chats again:

1. Set `BOT_CHAT_ID=` (leave it empty)
2. Restart: `pm2 restart whatsapp-bot`

## Troubleshooting

### Can't find the chat ID?
Make sure you're checking the logs right after sending a message:
```bash
pm2 logs whatsapp-bot --lines 100
```

### Bot not responding in the designated chat?
1. Double-check the chat ID is correct
2. Make sure there are no extra spaces
3. Restart PM2: `pm2 restart whatsapp-bot`
4. Check logs for errors: `pm2 logs whatsapp-bot --err`
