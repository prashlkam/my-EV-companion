
import { GoogleGenAI, Type } from "@google/genai";
import { AppState, AIRecommendation } from '../types';

const getAIRecommendations = async (appState: AppState): Promise<AIRecommendation[]> => {
  if (!process.env.API_KEY) {
    throw new Error("API_KEY environment variable not set");
  }

  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

  const prompt = `
    As an expert EV analyst, your task is to provide recommendations for an EV owner based on their vehicle data and logged events.
    Analyze the following data and provide 3-5 actionable recommendations.

    Data:
    ${JSON.stringify(appState, null, 2)}

    Focus on these areas:
    1.  **Battery Health:** Analyze charging patterns (e.g., frequent DCFC, charging to 100%). Recommend best practices for longevity.
    2.  **Driving Efficiency:** Look at trip data. Suggest ways to improve range and reduce energy consumption.
    3.  **Maintenance:** Based on service logs, faults, and odometer readings, suggest potential upcoming maintenance needs.
    4.  **Overall Usage:** Provide general tips based on the overall picture of the vehicle's use.

    Provide a concise title, a clear recommendation, and a brief rationale for each point.
    `;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              title: {
                type: Type.STRING,
                description: "A short, catchy title for the recommendation.",
              },
              recommendation: {
                type: Type.STRING,
                description: "The specific, actionable advice for the user.",
              },
              rationale: {
                type: Type.STRING,
                description: "A brief explanation of why this recommendation is being made based on the user's data.",
              },
            },
            required: ["title", "recommendation", "rationale"],
          },
        },
      },
    });
    
    const jsonString = response.text.trim();
    const recommendations: AIRecommendation[] = JSON.parse(jsonString);
    return recommendations;

  } catch (error) {
    console.error("Error fetching AI recommendations:", error);
    if (error instanceof Error) {
       return [{
           title: "Error",
           recommendation: "Could not fetch AI recommendations. Please check your API key and network connection.",
           rationale: error.message
       }];
    }
    return [{
       title: "Error",
       recommendation: "An unknown error occurred while fetching AI recommendations.",
       rationale: "Please try again later."
    }];
  }
};

export default getAIRecommendations;
