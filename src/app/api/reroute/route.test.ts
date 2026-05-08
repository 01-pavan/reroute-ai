import { describe, it, expect, vi, beforeEach } from "vitest";

const { mockGenerateContent, mockGetGenerativeModel } = vi.hoisted(() => {
  const mockGenerateContent = vi.fn();
  const mockGetGenerativeModel = vi.fn(() => ({
    generateContent: mockGenerateContent,
  }));
  return { mockGenerateContent, mockGetGenerativeModel };
});

vi.mock("@google/generative-ai", () => ({
  GoogleGenerativeAI: class {
    getGenerativeModel = mockGetGenerativeModel;
  },
}));

vi.mock("../../../../data/hyderabad-spots.json", () => ({
  default: [
    { name: "Charminar", category: "History", vibe: ["Iconic"] },
    { name: "Salar Jung Museum", category: "History", vibe: ["Indoor", "Heritage"] },
  ],
}));

import { POST } from "./route";

function makeRequest(body: object): Request {
  return new Request("http://localhost:3000/api/reroute", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

const sampleItinerary = {
  type: "itinerary_proposal",
  title: "History Walk",
  days: [
    {
      date: "Feb 12",
      activities: [
        { time: "10:00 AM", activity: "Visit Charminar", location: "Charminar", vibe: ["Iconic"] },
      ],
    },
  ],
};

describe("POST /api/reroute", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.stubEnv("GOOGLE_API_KEY", "test-key");
  });

  it("returns 500 when GOOGLE_API_KEY is not set", async () => {
    vi.stubEnv("GOOGLE_API_KEY", "");

    const req = makeRequest({
      currentItinerary: sampleItinerary,
      constraint: "It's raining",
    });
    const res = await POST(req);
    const data = await res.json();

    expect(res.status).toBe(500);
    expect(data.error).toBe("GOOGLE_API_KEY is not configured.");
  });

  it("returns 400 when currentItinerary is missing", async () => {
    const req = makeRequest({ constraint: "It's raining" });
    const res = await POST(req);
    const data = await res.json();

    expect(res.status).toBe(400);
    expect(data.error).toContain("Missing");
  });

  it("returns 400 when constraint is missing", async () => {
    const req = makeRequest({ currentItinerary: sampleItinerary });
    const res = await POST(req);
    const data = await res.json();

    expect(res.status).toBe(400);
    expect(data.error).toContain("Missing");
  });

  it("returns rerouted itinerary from markdown-wrapped JSON", async () => {
    const patchedItinerary = {
      ...sampleItinerary,
      days: [
        {
          date: "Feb 12",
          activities: [
            { time: "10:00 AM", activity: "Visit Salar Jung Museum", location: "Salar Jung Museum", vibe: ["Indoor"] },
          ],
        },
      ],
    };

    mockGenerateContent.mockResolvedValueOnce({
      response: {
        text: () => "```json\n" + JSON.stringify(patchedItinerary) + "\n```",
      },
    });

    const req = makeRequest({
      currentItinerary: sampleItinerary,
      constraint: "It's raining",
    });
    const res = await POST(req);
    const data = await res.json();

    expect(res.status).toBe(200);
    expect(data.message).toBe("Itinerary successfully rerouted");
    expect(data.pivotedItinerary.days[0].activities[0].activity).toBe("Visit Salar Jung Museum");
  });

  it("falls back to raw JSON parsing when not wrapped in markdown", async () => {
    const patchedItinerary = { ...sampleItinerary, title: "Indoor Plan" };

    mockGenerateContent.mockResolvedValueOnce({
      response: { text: () => JSON.stringify(patchedItinerary) },
    });

    const req = makeRequest({
      currentItinerary: sampleItinerary,
      constraint: "I'm tired",
    });
    const res = await POST(req);
    const data = await res.json();

    expect(res.status).toBe(200);
    expect(data.pivotedItinerary.title).toBe("Indoor Plan");
  });

  it("returns 500 when AI returns invalid JSON", async () => {
    mockGenerateContent.mockResolvedValueOnce({
      response: { text: () => "Sorry, I cannot help with that." },
    });

    const req = makeRequest({
      currentItinerary: sampleItinerary,
      constraint: "Make it better",
    });
    const res = await POST(req);
    const data = await res.json();

    expect(res.status).toBe(500);
    expect(data.error).toBe("AI returned invalid JSON");
  });

  it("includes the full reply text in the response", async () => {
    const fullText = '```json\n{"type":"itinerary_proposal","title":"Test","days":[]}\n```';
    mockGenerateContent.mockResolvedValueOnce({
      response: { text: () => fullText },
    });

    const req = makeRequest({
      currentItinerary: sampleItinerary,
      constraint: "Change plans",
    });
    const res = await POST(req);
    const data = await res.json();

    expect(data.reply).toBe(fullText);
  });
});
