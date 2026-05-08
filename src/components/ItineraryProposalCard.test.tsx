import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ItineraryProposalCard, ItineraryProposal } from "./ItineraryProposalCard";

const sampleProposal: ItineraryProposal = {
  type: "itinerary_proposal",
  title: "3-Day Hyderabad Heritage Tour",
  dates: "Feb 12 - Feb 14, 2025",
  travelers: "2 (Couple)",
  totalCost: "$250 USD",
  location: "Hyderabad, India",
  days: [
    {
      date: "Feb 12",
      activities: [
        { time: "10:00 AM", activity: "Visit Charminar", location: "Charminar", vibe: ["Iconic"] },
      ],
    },
  ],
};

describe("ItineraryProposalCard", () => {
  it("renders the proposal location", () => {
    render(<ItineraryProposalCard proposal={sampleProposal} onOpen={vi.fn()} />);
    expect(screen.getByText("Hyderabad, India")).toBeInTheDocument();
  });

  it("renders the proposal title", () => {
    render(<ItineraryProposalCard proposal={sampleProposal} onOpen={vi.fn()} />);
    expect(screen.getByText("3-Day Hyderabad Heritage Tour")).toBeInTheDocument();
  });

  it("renders the total cost", () => {
    render(<ItineraryProposalCard proposal={sampleProposal} onOpen={vi.fn()} />);
    expect(screen.getByText("$250 USD")).toBeInTheDocument();
  });

  it("renders an Open button", () => {
    render(<ItineraryProposalCard proposal={sampleProposal} onOpen={vi.fn()} />);
    expect(screen.getByRole("button", { name: "Open" })).toBeInTheDocument();
  });

  it("calls onOpen with the proposal when Open is clicked", async () => {
    const user = userEvent.setup();
    const onOpen = vi.fn();
    render(<ItineraryProposalCard proposal={sampleProposal} onOpen={onOpen} />);

    await user.click(screen.getByRole("button", { name: "Open" }));
    expect(onOpen).toHaveBeenCalledOnce();
    expect(onOpen).toHaveBeenCalledWith(sampleProposal);
  });

  it("renders an image with the location as alt text", () => {
    render(<ItineraryProposalCard proposal={sampleProposal} onOpen={vi.fn()} />);
    const img = screen.getByRole("img");
    expect(img).toHaveAttribute("alt", "Hyderabad, India");
  });
});
