import { GoogleGenAI } from "@google/genai";

if (!process.env.API_KEY) {
    console.warn("API_KEY environment variable not set. Gemini API calls will fail.");
}

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY! });

export const generateDescription = async (productName: string, productCategory: string): Promise<string> => {
    const prompt = `Generate a short, compelling, and professional sales description for a ${productCategory.toLowerCase()} item named "${productName}". The description should be 2-3 sentences long and highlight its key benefits for a customer.`;

    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
        });

        return response.text;
    } catch (error) {
        console.error("Error calling Gemini API:", error);
        throw new Error("Could not generate description from Gemini API.");
    }
};