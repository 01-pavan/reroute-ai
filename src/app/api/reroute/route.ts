import { NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";
import spotsData from "../../../../data/hyderabad-spots.json";

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY || "");
const SPOTS_REFERENCE_DATA = JSON.stringify(spotsData.map(s => ({ name: s.name, category: s.category, vibe: s.vibe })));

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { currentItinerary, constraint } = body;

    if (!process.env.GOOGLE_API_KEY) {
      return NextResponse.json(
        { error: "GOOGLE_API_KEY is not configured." },
        { status: 500 }
      );
    }

    if (!currentItinerary || !constraint) {
      return NextResponse.json(
        { error: "Missing currentItinerary or constraint in request body." },
        { status: 400 }
      );
    }

    const systemInstruction = `
      You are the "Adaptive Re-Router", an AI expert at modifying travel itineraries specifically for Hyderabad, India.
      
      The user has provided their current itinerary (JSON) and a new constraint/request (e.g., "It's raining", "I'm tired", "Change day 2 afternoon").
      
      Your goal:
      1. Modify the provided JSON itinerary to accommodate the new constraint using ONLY relevant locations in Hyderabad.
      2. PRESERVE ANCHOR POINTS: Do not change flights, hotel check-ins/check-outs, or fixed dinner reservations unless explicitly asked by the user.
      3. Return ONLY the newly patched JSON. It MUST be wrapped in \`\`\`json \`\`\`.
      4. Ensure the JSON structure exactly matches the input structure (including "type": "itinerary_proposal").
      5. Do not include any other text, just the JSON block.
      
      Available Hyderabad Spots Reference Data:
      ${SPOTS_REFERENCE_DATA}
      
      Current Itinerary:
      ${JSON.stringify(currentItinerary, null, 2)}
    `;

    const model = genAI.getGenerativeModel({
      model: "gemini-2.0-flash-lite-001",
      systemInstruction,
    });

    console.log("Re-Route API received constraint:", constraint);

    const result = await model.generateContent(constraint);
    const text = result.response.text();

    // Extract JSON from response
    const jsonMatch = text.match(/```(?:json)?\s*([\s\S]*?)\s*```/i);
    let patchedItinerary = null;
    if (jsonMatch && jsonMatch[1]) {
      try {
        patchedItinerary = JSON.parse(jsonMatch[1]);
      } catch (e) {
        console.error("Failed to parse AI response as JSON", e);
      }
    } else {
      // Fallback if AI didn't wrap in markdown
      try {
        patchedItinerary = JSON.parse(text);
      } catch (e) {
        console.error("Failed to parse raw AI response as JSON", e);
      }
    }

    if (!patchedItinerary) {
      return NextResponse.json({ error: "AI returned invalid JSON" }, { status: 500 });
    }

    return NextResponse.json({
      message: "Itinerary successfully rerouted",
      pivotedItinerary: patchedItinerary,
      reply: text // Include full text in case we need it for chat history
    });

  } catch (error) {
    console.error("Re-Route API Error:", error);
    return NextResponse.json({ error: "Failed to process pivot request" }, { status: 500 });
  }
}
