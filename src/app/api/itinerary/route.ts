import { NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";
import spotsData from "../../../../data/hyderabad-spots.json";

// Initialize the Gemini client
const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY || "");

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { vibe, budget, duration } = body;

    if (!process.env.GOOGLE_API_KEY) {
      return NextResponse.json(
        { error: "GOOGLE_API_KEY is not configured in the environment." },
        { status: 500 }
      );
    }

    const model = genAI.getGenerativeModel({
      model: "gemini-1.5-pro",
      systemInstruction: "You are an expert Hyderabad Travel Architect. Your goal is to take a list of local spots and a user's 'vibe' and return a strict JSON itinerary.",
      generationConfig: {
        responseMimeType: "application/json",
      }
    });

    const prompt = `
      Create a detailed travel itinerary.
      
      User Preferences:
      - Vibe: ${vibe || "General Explorer"}
      - Budget: ${budget || "Moderate"}
      - Duration: ${duration || "8"} hours
      
      Available Spots with average durations (in minutes):
      ${JSON.stringify(spotsData, null, 2)}

      Constraints:
      1. ONLY use the provided Available Spots.
      2. Respect the 'avg_duration' (in minutes) for each spot. Do not schedule more spots than the total duration allows. Include travel time between spots in your scheduling.
      3. Return ONLY a strict JSON object with an 'itinerary' array containing objects with the following schema:
         - time (string, e.g., "09:00 AM")
         - activity (string, e.g., "Visit Charminar")
         - location (string, name of the spot)
         - vibe (array of strings, matching the spot's vibes)
    `;

    const result = await model.generateContent(prompt);
    const text = result.response.text();
    
    let itineraryJson;
    try {
      itineraryJson = JSON.parse(text);
    } catch (parseError) {
      console.error("Failed to parse Gemini response as JSON", text);
      throw new Error("Invalid JSON from Gemini");
    }

    return NextResponse.json(itineraryJson);
  } catch (error) {
    console.error("Itinerary Generation Error:", error);
    return NextResponse.json({ error: "Failed to process request" }, { status: 500 });
  }
}
