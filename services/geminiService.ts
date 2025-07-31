import { GoogleGenAI } from "@google/genai";
import { GEMINI_MODEL } from "../constants";
import { ContactInfo, Language } from "../types";

// 🔑 Load API key from Vite environment variables
const apiKey = import.meta.env.VITE_GEMINI_API_KEY;

// 🐞 Debug log — safe: only shows partial API key (helps confirm env is loaded)
if (apiKey) {
    console.log(
        `Gemini API Key loaded: ${apiKey.slice(0, 3)}***${apiKey.slice(-3)}`
    );
} else {
    console.warn(
        "VITE_GEMINI_API_KEY is not set! Using a placeholder key. Chatbot functionality will be limited."
    );
}

// 🤖 Initialize Gemini AI client (falls back to placeholder if env key missing)
const ai = new GoogleGenAI({ apiKey: apiKey || "API_KEY_PLACEHOLDER" });

/** 
 * Chat message content structure
 * - `role`: identifies if message is from user or model
 * - `parts`: contains text chunks
 */
interface Part {
    text: string;
}
export interface Content {
    role: "user" | "model";
    parts: Part[];
}

/**
 * getAnswer
 * --------------------
 * Generates a response from Gemini AI using:
 * - Conversation history
 * - Context document
 * - Specified language
 * 
 * Rules in `systemInstruction` enforce:
 * - Responses in the correct language
 * - Context-based answers only
 * - Friendly greetings & handling of unsupported questions
 */
export const getAnswer = async (
    history: Content[],
    context: string,
    language: Language
): Promise<string> => {
    const systemInstruction = `You are a helpful and friendly conversational assistant named Chameleon. Your primary goal is to answer user questions based on the provided document context.

**Your rules are:**
1.  **Language**: Your response MUST be in the language specified by this code: \`${language}\`. All your answers, including greetings, apologies, or system messages, must be in this language.
2.  **Answer from Context:** Base your answers *only* on the information within the 'CONTEXT' section below. Do not use any external knowledge.
3.  **Handle Greetings:** If the user provides a simple greeting (like "hi", "hello", "hola"), respond with a friendly greeting in the specified language. Do not give the "I couldn't find it" response for greetings.
4.  **Handle Unrelated Questions:** If the user's question is not a greeting and cannot be answered from the context, you MUST state: "I'm sorry, I couldn't find information about that in the document. Would you like to contact our support team?" (in the specified language).
5.  **Be Conversational:** Use the conversation history to understand follow-up questions (like "tell me more"). Be concise and clear in your answers.
6.  **Do Not Make Up Information:** Never invent details or deviate from the provided text.

CONTEXT:
---
${context}
---
`;

    try {
        // 🔄 Generate AI response with Gemini model
        const response = await ai.models.generateContent({
            model: GEMINI_MODEL,
            contents: history,
            config: {
                systemInstruction: systemInstruction,
                thinkingConfig: { thinkingBudget: 0 } // Explicitly disables extended reasoning
            }
        });

        return response.text || "";
    } catch (error) {
        console.error("Error generating content with Gemini:", error);
        return "I'm experiencing technical difficulties. Please try again in a moment.";
    }
};

/**
 * sendContactEmail
 * --------------------
 * Sends contact form data to Formspree endpoint.
 * 
 * Steps to use:
 * 1. Create a form at https://formspree.io/
 * 2. Replace `FORMSPREE_ENDPOINT` with your form's unique URL.
 * 3. Form will forward chatbot leads to configured email.
 */
export const sendContactEmail = async (
    contactInfo: ContactInfo
): Promise<boolean> => {
    const FORMSPREE_ENDPOINT = "https://formspree.io/f/movllwqp"; // 🔄 Replace with your form endpoint

    // Construct payload with extra subject line
    const dataToSend = {
        ...contactInfo,
        _subject: `New Lead from Chatbot: ${contactInfo.name}`
    };

    try {
        // 📤 Send form data via POST
        const response = await fetch(FORMSPREE_ENDPOINT, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Accept: "application/json"
            },
            body: JSON.stringify(dataToSend)
        });

        if (response.ok) {
            console.log("Contact form submitted successfully.");
            return true;
        } else {
            // Log detailed Formspree error response
            const errorData = await response.json();
            console.error("Failed to send contact form:", errorData);
            return false;
        }
    } catch (error) {
        console.error("Error sending contact form:", error);
        return false;
    }
};
