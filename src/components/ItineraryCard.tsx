import { MapPin, Clock } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface ItineraryItem {
  time: string;
  location: string;
  activity: string;
  vibe: string[];
}

export function ItineraryCard({ item }: { item: ItineraryItem }) {
  return (
    <div className="relative pl-8 pb-8 border-l border-border last:pb-0">
      {/* Timeline Dot */}
      <div className="absolute left-[-5px] top-0 w-2.5 h-2.5 rounded-full bg-blue-500 shadow-[0_0_10px_rgba(59,130,246,0.5)]" />

      <div className="flex flex-col gap-2">
        <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground uppercase tracking-wider">
          <Clock className="w-3 h-3" />
          {item.time}
        </div>

        <Card className="hover:border-blue-500/30 transition-all">
          <CardContent>
            <h4 className="text-lg font-bold flex items-center gap-2">
              {item.activity}
            </h4>
            <div className="flex items-center gap-1.5 text-sm text-muted-foreground mt-1">
              <MapPin className="w-3.5 h-3.5 text-blue-400" />
              {item.location}
            </div>

            <div className="flex flex-wrap gap-2 mt-4">
              {item.vibe.map((tag) => (
                <Badge
                  key={tag}
                  variant="secondary"
                  className="bg-blue-500/10 text-blue-400 border border-blue-500/20 text-[10px]"
                >
                  {tag}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
