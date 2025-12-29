#!/bin/bash

# PM2 Auto-Start Setup Script
# This script sets up PM2 to automatically start your WhatsApp bot when your Mac boots

echo "🚀 Setting up PM2 auto-start..."
echo ""
echo "⚠️  This requires your password (sudo access)"
echo ""

# Run the PM2 startup command
sudo env PATH=$PATH:/opt/homebrew/Cellar/node/24.2.0/bin /opt/homebrew/lib/node_modules/pm2/bin/pm2 startup launchd -u aadityaanand --hp /Users/aadityaanand

if [ $? -eq 0 ]; then
    echo ""
    echo "✅ PM2 auto-start configured successfully!"
    echo ""
    echo "Your WhatsApp bot will now automatically start when your Mac boots."
    echo ""
    echo "To test, restart your computer and check with: pm2 list"
else
    echo ""
    echo "❌ Failed to configure auto-start. Please check the error above."
fi
