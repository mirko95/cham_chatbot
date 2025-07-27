
import { GoogleGenAI } from "@google/genai";
import { knowledgeBase } from '../data/knowledgeBase';
import { GEMINI_MODEL } from '../constants';

if (!process.env.API_KEY) {
  // In a real app, you'd want to handle this more gracefully.
  // For this project, we assume the key is set in the environment.
  // This alert is for development purposes to highlight a missing key.
  // alert("API_KEY environment variable not set. The chatbot will not work.");
  console.warn("API_KEY environment variable not set. Using a placeholder key. Chatbot functionality will be limited.");
}


const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || "API_KEY_PLACEHOLDER" });

// Simple retrieval function
const retrieveContext = (query: string): string => {
  const queryWords = query.toLowerCase().split(/\s+/);
  const relevantEntries = knowledgeBase.filter(entry =>
    entry.keywords.some(keyword => queryWords.includes(keyword.toLowerCase())) ||
    entry.content.toLowerCase().includes(query.toLowerCase())
  );

  if (relevantEntries.length === 0) {
    return '';
  }

  return relevantEntries.map(entry => `From ${entry.path}:\n${entry.content}`).join('\n\n');
};

export const getAnswer = async (query: string): Promise<string> => {
  const context = retrieveContext(query);

  let finalPrompt: string;

  if (context) {
    finalPrompt = `You are a helpful and friendly customer support assistant for a company. Your name is Chameleon.
    Answer the user's question based *only* on the context provided below. Be concise and clear.
    If the context does not contain the answer to the question, you MUST say "I'm sorry, I couldn't find information about that. Would you like to contact support?".
    Do not make up information. Do not use any knowledge outside of the provided context.

    CONTEXT:
    ---
    ${context}
    ---

    USER'S QUESTION:
    ${query}`;
  } else {
    // If no context is found, we can have a more general prompt.
    finalPrompt = `You are a helpful and friendly customer support assistant for a company. Your name is Chameleon.
    The user asked: "${query}".
    You do not have specific information about this query. Apologize and ask if they would like to contact support for more help.
    For example, say: "I'm sorry, I couldn't find information about that. Would you like to contact support?".
    `;
  }

  try {
    const response = await ai.models.generateContent({
        model: GEMINI_MODEL,
        contents: finalPrompt,
        config: {
             // Disable thinking for faster, more direct responses appropriate for a Q&A bot
            thinkingConfig: { thinkingBudget: 0 }
        }
    });
    return response.text;
  } catch (error) {
    console.error("Error generating content with Gemini:", error);
    return "I'm experiencing technical difficulties. Please try again in a moment.";
  }
};
