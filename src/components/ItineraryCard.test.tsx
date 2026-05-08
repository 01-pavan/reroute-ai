import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { ItineraryCard } from "./ItineraryCard";

const sampleItem = {
  time: "10:00 AM",
  activity: "Visit Charminar",
  location: "Charminar, Old City",
  vibe: ["Iconic", "Heritage"],
};

describe("ItineraryCard", () => {
  it("renders the activity name", () => {
    render(<ItineraryCard item={sampleItem} />);
    expect(screen.getByText("Visit Charminar")).toBeInTheDocument();
  });

  it("renders the time", () => {
    render(<ItineraryCard item={sampleItem} />);
    expect(screen.getByText("10:00 AM")).toBeInTheDocument();
  });

  it("renders the location", () => {
    render(<ItineraryCard item={sampleItem} />);
    expect(screen.getByText("Charminar, Old City")).toBeInTheDocument();
  });

  it("renders all vibe tags", () => {
    render(<ItineraryCard item={sampleItem} />);
    expect(screen.getByText("Iconic")).toBeInTheDocument();
    expect(screen.getByText("Heritage")).toBeInTheDocument();
  });

  it("renders with empty vibe array", () => {
    render(<ItineraryCard item={{ ...sampleItem, vibe: [] }} />);
    expect(screen.getByText("Visit Charminar")).toBeInTheDocument();
  });
});
