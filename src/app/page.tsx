"use client";

import { useState } from "react";
import { Sparkles, Compass } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

// Mock Data for Quick Starts
const quickStarts = [
  {
    id: 1,
    title: "Nizam's Royal History",
    tags: ["Culture", "Morning", "Heritage"],
    image: "https://images.unsplash.com/photo-1599661559862-5813e33fc4a7?q=80&w=600&auto=format&fit=crop"
  },
  {
    id: 2,
    title: "The Ultimate Biryani Tour",
    tags: ["Foodie", "Afternoon", "Spicy"],
    image: "https://images.unsplash.com/photo-1631515243349-e0cb75fb8d3a?q=80&w=600&auto=format&fit=crop"
  },
  {
    id: 3,
    title: "Lakeside Sunset & Chill",
    tags: ["Leisure", "Evening", "Views"],
    image: "https://images.unsplash.com/photo-1596704044734-7dbca1b369c0?q=80&w=600&auto=format&fit=crop"
  }
];

export default function Dashboard() {
  const [itinerary, setItinerary] = useState<any[] | null>(null);

  if (!itinerary) {
    return (
      <div className="min-h-screen bg-background text-foreground flex flex-col items-center justify-center p-8">

        {/* Launchpad Container */}
        <div className="w-full max-w-5xl flex flex-col items-center justify-center space-y-20 animate-in fade-in zoom-in-95 duration-700">

          {/* A. WELCOME HERO (Centered) */}
          <div className="text-center space-y-8 max-w-3xl">
            <h1 className="text-4xl md:text-5xl font-bold tracking-tight">
              Welcome to Hyderabad, <span className="text-indigo-400">Pavan!</span>
            </h1>
            <p className="text-xl text-muted-foreground">
              The first intelligent engine that adapts your plans in real-time. Where shall we start?
            </p>

            <div className="pt-4 flex justify-center">
              <Button
                onClick={() => setItinerary([])}
                size="lg"
                className="relative px-8 py-6 text-lg bg-indigo-600 hover:bg-indigo-700 shadow-lg"
              >
                {/* Pulsing border effect */}
                <span className="absolute -inset-1 rounded-lg border border-indigo-500/50 animate-[pulse_2s_cubic-bezier(0.4,0,0.6,1)_infinite]"></span>
                <Sparkles className="w-5 h-5 mr-3 group-hover:animate-spin" />
                Start My First Journey
              </Button>
            </div>
          </div>

          {/* B. QUICK-START CARDS (Grid Layout) */}
          <div className="w-full space-y-6 pt-8">
            <h2 className="text-2xl font-semibold text-left">
              Explore Quick Starts <span className="text-muted-foreground text-lg font-normal ml-2">(Or try your own vibe on the left)</span>
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {quickStarts.map((start) => (
                <Card
                  key={start.id}
                  className="group overflow-hidden cursor-pointer hover:border-indigo-500/50 transition-all hover:shadow-[0_0_20px_rgba(99,102,241,0.15)] py-0"
                  onClick={() => setItinerary([])}
                >
                  <div className="h-44 w-full overflow-hidden">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={start.image}
                      alt={start.title}
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105 opacity-80 group-hover:opacity-100"
                    />
                  </div>
                  <CardHeader>
                    <CardTitle className="truncate">{start.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-wrap gap-2">
                      {start.tags.map(tag => (
                        <Badge key={tag} variant="secondary" className="bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

        </div>
      </div>
    );
  }

  // Active State: Experience Timeline (Shows after clicking Start)
  return (
    <div className="min-h-screen bg-background text-foreground p-8 flex animate-in fade-in slide-in-from-right-16 duration-500">
      <div className="w-full max-w-5xl mx-auto space-y-8">
        <div className="flex items-center justify-between">
          <h2 className="text-3xl font-bold tracking-tight">Your Experience Timeline</h2>
          <Button
            variant="ghost"
            onClick={() => setItinerary(null)}
          >
            &larr; Back to Launchpad
          </Button>
        </div>

        {/* Placeholder for the vertical timeline */}
        <div className="space-y-6 border-l-2 border-border ml-4 pl-8 py-8">
          <div className="relative">
             <div className="absolute left-[-37px] top-1 h-3 w-3 rounded-full bg-indigo-500 shadow-[0_0_10px_rgba(99,102,241,0.5)]"></div>
             <p className="text-muted-foreground">Loading your personalized itinerary...</p>
          </div>
        </div>

        {/* LIFE HAPPENS FAB - Only visible in active state */}
        <Button
          size="icon"
          className="fixed bottom-8 right-8 h-16 w-16 rounded-full bg-indigo-600 hover:bg-indigo-500 shadow-[0_0_20px_rgba(99,102,241,0.3)] hover:scale-110 transition-all z-50"
        >
           <Compass className="w-7 h-7" />
           <span className="sr-only">Life Happens / Re-route</span>
        </Button>
      </div>
    </div>
  );
}
