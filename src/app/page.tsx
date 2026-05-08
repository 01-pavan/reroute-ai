"use client";

import { useState, useRef, useEffect } from "react";
import { ArrowRight, Compass, Sparkles, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ItineraryProposalCard, ItineraryProposal } from "@/components/ItineraryProposalCard";
import { ItineraryDetailsPanel } from "@/components/ItineraryDetailsPanel";

// Abstract Ambient Elements for background
const ambientCards = [
  { id: 1, title: "Heritage Walks", icon: "🏛️", position: "top-[15%] left-[10%]", blur: "blur-[1px]", delay: "0s" },
  { id: 2, title: "Culinary Tours", icon: "🌶️", position: "top-[25%] right-[15%]", blur: "blur-[0px]", delay: "1.5s" },
  { id: 3, title: "Hidden Gems", icon: "💎", position: "bottom-[30%] left-[20%]", blur: "blur-[2px]", delay: "0.5s" },
  { id: 4, title: "Sunset Views", icon: "🌅", position: "bottom-[20%] right-[10%]", blur: "blur-[0px]", delay: "2s" },
];

// Helper to extract JSON and suggestions from AI response
const parseMessage = (text: string) => {
  let cleanText = text;
  let proposal = null;
  let suggestions: string[] = [];

  // Extract suggestions
  const sugMatch = cleanText.match(/\[SUGGESTIONS:\s*([\s\S]*?)\]/i);
  if (sugMatch && sugMatch[1]) {
    try {
      suggestions = JSON.parse(`[${sugMatch[1]}]`);
    } catch (e) {
      console.error("Failed to parse suggestions", e);
    }
    cleanText = cleanText.replace(/\[SUGGESTIONS:\s*([\s\S]*?)\]/i, "").trim();
  }

  // Extract JSON
  const jsonMatch = cleanText.match(/```(?:json)?\s*([\s\S]*?)\s*```/i);
  if (jsonMatch && jsonMatch[1]) {
    try {
      const parsed = JSON.parse(jsonMatch[1]);
      if (parsed.type === "itinerary_proposal") {
        proposal = parsed as ItineraryProposal;
        cleanText = cleanText.replace(/```(?:json)?\s*[\s\S]*?\s*```/i, "").trim();
      }
    } catch (e) {
      console.error("Failed to parse proposal JSON", e);
    }
  }
  
  return { text: cleanText, proposal, suggestions };
};

