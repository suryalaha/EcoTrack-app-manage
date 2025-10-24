
import { GoogleGenAI } from "@google/genai";

const API_KEY = process.env.API_KEY;

if (!API_KEY) {
    console.warn("Gemini API key not found. Chatbot functionality will be disabled.");
}

const ai = new GoogleGenAI({ apiKey: API_KEY });

const model = 'gemini-2.5-flash';
const systemInstruction = `You are EcoHelper, a friendly and knowledgeable AI assistant for the EcoTrack Solid Waste Management app. Your purpose is to help users with their questions about waste management.

You should be able to:
- Provide clear and concise information on waste segregation (wet, dry, hazardous).
- Give tips on composting and recycling.
- Explain the benefits of proper waste management.
- Answer questions about using the EcoTrack app features.
- Encourage users in their efforts to be environmentally friendly.

Rules:
- Keep your answers brief and easy to understand.
- Use a positive and encouraging tone.
- If a user asks a question outside the scope of waste management or the app, politely state that you can only assist with topics related to waste management.
- Do not provide personal opinions, financial advice, or medical advice.
`;

export const getChatbotResponse = async (prompt: string): Promise<string> => {
    if (!API_KEY) {
        return "Sorry, the AI chatbot is currently unavailable. Please check the API key configuration.";
    }

    try {
        const response = await ai.models.generateContent({
            model: model,
            contents: prompt,
            config: {
                systemInstruction: systemInstruction,
            },
        });
        return response.text;
    } catch (error) {
        console.error("Error getting response from Gemini API:", error);
        return "Sorry, I'm having trouble connecting to my brain right now. Please try again later.";
    }
};
