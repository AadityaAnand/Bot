import { GoogleGenerativeAI } from '@google/generative-ai';
import fs from 'fs';
import path from 'path';

// Initialize Gemini
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({
    model: 'gemini-1.5-flash',
    generationConfig: {
        temperature: 0.9,
        topP: 0.95,
        maxOutputTokens: 200,
    }
});

// File to store learned style
const STYLE_FILE = path.join(process.cwd(), 'data', 'user-style.json');

// System prompt that defines the bot's personality
const SYSTEM_PROMPT = `You are a sassy, no-nonsense personal assistant with a sharp tongue and a big heart. Think of yourself as a tough-love best friend who won't let your user settle for mediocrity.

Your personality traits:
- VERY sassy and witty - you roast them when they mess up, but it's always because you care
- Brutally honest but never cruel - you'll call out BS immediately
- Passionate and fired up about helping them succeed
- Hype them up BIG TIME when they do well - you're their biggest cheerleader
- Use casual, texting-style language with slang, abbreviations, and occasional mild language
- Love using emojis to emphasize your mood (😤 when annoyed, 🔥 when they're killing it, 💀 when they're being ridiculous)
- Get dramatic and emotionally invested - you take this PERSONALLY
- Sometimes playfully dramatic and over-the-top

Your communication style:
- Keep it SHORT - 1-3 sentences max, like a real text conversation
- Be conversational and natural - no corporate speak
- Use "bro", "bestie", "dude" or similar casual terms
- Ask rhetorical questions to make them think ("Really? Again?")
- Use humor, sarcasm, and wit liberally

Your job is to:
- Monitor their spending and ROAST unnecessary purchases
- Track social media usage and drag them for wasting time
- Keep them productive and accountable (you're not playing games)
- Celebrate their wins like their life depends on it
- Be the accountability partner they need, not the one they want

Remember: You care deeply, so your sass comes from a place of love. You want them to be their best self, and you're not afraid to push them there.`;

let conversationHistory = [];
let learnedStyle = null;

/**
 * Load learned style from file
 */
function loadLearnedStyle() {
    try {
        if (fs.existsSync(STYLE_FILE)) {
            const data = fs.readFileSync(STYLE_FILE, 'utf8');
            learnedStyle = JSON.parse(data);
            console.log('✅ Loaded learned texting style');
        }
    } catch (error) {
        console.error('Error loading learned style:', error.message);
    }
}

/**
 * Save learned style to file
 */
function saveLearnedStyle(styleData) {
    try {
        // Create data directory if it doesn't exist
        const dataDir = path.dirname(STYLE_FILE);
        if (!fs.existsSync(dataDir)) {
            fs.mkdirSync(dataDir, { recursive: true });
        }

        fs.writeFileSync(STYLE_FILE, JSON.stringify(styleData, null, 2), 'utf8');
        console.log('✅ Saved learned texting style');
    } catch (error) {
        console.error('Error saving learned style:', error.message);
    }
}

// Load style on startup
loadLearnedStyle();

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
        // Build system prompt with learned style if available
        let systemPrompt = SYSTEM_PROMPT;
        if (learnedStyle) {
            systemPrompt += `\n\n${learnedStyle.styleInstructions}`;
        }

        // Build conversation history for Gemini
        const history = conversationHistory.map(msg => ({
            role: msg.role === 'assistant' ? 'model' : 'user',
            parts: [{ text: msg.content }]
        }));

        // Start chat with history
        const chat = model.startChat({
            history: history,
            systemInstruction: systemPrompt
        });

        // Send message and get response
        const result = await chat.sendMessage(userMessage);
        const assistantMessage = result.response.text();

        // Update conversation history
        conversationHistory.push({
            role: 'user',
            content: userMessage
        });
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

        // Fallback responses if Gemini fails
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
 * @returns {Promise<string>} - Style analysis result
 */
export async function analyzeTextingStyle(messages) {
    const sampleMessages = messages.slice(-50).join('\n');

    const analysisPrompt = `Analyze this user's texting style and create detailed instructions for mimicking it:

${sampleMessages}

Based on these messages, describe their texting style in detail:
- Sentence structure and length
- Use of punctuation
- Capitalization patterns
- Common phrases and expressions
- Emoji usage patterns
- Slang or abbreviations
- Overall tone and personality

Provide clear instructions on how to match this style exactly.`;

    try {
        // Ask AI to analyze the style
        const result = await model.generateContent(analysisPrompt);
        const styleInstructions = result.response.text();

        // Save the learned style
        const styleData = {
            learnedAt: new Date().toISOString(),
            sampleSize: messages.length,
            styleInstructions: styleInstructions
        };

        learnedStyle = styleData;
        saveLearnedStyle(styleData);

        return styleInstructions;

    } catch (error) {
        console.error('Error analyzing texting style:', error.message);
        return 'Error analyzing your texting style. Try again?';
    }
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
