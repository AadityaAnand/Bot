import fs from 'fs';
import path from 'path';

const ACTIVITY_FILE = path.join(process.cwd(), 'data', 'activities.json');

/**
 * Load activities from file
 */
function loadActivities() {
    if (!fs.existsSync(ACTIVITY_FILE)) {
        return [];
    }

    try {
        const data = fs.readFileSync(ACTIVITY_FILE, 'utf8');
        return JSON.parse(data);
    } catch (error) {
        console.error('Error loading activities:', error.message);
        return [];
    }
}

/**
 * Save activities to file
 */
function saveActivities(activities) {
    try {
        // Ensure data directory exists
        const dataDir = path.dirname(ACTIVITY_FILE);
        if (!fs.existsSync(dataDir)) {
            fs.mkdirSync(dataDir, { recursive: true });
        }

        fs.writeFileSync(ACTIVITY_FILE, JSON.stringify(activities, null, 2));
    } catch (error) {
        console.error('Error saving activities:', error.message);
    }
}

/**
 * Log an activity
 */
export function logActivity(description, duration = null, category = null) {
    const activities = loadActivities();

    const activity = {
        id: Date.now(),
        timestamp: new Date().toISOString(),
        description,
        duration, // in minutes, if provided
        category, // work, meeting, personal, etc.
        date: new Date().toISOString().split('T')[0] // YYYY-MM-DD
    };

    activities.push(activity);
    saveActivities(activities);

    console.log(`✅ Activity logged: ${description}`);
    return activity;
}

/**
 * Get activities for today
 */
export function getTodayActivities() {
    const activities = loadActivities();
    const today = new Date().toISOString().split('T')[0];

    return activities.filter(a => a.date === today);
}

/**
 * Get activities for this week
 */
export function getWeekActivities() {
    const activities = loadActivities();
    const now = new Date();
    const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

    return activities.filter(a => {
        const activityDate = new Date(a.timestamp);
        return activityDate >= weekAgo && activityDate <= now;
    });
}

/**
 * Get activity summary for a period
 */
export function getActivitySummary(activities) {
    if (activities.length === 0) {
        return 'No activities logged';
    }

    // Group by category
    const byCategory = {};
    let totalMinutes = 0;

    for (const activity of activities) {
        const cat = activity.category || 'Other';
        if (!byCategory[cat]) {
            byCategory[cat] = {
                count: 0,
                activities: [],
                totalMinutes: 0
            };
        }

        byCategory[cat].count++;
        byCategory[cat].activities.push(activity.description);

        if (activity.duration) {
            byCategory[cat].totalMinutes += activity.duration;
            totalMinutes += activity.duration;
        }
    }

    // Format summary
    let summary = `📊 *Activity Summary*\n\n`;
    summary += `Total activities: ${activities.length}\n`;

    if (totalMinutes > 0) {
        const hours = Math.floor(totalMinutes / 60);
        const mins = totalMinutes % 60;
        summary += `Total time tracked: ${hours}h ${mins}m\n\n`;
    }

    for (const [category, data] of Object.entries(byCategory)) {
        summary += `*${category}* (${data.count} activities`;
        if (data.totalMinutes > 0) {
            const h = Math.floor(data.totalMinutes / 60);
            const m = data.totalMinutes % 60;
            summary += `, ${h}h ${m}m`;
        }
        summary += `)\n`;

        // Show most recent activities in this category
        const recent = data.activities.slice(-3).map(a => `  • ${a}`).join('\n');
        summary += recent + '\n\n';
    }

    return summary;
}

/**
 * Generate daily summary
 */
export function generateDailySummary() {
    const todayActivities = getTodayActivities();
    return getActivitySummary(todayActivities);
}

/**
 * Generate weekly summary
 */
export function generateWeeklySummary() {
    const weekActivities = getWeekActivities();

    if (weekActivities.length === 0) {
        return 'No activities logged this week';
    }

    // Group by day
    const byDay = {};
    for (const activity of weekActivities) {
        if (!byDay[activity.date]) {
            byDay[activity.date] = [];
        }
        byDay[activity.date].push(activity);
    }

    let summary = `📅 *Weekly Summary*\n\n`;
    summary += `Total activities this week: ${weekActivities.length}\n\n`;

    // Show activity count per day
    const sortedDays = Object.keys(byDay).sort();
    for (const day of sortedDays) {
        const activities = byDay[day];
        const dayName = new Date(day).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
        summary += `*${dayName}*: ${activities.length} activities\n`;
    }

    summary += '\n' + getActivitySummary(weekActivities);

    return summary;
}

/**
 * Clear old activities (keep last 30 days)
 */
export function cleanOldActivities() {
    const activities = loadActivities();
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const filtered = activities.filter(a => {
        const activityDate = new Date(a.timestamp);
        return activityDate >= thirtyDaysAgo;
    });

    if (filtered.length < activities.length) {
        saveActivities(filtered);
        console.log(`🧹 Cleaned ${activities.length - filtered.length} old activities`);
    }
}

export default {
    logActivity,
    getTodayActivities,
    getWeekActivities,
    getActivitySummary,
    generateDailySummary,
    generateWeeklySummary,
    cleanOldActivities
};
