# Travel Planning & Experience Engine: Technical Blueprint

## Project Overview
A high-intensity AI travel agent built for the PromptWars Hyderabad hackathon. The engine focuses on "Agentic Reasoning" to move beyond static itineraries into dynamic, context-aware experience planning.

## Tech Stack
- **Framework:** Next.js 15 (App Router)
- **Styling:** Tailwind CSS + Shadcn/UI (Dark Mode)
- **AI Brain:** Google Vertex AI (Gemini 1.5 Pro)
- **Deployment:** Google Cloud Run (Standalone Output)

## Core Feature: The "Adaptive Re-Router" (Hero Feature)
The engine must handle real-time "Pivots" when external constraints change.
- **Logic:** Instead of a full refresh, the AI performs a JSON patch on the existing itinerary.
- **Triggers:** Rain, High Traffic, User Fatigue, or "Hidden Gem" discovery.
- **Constraint Preservation:** The AI must keep 'Anchor Points' (e.g., fixed dinner reservations or flights) while re-routing the mid-day activities.

## Data Schema (`/data/spots.json`)
Every location must follow this structure for AI parsing:
```json
{
  "id": "string",
  "name": "string",
  "category": "Food | History | Leisure | Shopping",
  "vibe": ["Peaceful", "Crowded", "InstaWorthy", "Culture"],
  "indoor": true/false,
  "avg_duration": "number (minutes)",
  "coordinates": { "lat": 0, "lng": 0 }
}