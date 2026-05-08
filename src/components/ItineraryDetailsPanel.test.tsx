import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ItineraryDetailsPanel } from "./ItineraryDetailsPanel";
import { ItineraryProposal } from "./ItineraryProposalCard";

const sampleProposal: ItineraryProposal = {
  type: "itinerary_proposal",
  title: "Heritage & Food Walk",
  dates: "Feb 12 - Feb 14, 2025",
  travelers: "4 (Friends)",
  totalCost: "$400 USD",
  location: "Hyderabad, India",
  days: [
    {
      date: "Feb 12",
      activities: [
        { time: "09:00 AM", activity: "Visit Charminar", location: "Charminar", vibe: ["Iconic"] },
        { time: "12:00 PM", activity: "Lunch at Paradise", location: "Paradise Biryani", vibe: ["Bustling"] },
      ],
    },
    {
      date: "Feb 13",
      activities: [
        { time: "10:00 AM", activity: "Golconda Fort", location: "Golconda", vibe: ["Heritage"] },
      ],
    },
  ],
};

describe("ItineraryDetailsPanel", () => {
  it("renders the proposal title", () => {
    render(<ItineraryDetailsPanel proposal={sampleProposal} onClose={vi.fn()} />);
    expect(screen.getByText("Heritage & Food Walk")).toBeInTheDocument();
  });

  it("renders the dates", () => {
    render(<ItineraryDetailsPanel proposal={sampleProposal} onClose={vi.fn()} />);
    expect(screen.getByText(/Feb 12 - Feb 14, 2025/)).toBeInTheDocument();
  });

  it("renders the total cost", () => {
    render(<ItineraryDetailsPanel proposal={sampleProposal} onClose={vi.fn()} />);
    expect(screen.getByText("$400 USD")).toBeInTheDocument();
  });

  it("renders date tabs for each day", () => {
    render(<ItineraryDetailsPanel proposal={sampleProposal} onClose={vi.fn()} />);
    expect(screen.getByText("Feb 12")).toBeInTheDocument();
    expect(screen.getByText("Feb 13")).toBeInTheDocument();
  });

  it("renders activities for the first day", () => {
    render(<ItineraryDetailsPanel proposal={sampleProposal} onClose={vi.fn()} />);
    expect(screen.getByText("Visit Charminar")).toBeInTheDocument();
    expect(screen.getByText("Lunch at Paradise")).toBeInTheDocument();
  });

  it("calls onClose when Cancel button is clicked", async () => {
    const user = userEvent.setup();
    const onClose = vi.fn();
    render(<ItineraryDetailsPanel proposal={sampleProposal} onClose={onClose} />);

    await user.click(screen.getByRole("button", { name: /Cancel/i }));
    expect(onClose).toHaveBeenCalledOnce();
  });

  it("renders Share button", () => {
    render(<ItineraryDetailsPanel proposal={sampleProposal} onClose={vi.fn()} />);
    expect(screen.getByRole("button", { name: /Share/i })).toBeInTheDocument();
  });

  it("renders category tabs (Itinerary, Restaurant, Hotel, Flights)", () => {
    render(<ItineraryDetailsPanel proposal={sampleProposal} onClose={vi.fn()} />);
    expect(screen.getByText(/Itinerary/)).toBeInTheDocument();
    expect(screen.getByText(/Restaurant/)).toBeInTheDocument();
    expect(screen.getByText(/Hotel/)).toBeInTheDocument();
    expect(screen.getByText(/Flights/)).toBeInTheDocument();
  });
});
