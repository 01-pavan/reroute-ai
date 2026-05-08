import { Share, Bookmark, X, Plus, Minus } from "lucide-react";
import { Button } from "./ui/button";
import { ItineraryProposal } from "./ItineraryProposalCard";
import { ItineraryCard } from "./ItineraryCard";

interface Props {
  proposal: ItineraryProposal;
  onClose: () => void;
}

export function ItineraryDetailsPanel({ proposal, onClose }: Props) {
  return (
    <div className="w-full h-full bg-white rounded-l-3xl shadow-[-10px_0_30px_rgba(0,0,0,0.05)] overflow-y-auto flex flex-col font-sans border-l border-gray-100">
      
      {/* Header */}
      <div className="sticky top-0 bg-white/80 backdrop-blur-md z-10 p-6 flex items-center justify-between border-b border-gray-100">
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" className="rounded-full h-9 px-4 text-xs font-semibold">
            <Share className="w-3.5 h-3.5 mr-2" /> Share
          </Button>
          <Button variant="outline" size="icon" className="rounded-full w-9 h-9">
            <Bookmark className="w-4 h-4 text-neutral-500" />
          </Button>
        </div>
        <Button variant="ghost" size="sm" onClick={onClose} className="rounded-full text-neutral-500 hover:text-neutral-900 bg-gray-50 hover:bg-gray-100 px-4">
          <X className="w-4 h-4 mr-1.5" /> Cancel
        </Button>
      </div>

      {/* Content */}
      <div className="p-8 max-w-3xl mx-auto w-full space-y-8">
        
        {/* Title Block */}
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-neutral-900 mb-2">
            {proposal.title}
          </h1>
          <p className="text-sm font-medium text-neutral-500 flex items-center gap-2">
            📅 {proposal.dates}
          </p>
        </div>

        {/* Google Map */}
        <div className="w-full h-64 rounded-3xl border border-gray-200 relative overflow-hidden shadow-sm">
          <iframe 
            width="100%" 
            height="100%" 
            style={{ border: 0 }} 
            loading="lazy" 
            allowFullScreen 
            src={`https://maps.google.com/maps?q=${encodeURIComponent(proposal.title + ', ' + proposal.location)}&t=&z=14&ie=UTF8&iwloc=&output=embed`}
            title={`Map of ${proposal.title}`}
          ></iframe>
        </div>

        {/* Categories & Cost */}
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-1 bg-gray-50 p-1 rounded-full border border-gray-100">
            <button className="px-4 py-1.5 bg-white shadow-sm rounded-full text-xs font-semibold text-neutral-900 flex items-center gap-1.5">
              🗺️ Itinerary
            </button>
            <button className="px-4 py-1.5 rounded-full text-xs font-medium text-neutral-500 hover:text-neutral-900 flex items-center gap-1.5">
              🍽️ Restaurant
            </button>
            <button className="px-4 py-1.5 rounded-full text-xs font-medium text-neutral-500 hover:text-neutral-900 flex items-center gap-1.5">
              🏨 Hotel
            </button>
            <button className="px-4 py-1.5 rounded-full text-xs font-medium text-neutral-500 hover:text-neutral-900 flex items-center gap-1.5">
              ✈️ Flights
            </button>
          </div>
          <div className="px-4 py-2 bg-[#008A05] text-white font-bold rounded-full text-sm shadow-md">
            Total Cost <span className="bg-white/20 px-2 py-0.5 rounded-full ml-1">{proposal.totalCost}</span>
          </div>
        </div>

        {/* Date Tabs */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
          {proposal.days.map((day, idx) => (
            <button 
              key={idx}
              className={`px-5 py-2 rounded-full text-sm font-semibold whitespace-nowrap transition-colors ${
                idx === 0 ? "bg-neutral-900 text-white" : "bg-white border border-gray-200 text-neutral-600 hover:border-neutral-900"
              }`}
            >
              {day.date}
            </button>
          ))}
        </div>

        {/* Itinerary Timeline */}
        <div className="bg-gray-50/50 rounded-3xl border border-gray-100 p-6 space-y-6">
          {proposal.days[0]?.activities.map((act, i) => (
            <ItineraryCard key={i} item={{
              time: act.time,
              activity: act.activity,
              location: act.location,
              vibe: act.vibe
            }} />
          ))}
        </div>
        
      </div>
    </div>
  );
}