export default function Dashboard() {
  const [query, setQuery] = useState("");
  const [isChatActive, setIsChatActive] = useState(false);
  const [messages, setMessages] = useState<{ role: "user" | "model"; text: string }[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const [selectedProposal, setSelectedProposal] = useState<ItineraryProposal | null>(null);
  const chatEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll chat
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  const startChat = async (initialQuery: string) => {
    if (!initialQuery.trim()) return;
    setIsChatActive(true);
    setQuery("");
    
    const newUserMsg = { role: "user" as const, text: initialQuery };
    setMessages([newUserMsg]);
    setIsTyping(true);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ history: [], message: initialQuery }),
      });
      const data = await response.json();
      if (data.error) {
        console.error("API Error Details:", data.details);
      }
      const reply = data.reply || "Sorry, I couldn't process that right now.";
      setMessages([{ role: "user", text: initialQuery }, { role: "model", text: reply }]);
    } catch (error) {
      console.error("Chat error:", error);
    } finally {
      setIsTyping(false);
    }
  };

  const sendMessage = async (overrideText?: string | any) => {
    const textToSend = typeof overrideText === 'string' ? overrideText : query;
    if (!textToSend.trim() || isTyping) return;
    
    const newMsg = { role: "user" as const, text: textToSend };
    const currentMessages = [...messages, newMsg];
    setMessages(currentMessages);
    if (typeof overrideText !== 'string') setQuery("");
    setIsTyping(true);

    const history = messages.map(m => ({
      role: m.role,
      parts: [{ text: m.text }]
    }));

    let apiEndpoint = "/api/chat";
    let requestBody: any = { history, message: newMsg.text };

    if (selectedProposal) {
      apiEndpoint = "/api/reroute";
      requestBody = {
        currentItinerary: selectedProposal,
        constraint: newMsg.text
      };
    }

    try {
      const response = await fetch(apiEndpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(requestBody),
      });
      const data = await response.json();
      if (data.error) {
        console.error("API Error Details:", data.details);
      }
      const reply = data.reply || "Sorry, I couldn't process that right now.";
      setMessages([...currentMessages, { role: "model", text: reply }]);
      
      if (data.pivotedItinerary) {
        setSelectedProposal(data.pivotedItinerary);
      }
    } catch (error) {
      console.error("Chat error:", error);
    } finally {
      setIsTyping(false);
    }
  };

  if (!isChatActive) {
    return (
      <div className="relative min-h-screen bg-white text-neutral-900 overflow-hidden font-sans selection:bg-[#FF385C]/20">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-rose-50 blur-[120px] rounded-full pointer-events-none" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-orange-50 blur-[120px] rounded-full pointer-events-none" />

        {ambientCards.map((card) => (
          <div 
            key={card.id} 
            className={`absolute flex items-center gap-3 px-5 py-2.5 rounded-full bg-white border border-gray-200 shadow-[0_6px_16px_rgba(0,0,0,0.06)] ${card.position} ${card.blur} animate-[float_8s_ease-in-out_infinite] z-0 select-none pointer-events-none`}
            style={{ animationDelay: card.delay }}
          >
            <span className="text-xl">{card.icon}</span>
            <span className="text-sm font-medium text-neutral-700">{card.title}</span>
          </div>
        ))}

        <div className="relative z-10 w-full min-h-screen flex flex-col items-center justify-center px-4 md:px-8">
          <div className="w-full max-w-4xl flex flex-col items-center space-y-10 animate-in fade-in zoom-in-[0.98] duration-1000">
            <div className="text-center space-y-4">
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white border border-gray-200 shadow-sm mb-2">
                <Sparkles className="w-4 h-4 text-[#FF385C]" />
                <span className="text-xs font-semibold text-neutral-600 tracking-wider uppercase">RerouteAI</span>
              </div>
              <h1 className="text-5xl md:text-6xl font-semibold tracking-tight text-neutral-900 pb-2">
                Where to next?
              </h1>
              <p className="text-lg text-neutral-500 max-w-xl mx-auto">
                Tell us your vibe, budget, or wild ideas. We'll engineer the perfect itinerary.
              </p>
            </div>

            <div className="w-full max-w-2xl bg-white rounded-full p-2 border border-gray-200 shadow-[0_8px_28px_rgba(0,0,0,0.08)]">
              <div className="flex items-center rounded-full p-2 pl-6 pr-2 transition-all">
                <input 
                  type="text" 
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  className="flex-1 bg-transparent border-none outline-none text-neutral-900 placeholder:text-neutral-400 font-medium text-lg"
                  placeholder="E.g., A rainy afternoon cafe hop in Hyderabad..."
                  onKeyDown={(e) => e.key === 'Enter' && startChat(query)}
                />
                <Button 
                  onClick={() => startChat(query)}
                  size="icon"
                  className="w-12 h-12 rounded-full bg-[#FF385C] hover:bg-[#E31C5F] text-white shadow-md shrink-0 ml-4 group transition-colors"
                >
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-0.5 transition-transform" />
                </Button>
              </div>
            </div>
            
            <div className="flex flex-wrap items-center justify-center gap-2 mt-4 pb-2 px-4">
              <span className="text-xs text-neutral-500 font-medium mr-2">Try:</span>
              {["History & Architecture", "Local Street Food", "Leisurely Evening"].map((prompt) => (
                <button 
                  key={prompt}
                  onClick={() => startChat(prompt)}
                  className="px-4 py-2 rounded-full bg-white border border-gray-200 text-xs font-medium text-neutral-600 hover:border-neutral-900 hover:text-neutral-900 transition-colors shadow-sm"
                >
                  {prompt}
                </button>
              ))}
            </div>

          </div>
        </div>
      </div>
    );
  }

  const lastModelMessage = messages.slice().reverse().find(m => m.role === 'model');
  const { suggestions: latestSuggestions } = lastModelMessage ? parseMessage(lastModelMessage.text) : { suggestions: [] };

  return (
    <div className="h-screen w-screen bg-neutral-50 text-neutral-900 flex overflow-hidden font-sans selection:bg-[#FF385C]/20 animate-in fade-in duration-500">
      
      {/* Left Chat Column */}
      <div className={`flex flex-col h-full bg-white shadow-[10px_0_30px_rgba(0,0,0,0.02)] z-10 transition-all duration-500 ${selectedProposal ? 'w-[450px]' : 'w-full max-w-4xl mx-auto border-x border-gray-100'}`}>
        
        {/* Chat Header */}
        <header className="flex items-center justify-between px-6 py-5 border-b border-gray-100 bg-white/80 backdrop-blur-md sticky top-0 z-10">
          <h2 className="text-lg font-semibold tracking-tight text-neutral-900 flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-[#FF385C]" />
            RerouteAI
          </h2>
          <button 
            onClick={() => { setIsChatActive(false); setMessages([]); setSelectedProposal(null); }}
            className="text-sm font-medium text-neutral-500 hover:text-neutral-900 transition-colors"
            aria-label="Close chat"
          >
            Close
          </button>
        </header>

        {/* Chat Messages */}
        <main className="flex-1 overflow-y-auto px-4 py-8 space-y-8 pb-40">
          {messages.map((msg, idx) => {
            const { text, proposal, suggestions } = parseMessage(msg.text);
            return (
              <div key={idx} className={`flex flex-col gap-2 ${msg.role === 'user' ? 'items-end' : 'items-start'}`}>
                
                <div className="flex">
                  {msg.role === 'model' && (
                    <div className="w-8 h-8 rounded-full bg-rose-50 flex items-center justify-center mr-3 shrink-0 border border-rose-100">
                      <Sparkles className="w-4 h-4 text-[#FF385C]" />
                    </div>
                  )}
                  
                  {text && (
                    <div 
                      className={`text-[15px] leading-relaxed max-w-[85%] ${
                        msg.role === 'user' 
                          ? 'bg-neutral-100 text-neutral-900 rounded-3xl rounded-tr-sm px-5 py-3 border border-gray-100' 
                          : 'text-neutral-800 py-1'
                      }`}
                    >
                      {text}
                    </div>
                  )}
                </div>

                {/* Render Custom Card if JSON was detected */}
                {proposal && (
                  <div className="ml-11 mt-2">
                    <ItineraryProposalCard 
                      proposal={proposal} 
                      onOpen={(p) => setSelectedProposal(p)} 
                    />
                  </div>
                )}
              </div>
            );
          })}

          {isTyping && (
            <div className="flex justify-start items-center">
              <div className="w-8 h-8 rounded-full bg-rose-50 flex items-center justify-center mr-3 shrink-0 border border-rose-100">
                <Sparkles className="w-4 h-4 text-[#FF385C] animate-pulse" />
              </div>
              <div className="text-neutral-400 text-sm font-medium animate-pulse">
                Typing...
              </div>
            </div>
          )}
          <div ref={chatEndRef} />
        </main>

        {/* Chat Input */}
        <footer className="p-4 bg-white border-t border-gray-100 flex flex-col gap-3">
          
          {/* Dynamic Suggestions Docked Above Input */}
          {latestSuggestions.length > 0 && (
            <div className="flex flex-wrap gap-2 px-2 animate-in slide-in-from-bottom-2 duration-300">
              {latestSuggestions.map((sug, i) => (
                <button
                  key={i}
                  onClick={() => sendMessage(sug)}
                  className="px-4 py-2 rounded-full bg-white border border-gray-200 text-sm font-medium text-neutral-700 hover:border-rose-300 hover:bg-rose-50 hover:text-rose-700 transition-all shadow-sm whitespace-nowrap"
                  aria-label={`Suggest: ${sug}`}
                >
                  {sug}
                </button>
              ))}
            </div>
          )}

          <div className={`bg-white rounded-full p-1.5 border shadow-sm flex items-center transition-all focus-within:ring-2 ${selectedProposal ? 'border-rose-300 focus-within:ring-rose-200' : 'border-gray-200 focus-within:ring-gray-200'}`}>
            <input 
              type="text" 
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="flex-1 bg-transparent border-none outline-none text-neutral-900 placeholder:text-neutral-400 font-medium px-4 text-sm"
              placeholder={selectedProposal ? "E.g., It's raining, move us indoors..." : "Ask anything..."}
              onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
              aria-label="Chat input"
            />
            <Button 
              onClick={sendMessage}
              size="icon"
              disabled={!query.trim() || isTyping}
              className="w-9 h-9 rounded-full bg-[#FF385C] hover:bg-[#E31C5F] text-white shrink-0 disabled:opacity-50 transition-colors"
              aria-label="Send message"
            >
              <Send className="w-4 h-4 translate-x-[-1px] translate-y-[1px]" />
            </Button>
          </div>
        </footer>
      </div>

      {/* Right Details Panel */}
      {selectedProposal && (
        <div className="flex-1 animate-in slide-in-from-right-8 duration-500 overflow-hidden">
          <ItineraryDetailsPanel 
            proposal={selectedProposal} 
            onClose={() => setSelectedProposal(null)} 
          />
        </div>
      )}

    </div>
  );
}
