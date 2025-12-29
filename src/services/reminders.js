import cron from 'node-cron';
import { sendToUser } from '../index.js';

// Store reminders (in production, use a database)
const reminders = [];
let reminderIdCounter = 1;
let whatsappClient = null; // Store client reference for immediate activation

/**
 * Create a new reminder
 * @param {string} message - Reminder message
 * @param {string} time - Time in format "HH:MM" (24-hour) or interval like "every 1 hour"
 * @param {string} frequency - 'once', 'daily', 'weekly', 'interval'
 * @param {string} day - Day of week for weekly reminders (optional)
 * @param {Object} options - Additional options (startTime, endTime for intervals)
 * @returns {Object} - Reminder object
 */
export function createReminder(message, time, frequency = 'once', day = null, options = {}) {
    let cronExpression;

    // Handle interval-based reminders (e.g., "every 1 hour")
    if (frequency === 'interval') {
        const { startTime, endTime, intervalHours } = options;

        if (!startTime || !endTime || !intervalHours) {
            throw new Error('Interval reminders need startTime, endTime, and intervalHours');
        }

        const [startHour] = startTime.split(':').map(num => parseInt(num));
        const [endHour] = endTime.split(':').map(num => parseInt(num));

        // Create cron expression for every hour within the range
        const hours = [];
        for (let h = startHour; h <= endHour; h += intervalHours) {
            hours.push(h);
        }

        cronExpression = `0 ${hours.join(',')} * * *`;
    } else {
        // Regular time-based reminders
        const [hour, minute] = time.split(':').map(num => parseInt(num));

        if (isNaN(hour) || isNaN(minute) || hour < 0 || hour > 23 || minute < 0 || minute > 59) {
            throw new Error('Invalid time format. Use HH:MM (24-hour format)');
        }

        switch (frequency) {
            case 'daily':
                cronExpression = `${minute} ${hour} * * *`;
                break;
            case 'weekly':
                if (!day) {
                    throw new Error('Day of week required for weekly reminders');
                }
                const dayMap = {
                    'monday': 1, 'mon': 1,
                    'tuesday': 2, 'tue': 2,
                    'wednesday': 3, 'wed': 3,
                    'thursday': 4, 'thu': 4,
                    'friday': 5, 'fri': 5,
                    'saturday': 6, 'sat': 6,
                    'sunday': 0, 'sun': 0
                };
                const dayNum = dayMap[day.toLowerCase()];
                if (dayNum === undefined) {
                    throw new Error('Invalid day of week');
                }
                cronExpression = `${minute} ${hour} * * ${dayNum}`;
                break;
            case 'once':
                // For one-time reminders, we'll check the time once per minute
                // and delete after triggering
                cronExpression = `${minute} ${hour} * * *`;
                break;
            default:
                throw new Error('Invalid frequency. Use: once, daily, weekly, or interval');
        }
    }

    const reminder = {
        id: reminderIdCounter++,
        message,
        time,
        frequency,
        day,
        cronExpression,
        active: true,
        task: null,
        options
    };

    reminders.push(reminder);

    // Immediately activate the reminder if client is available
    if (whatsappClient) {
        startReminder(reminder, whatsappClient);
        console.log(`✅ Reminder created and activated: "${message}" at ${time} (${frequency})`);
    } else {
        console.log(`✅ Reminder created: "${message}" at ${time} (${frequency})`);
    }

    return reminder;
}

/**
 * Start all active reminders
 * @param {Object} client - WhatsApp client
 */
export function startReminders(client) {
    // Store client reference for future reminders
    whatsappClient = client;

    for (const reminder of reminders) {
        if (reminder.active && !reminder.task) {
            startReminder(reminder, client);
        }
    }

    console.log(`⏰ Started ${reminders.filter(r => r.active).length} reminders`);
}

/**
 * Start a specific reminder
 * @param {Object} reminder - Reminder object
 * @param {Object} client - WhatsApp client
 */
function startReminder(reminder, client) {
    reminder.task = cron.schedule(reminder.cronExpression, async () => {
        console.log(`⏰ Triggering reminder: ${reminder.message}`);

        await sendToUser(client, `🤖 ⏰ Reminder: ${reminder.message}`);

        // If it's a one-time reminder, deactivate it
        if (reminder.frequency === 'once') {
            reminder.active = false;
            if (reminder.task) {
                reminder.task.stop();
            }
            console.log(`✅ One-time reminder completed: ${reminder.message}`);
        }
    });
}

/**
 * Delete a reminder by ID
 * @param {number} id - Reminder ID
 * @returns {boolean} - Success status
 */
export function deleteReminder(id) {
    const index = reminders.findIndex(r => r.id === id);

    if (index === -1) {
        return false;
    }

    const reminder = reminders[index];

    // Stop the cron task if it exists
    if (reminder.task) {
        reminder.task.stop();
    }

    reminders.splice(index, 1);
    console.log(`🗑️ Deleted reminder #${id}`);

    return true;
}

/**
 * List all reminders
 * @returns {Array} - Array of reminders
 */
export function listReminders() {
    return reminders.map(r => ({
        id: r.id,
        message: r.message,
        time: r.time,
        frequency: r.frequency,
        day: r.day,
        active: r.active
    }));
}

/**
 * Get reminder summary for display
 * @returns {string} - Formatted reminder list
 */
export function getReminderSummary() {
    if (reminders.length === 0) {
        return 'No reminders set. Use "remind me [message] at [time]" to create one.';
    }

    let summary = '⏰ Your Reminders:\n\n';

    const activeReminders = reminders.filter(r => r.active);

    if (activeReminders.length === 0) {
        return 'No active reminders.';
    }

    activeReminders.forEach(r => {
        const freqText = r.frequency === 'weekly' ? `${r.frequency} on ${r.day}` : r.frequency;
        summary += `#${r.id}: ${r.message}\n`;
        summary += `   ⏱️ ${r.time} (${freqText})\n\n`;
    });

    summary += `\nUse "delete reminder [id]" to remove a reminder.`;

    return summary;
}

export { reminders };
