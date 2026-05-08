# RerouteAI: Your Adaptive Travel Companion

**RerouteAI** is a high-end, conversational travel planning engine built for the modern traveler. Instead of static plans, it offers a dynamic, real-time experience that adapts to your environment and changing needs.

## 🚀 Google Services Integration

This project is built from the ground up to showcase the power of the **Google Cloud Ecosystem**:

1. **Google Gemini API (Gemini 2.0 Flash Lite)**:
   - **Conversational Planning**: Orchestrates the initial trip planning flow by asking smart, clarifying questions.
   - **Dynamic Suggested Answers**: Analyzes context to provide one-tap quick reply options for a frictionless user experience.
   - **Adaptive Re-Router (Hero Feature)**: Acts as an intelligent JSON patcher to modify itineraries mid-trip based on constraints (e.g., "It's raining," "Change the plan").
   
2. **Google Maps Embed API**:
   - Provides fully interactive, real-time map previews for every generated itinerary, centered dynamically on the destination.

3. **Google Cloud Build**:
   - Automated CI/CD pipeline for building container images and managing deployments.

4. **Google Container Registry (GCR)**:
   - Secure storage and management for the application's Docker images.

5. **Google Cloud Run**:
   - Serverless hosting that allows the application to scale automatically while maintaining lightning-fast performance.

## ✨ Features

- **Adaptive Re-Router**: Pivot your plans mid-trip. The AI intelligently swaps activities while preserving "Anchor Points" like flights and hotels.
- **Dynamic Quick Replies**: Build your entire trip with single-tap suggested answers.
- **Hyderabad-Specific Intelligence**: Grounded in a curated database of local spots to ensure zero hallucinations and maximum cultural relevance.
- **Premium UI**: Sleek, Airbnb-inspired light aesthetic with rose-colored accents and smooth animations.

## 🛠️ Tech Stack

- **Framework**: Next.js (App Router)
- **Styling**: Tailwind CSS v4
- **AI**: Google Generative AI (@google/generative-ai)
- **Deployment**: Docker, Google Cloud Build, Google Cloud Run

## 📦 Getting Started

1. **Environment Variables**:
   Create a `.env` file and add your Google API Key:
   ```env
   GOOGLE_API_KEY=your_api_key_here
   ```

2. **Run Locally**:
   ```bash
   pnpm install
   pnpm dev
   ```

3. **Deploy to Cloud Run**:
   ```bash
   gcloud builds submit --config cloudbuild.yaml .
   ```
