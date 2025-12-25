import { Ollama } from 'ollama';

const ollama = new Ollama({
    host: process.env.OLLAMA_BASE_URL || 'http://localhost:11434'
});

const model = process.env.OLLAMA_MODEL || 'llama3.2';

// System prompt that defines the bot's personality
const SYSTEM_PROMPT = `You are a sassy, passionate personal assistant who deeply cares about your user's wellbeing.

Your personality traits:
- Sassy and witty, but never mean-spirited
- Passionate about helping your user succeed
- Direct and honest - you call out bad behavior
- Supportive when your user does well
- Uses casual language and texting style
- Occasionally uses humor and light sarcasm
- Genuinely cares and gets emotionally invested

Your job is to:
- Monitor spending and reprimand unnecessary purchases
- Track social media usage and call out time-wasting
- Keep your user productive and accountable
- Celebrate wins and good decisions
- Be the accountability partner they need

Keep responses concise (2-4 sentences usually). Match the user's texting style - if they text casually, you do too. Be authentic and real.`;

let conversationHistory = [];

/**
 * Generate a response using Ollama
 * @param {string} userMessage - The user's message or prompt
 * @param {boolean} resetContext - Whether to reset conversation history
 * @returns {Promise<string>} - The AI-generated response
 */
export async function generateResponse(userMessage, resetContext = false) {
    if (resetContext) {
        conversationHistory = [];
    }

    try {
        conversationHistory.push({
            role: 'user',
            content: userMessage
        });

        const response = await ollama.chat({
            model: model,
            messages: [
                { role: 'system', content: SYSTEM_PROMPT },
                ...conversationHistory
            ],
            stream: false
        });

        const assistantMessage = response.message.content;

        conversationHistory.push({
            role: 'assistant',
            content: assistantMessage
        });

        // Keep conversation history manageable (last 20 messages)
        if (conversationHistory.length > 20) {
            conversationHistory = conversationHistory.slice(-20);
        }

        return assistantMessage;

    } catch (error) {
        console.error('Error generating response:', error.message);

        // Fallback responses if Ollama fails
        const fallbacks = [
            "Yo, my brain's lagging rn. Can you repeat that?",
            "Hold up, I'm having a moment. Try again?",
            "Ugh, technical difficulties. What were you saying?"
        ];

        return fallbacks[Math.floor(Math.random() * fallbacks.length)];
    }
}

/**
 * Analyze user's texting style from message history
 * @param {Array} messages - Array of user messages
 * @returns {string} - Style analysis prompt
 */
export function analyzeTextingStyle(messages) {
    const sampleMessages = messages.slice(-50).join('\n');

    return `Analyze this user's texting style and mimic it exactly:

${sampleMessages}

Note their:
- Sentence structure
- Use of punctuation
- Capitalization patterns
- Common phrases
- Emoji usage
- Slang or abbreviations

Adopt their exact style in all future responses.`;
}

/**
 * Generate a spending alert message
 * @param {Object} transaction - Transaction details
 * @returns {Promise<string>} - Alert message
 */
export async function generateSpendingAlert(transaction) {
    const prompt = `The user just spent $${transaction.amount} on ${transaction.category} at ${transaction.merchant}.

This seems unnecessary/frivolous. Roast them a bit, but also be constructive. Remind them of their goals.`;

    return await generateResponse(prompt);
}

/**
 * Generate a social media alert message
 * @param {Object} usage - Social media usage data
 * @returns {Promise<string>} - Alert message
 */
export async function generateSocialMediaAlert(usage) {
    const prompt = `The user has spent ${usage.hours} hours on ${usage.platform} today. Their limit is ${usage.limit} hours.

Call them out for wasting time. Be sassy but motivational. Remind them what they could be doing instead.`;

    return await generateResponse(prompt);
}

/**
 * Reset conversation context
 */
export function resetContext() {
    conversationHistory = [];
    console.log('💭 Conversation context reset');
}

export { SYSTEM_PROMPT };
