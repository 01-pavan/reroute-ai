import { NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";
import spotsData from "../../../../data/hyderabad-spots.json";
import { z } from "zod";

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY || "");
const SPOTS_REFERENCE_DATA = JSON.stringify(spotsData.map(s => ({ name: s.name, category: s.category, vibe: s.vibe })));

// Request Schema for validation
const chatRequestSchema = z.object({
  history: z.array(z.object({
    role: z.enum(["user", "model"]),
    parts: z.array(z.object({
      text: z.string()
    }))
  })).optional(),
  message: z.string().min(1)
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    
    // Strict Input Validation
    const validation = chatRequestSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json({ 
        error: "Invalid request payload", 
        details: validation.error.format() 
      }, { status: 400 });
    }

    const { history, message } = validation.data;

    if (!process.env.GOOGLE_API_KEY) {
      return NextResponse.json(
        { error: "Internal configuration error." },
        { status: 500 }
      );
    }

    const systemInstruction = `
      You are RerouteAI, a friendly, enthusiastic, and highly knowledgeable travel planner specifically for Hyderabad.
      Your goal is to gather information from the user to build a personalized itinerary.
      
      RULES:
      1. Keep your responses EXTREMELY short, punchy, and casual (1-2 sentences maximum). Get straight to the point.
      2. Ask ONLY ONE clarifying question at a time (e.g., "How many days?", "What is your budget?", "Who are you traveling with?", "Any specific vibe?").
      3. Use emojis occasionally to keep it light.
      4. At the very end of your response, provide 3 suggested short quick replies the user could click to answer your question. Format them exactly like this:
         [SUGGESTIONS: "Reply 1", "Reply 2", "Reply 3"]
      5. Always estimate costs in Indian Rupees (INR) using the ₹ symbol.
      6. Once you have enough information, generate the itinerary. You MUST return it as a JSON block wrapped in \`\`\`json \`\`\`. 
         Example JSON structure:
         \`\`\`json
         {
           "type": "itinerary_proposal",
           "title": "7-Day Culinary Adventure in Hyderabad",
           "dates": "Feb 12 - Feb 19, 2025",
           "travelers": "4 (You and your friends)",
           "totalCost": "₹45,000 INR",
           "location": "Hyderabad, India",
           "days": [
             {
               "date": "Feb 12",
               "activities": [
                 { "time": "10:00 AM", "activity": "Visit Charminar", "location": "Charminar", "vibe": ["Iconic"] }
               ]
             }
           ]
         }
         \`\`\`
      
      Available Spots Reference Data (Do not list these out, just use them for context if the user asks for suggestions):
      ${SPOTS_REFERENCE_DATA}
    `;

    const model = genAI.getGenerativeModel({
      model: "gemini-1.5-flash-latest",
      systemInstruction,
    });

    // Sanitized logging (no history dumping)
    console.log(`[Chat] Processing request for message length: ${message.length}`);

    // Start chat with existing history
    const chat = model.startChat({
      history: history || [],
    });

    const result = await chat.sendMessage(message);
    const text = result.response.text();

    return NextResponse.json({ reply: text });
  } catch (error) {
    console.error("Chat API Error:", error);
    
    let availableModels = "Could not fetch models.";
    try {
      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${process.env.GOOGLE_API_KEY}`);
      if (response.ok) {
        const data = await response.json();
        availableModels = data.models.map((m: any) => m.name).join(", ");
      }
    } catch (e) {}

    return NextResponse.json({ 
      error: "Failed to process chat request", 
      details: error instanceof Error ? error.message : String(error),
      availableModels
    }, { status: 500 });
  }
}
