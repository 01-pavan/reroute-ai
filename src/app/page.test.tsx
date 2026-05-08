import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import Dashboard from "./page";

// Mock fetch globally
const mockFetch = vi.fn();
global.fetch = mockFetch;

describe("Dashboard - Landing State", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders the hero heading", () => {
    render(<Dashboard />);
    expect(screen.getByText("Where to next?")).toBeInTheDocument();
  });

  it("renders the RerouteAI brand badge", () => {
    render(<Dashboard />);
    expect(screen.getByText("RerouteAI")).toBeInTheDocument();
  });

  it("renders the subtitle text", () => {
    render(<Dashboard />);
    expect(
      screen.getByText(/Tell us your vibe, budget, or wild ideas/)
    ).toBeInTheDocument();
  });

  it("renders the search input", () => {
    render(<Dashboard />);
    const input = screen.getByPlaceholderText(
      /rainy afternoon cafe hop/i
    );
    expect(input).toBeInTheDocument();
  });

  it("renders suggested prompt buttons", () => {
    render(<Dashboard />);
    expect(screen.getByText("History & Architecture")).toBeInTheDocument();
    expect(screen.getByText("Local Street Food")).toBeInTheDocument();
    expect(screen.getByText("Leisurely Evening")).toBeInTheDocument();
  });

  it("renders ambient floating cards", () => {
    render(<Dashboard />);
    expect(screen.getByText("Heritage Walks")).toBeInTheDocument();
    expect(screen.getByText("Culinary Tours")).toBeInTheDocument();
    expect(screen.getByText("Hidden Gems")).toBeInTheDocument();
    expect(screen.getByText("Sunset Views")).toBeInTheDocument();
  });

  it("transitions to chat state when a suggested prompt is clicked", async () => {
    const user = userEvent.setup();
    mockFetch.mockResolvedValueOnce({
      json: () => Promise.resolve({ reply: "How many days?" }),
    });

    render(<Dashboard />);
    await user.click(screen.getByText("History & Architecture"));

    // Should now show the chat interface
    expect(screen.getByText("Close")).toBeInTheDocument();
    expect(screen.getByText("History & Architecture")).toBeInTheDocument();
  });

  it("transitions to chat state when Enter is pressed in search input", async () => {
    const user = userEvent.setup();
    mockFetch.mockResolvedValueOnce({
      json: () => Promise.resolve({ reply: "Nice! How long?" }),
    });

    render(<Dashboard />);
    const input = screen.getByPlaceholderText(/rainy afternoon/i);
    await user.type(input, "Food tour{Enter}");

    expect(screen.getByText("Close")).toBeInTheDocument();
  });

  it("does not transition on empty query", async () => {
    const user = userEvent.setup();
    render(<Dashboard />);

    const input = screen.getByPlaceholderText(/rainy afternoon/i);
    await user.type(input, "{Enter}");

    // Should still be on landing page
    expect(screen.getByText("Where to next?")).toBeInTheDocument();
  });
});

describe("Dashboard - Chat State", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("displays user message in chat", async () => {
    const user = userEvent.setup();
    mockFetch.mockResolvedValueOnce({
      json: () => Promise.resolve({ reply: "Great choice!" }),
    });

    render(<Dashboard />);
    await user.click(screen.getByText("Local Street Food"));

    expect(screen.getByText("Local Street Food")).toBeInTheDocument();
  });

  it("displays AI reply after fetch completes", async () => {
    const user = userEvent.setup();
    mockFetch.mockResolvedValueOnce({
      json: () =>
        Promise.resolve({ reply: "How many days are you planning?" }),
    });

    render(<Dashboard />);
    await user.click(screen.getByText("Leisurely Evening"));

    expect(
      await screen.findByText("How many days are you planning?")
    ).toBeInTheDocument();
  });

  it("shows Close button that returns to landing", async () => {
    const user = userEvent.setup();
    mockFetch.mockResolvedValueOnce({
      json: () => Promise.resolve({ reply: "Hello!" }),
    });

    render(<Dashboard />);
    await user.click(screen.getByText("History & Architecture"));
    await screen.findByText("Hello!");

    await user.click(screen.getByText("Close"));
    expect(screen.getByText("Where to next?")).toBeInTheDocument();
  });
});

describe("parseMessage logic (via rendering)", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders suggestion buttons from AI response", async () => {
    const user = userEvent.setup();
    mockFetch.mockResolvedValueOnce({
      json: () =>
        Promise.resolve({
          reply: 'What vibe are you going for? [SUGGESTIONS: "Heritage", "Food", "Chill"]',
        }),
    });

    render(<Dashboard />);
    await user.click(screen.getByText("History & Architecture"));

    // Wait for the suggestions to appear
    expect(await screen.findByText("Heritage")).toBeInTheDocument();
    expect(screen.getByText("Food")).toBeInTheDocument();
    expect(screen.getByText("Chill")).toBeInTheDocument();
  });

  it("strips suggestion tags from displayed message text", async () => {
    const user = userEvent.setup();
    mockFetch.mockResolvedValueOnce({
      json: () =>
        Promise.resolve({
          reply: 'Cool! How many days? [SUGGESTIONS: "1 day", "3 days", "5 days"]',
        }),
    });

    render(<Dashboard />);
    await user.click(screen.getByText("Local Street Food"));

    await screen.findByText("Cool! How many days?");
    // The raw [SUGGESTIONS:...] text should not appear
    expect(screen.queryByText(/\[SUGGESTIONS/)).not.toBeInTheDocument();
  });
});
