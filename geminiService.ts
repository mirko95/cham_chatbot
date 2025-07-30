
import { GoogleGenAI } from "@google/genai";
import { GEMINI_MODEL } from './constants';
import { ContactInfo, Language } from "./types";

if (!process.env.API_KEY) {
  console.warn("API_KEY environment variable not set. Using a placeholder key. Chatbot functionality will be limited.");
}

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || "API_KEY_PLACEHOLDER" });

interface Part {
    text: string;
}
export interface Content {
    role: 'user' | 'model';
    parts: Part[];
}

export const getAnswer = async (history: Content[], context: string, language: Language): Promise<string> => {
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
    const response = await ai.models.generateContent({
        model: GEMINI_MODEL,
        contents: history,
        config: {
            systemInstruction: systemInstruction,
            thinkingConfig: { thinkingBudget: 0 }
        }
    });
    return response.text ?? "I'm experiencing technical difficulties. Please try again in a moment.";
  } catch (error) {
    console.error("Error generating content with Gemini:", error);
    return "I'm experiencing technical difficulties. Please try again in a moment.";
  }
};

export const sendContactEmail = async (contactInfo: ContactInfo): Promise<boolean> => {
    // IMPORTANT: To make this work, you need to replace the placeholder URL below.
    // 1. Go to https://formspree.io/ and create a new form.
    // 2. You will be given an endpoint URL.
    // 3. Replace 'YOUR_FORM_ID_HERE' with your actual form ID.
    const FORMSPREE_ENDPOINT = 'https://formspree.io/f/YOUR_FORM_ID_HERE';

    // We send the raw data to Formspree, which will format and send the email.
    // Formspree uses the `_subject` field to set the email subject line.
    const dataToSend = {
        ...contactInfo,
        _subject: `New Lead from Chatbot: ${contactInfo.name}`,
    };

    try {
        const response = await fetch(FORMSPREE_ENDPOINT, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            body: JSON.stringify(dataToSend)
        });

        if (response.ok) {
            console.log("Contact form submitted successfully.");
            return true;
        } else {
            const errorData = await response.json();
            console.error("Failed to send contact form:", errorData);
            return false;
        }
    } catch (error) {
        console.error("Error sending contact form:", error);
        return false;
    }
};
