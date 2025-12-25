import axios from 'axios';
import { generateSocialMediaAlert } from './personality.js';
import { sendToUser } from '../index.js';

// Track daily usage
const dailyUsage = {
    instagram: { hours: 0, lastCheck: null },
    twitter: { hours: 0, lastCheck: null },
    tiktok: { hours: 0, lastCheck: null },
    youtube: { hours: 0, lastCheck: null }
};

/**
 * Check Instagram usage via Graph API
 * @returns {Promise<Object>} - Usage data
 */
async function checkInstagramUsage() {
    const token = process.env.INSTAGRAM_ACCESS_TOKEN;

    if (!token) {
        return { platform: 'Instagram', hours: 0, available: false };
    }

    try {
        // Note: Instagram Graph API has limited insights for personal accounts
        // This is a placeholder - you'd need to implement actual tracking
        // Options: screen time API, manual logging, or third-party services

        // For now, return mock data structure
        return {
            platform: 'Instagram',
            hours: 0,
            postsViewed: 0,
            storiesViewed: 0,
            available: true
        };

    } catch (error) {
        console.error('Instagram API error:', error.message);
        return { platform: 'Instagram', hours: 0, available: false, error: error.message };
    }
}

/**
 * Check Twitter/X usage
 * @returns {Promise<Object>} - Usage data
 */
async function checkTwitterUsage() {
    const token = process.env.TWITTER_BEARER_TOKEN;

    if (!token) {
        return { platform: 'Twitter', hours: 0, available: false };
    }

    try {
        // Twitter API v2 doesn't directly provide screen time
        // You could track: tweets read, timeline refreshes, etc.
        // This requires a custom tracking implementation

        return {
            platform: 'Twitter',
            hours: 0,
            tweetsRead: 0,
            available: true
        };

    } catch (error) {
        console.error('Twitter API error:', error.message);
        return { platform: 'Twitter', hours: 0, available: false, error: error.message };
    }
}

/**
 * Check TikTok usage
 * @returns {Promise<Object>} - Usage data
 */
async function checkTikTokUsage() {
    // TikTok has very limited official API access for personal use
    // Options:
    // 1. Manual logging via the bot
    // 2. iOS Screen Time API (requires native integration)
    // 3. Device usage tracking apps

    return {
        platform: 'TikTok',
        hours: 0,
        videosWatched: 0,
        available: false,
        note: 'Requires manual logging or screen time integration'
    };
}

/**
 * Check YouTube usage
 * @returns {Promise<Object>} - Usage data
 */
async function checkYouTubeUsage() {
    const apiKey = process.env.YOUTUBE_API_KEY;

    if (!apiKey) {
        return { platform: 'YouTube', hours: 0, available: false };
    }

    try {
        // YouTube Data API doesn't provide watch time directly
        // You could track: videos watched, watch history length, etc.
        // Requires OAuth 2.0 for personal watch history

        return {
            platform: 'YouTube',
            hours: 0,
            videosWatched: 0,
            available: true
        };

    } catch (error) {
        console.error('YouTube API error:', error.message);
        return { platform: 'YouTube', hours: 0, available: false, error: error.message };
    }
}

/**
 * Manually log social media usage
 * @param {string} platform - Platform name
 * @param {number} minutes - Minutes spent
 */
export function logUsage(platform, minutes) {
    const platformKey = platform.toLowerCase();

    if (dailyUsage[platformKey]) {
        const hours = minutes / 60;
        dailyUsage[platformKey].hours += hours;
        dailyUsage[platformKey].lastCheck = new Date();

        console.log(`📱 Logged ${minutes} minutes on ${platform}`);

        return {
            platform,
            totalHours: dailyUsage[platformKey].hours,
            logged: true
        };
    }

    return { platform, logged: false, error: 'Unknown platform' };
}

/**
 * Reset daily usage (called at midnight)
 */
export function resetDailyUsage() {
    Object.keys(dailyUsage).forEach(platform => {
        dailyUsage[platform].hours = 0;
        dailyUsage[platform].lastCheck = null;
    });

    console.log('🔄 Daily usage reset');
}

/**
 * Check all social media usage and send alerts if needed
 * @param {Object} client - WhatsApp client
 * @param {boolean} summaryOnly - Return summary without sending alerts
 * @returns {Promise<string>} - Usage summary
 */
export async function checkSocialMediaUsage(client, summaryOnly = false) {
    try {
        // Check all platforms
        const [instagram, twitter, tiktok, youtube] = await Promise.all([
            checkInstagramUsage(),
            checkTwitterUsage(),
            checkTikTokUsage(),
            checkYouTubeUsage()
        ]);

        // Combine with manually logged usage
        const allUsage = [
            { ...instagram, hours: dailyUsage.instagram.hours || instagram.hours },
            { ...twitter, hours: dailyUsage.twitter.hours || twitter.hours },
            { ...tiktok, hours: dailyUsage.tiktok.hours || tiktok.hours },
            { ...youtube, hours: dailyUsage.youtube.hours || youtube.hours }
        ];

        const maxHours = parseFloat(process.env.MAX_SOCIAL_MEDIA_HOURS_PER_DAY || 2);
        let summary = 'Social Media Usage Today:\n\n';
        let totalHours = 0;

        for (const usage of allUsage) {
            totalHours += usage.hours;
            summary += `${usage.platform}: ${usage.hours.toFixed(1)}h\n`;

            // Send alert if over limit (and not in summary mode)
            if (!summaryOnly && usage.hours > maxHours && client) {
                const alert = await generateSocialMediaAlert({
                    platform: usage.platform,
                    hours: usage.hours.toFixed(1),
                    limit: maxHours
                });

                await sendToUser(client, alert);
                console.log(`⚠️  Social media alert sent for ${usage.platform}`);
            }
        }

        summary += `\nTotal: ${totalHours.toFixed(1)}h / ${maxHours}h limit`;

        return summary;

    } catch (error) {
        console.error('Error checking social media usage:', error.message);
        return 'Error checking social media usage';
    }
}

/**
 * Get usage for specific platform
 * @param {string} platform - Platform name
 * @returns {Object} - Usage data
 */
export function getPlatformUsage(platform) {
    const platformKey = platform.toLowerCase();
    return dailyUsage[platformKey] || null;
}

export { dailyUsage };
