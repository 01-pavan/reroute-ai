import { MapPin } from "lucide-react";
import { Button } from "./ui/button";

export interface ItineraryProposal {
  type: string;
  title: string;
  dates: string;
  travelers: string;
  totalCost: string;
  location: string;
  days: {
    date: string;
    activities: {
      time: string;
      activity: string;
      location: string;
      vibe: string[];
    }[];
  }[];
}

interface Props {
  proposal: ItineraryProposal;
  onOpen: (proposal: ItineraryProposal) => void;
}

export function ItineraryProposalCard({ proposal, onOpen }: Props) {
  // Use a generic unsplash image for the location
  const imageUrl = `https://images.unsplash.com/photo-1599661559929-286663fcc949?w=600&q=80`;

  return (
    <div className="w-full max-w-sm rounded-2xl border border-gray-100 bg-white overflow-hidden shadow-sm hover:shadow-md transition-shadow">
      <div className="h-40 w-full overflow-hidden bg-gray-100">
        <img 
          src={imageUrl} 
          alt={proposal.location} 
          className="w-full h-full object-cover"
          onError={(e) => {
            e.currentTarget.src = "https://placehold.co/600x400/fecdd3/e11d48?text=Trip+Preview";
          }}
        />
      </div>
      <div className="p-4">
        <div className="flex items-center gap-1.5 text-xs font-semibold text-neutral-500 mb-2">
          <MapPin className="w-3.5 h-3.5 text-[#FF385C]" />
          {proposal.location}
        </div>
        <h3 className="font-semibold text-neutral-900 leading-tight mb-3">
          {proposal.title}
        </h3>
        <div className="text-sm font-bold text-[#008A05] mb-4">
          {proposal.totalCost}
        </div>
        <Button 
          onClick={() => onOpen(proposal)}
          className="w-full bg-neutral-900 hover:bg-neutral-800 text-white rounded-xl py-5"
        >
          Open
        </Button>
      </div>
    </div>
  );
}
