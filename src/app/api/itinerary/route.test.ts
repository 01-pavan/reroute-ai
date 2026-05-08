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
    { id: 1, name: "Charminar", category: "History", vibe: ["Iconic"], avg_duration: 90 },
  ],
}));

import { POST } from "./route";

function makeRequest(body: object): Request {
  return new Request("http://localhost:3000/api/itinerary", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

describe("POST /api/itinerary", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.stubEnv("GOOGLE_API_KEY", "test-key");
  });

  it("returns 500 when GOOGLE_API_KEY is not set", async () => {
    vi.stubEnv("GOOGLE_API_KEY", "");

    const req = makeRequest({ vibe: "History", budget: "Low", duration: "4" });
    const res = await POST(req);
    const data = await res.json();

    expect(res.status).toBe(500);
    expect(data.error).toContain("GOOGLE_API_KEY");
  });

  it("returns a parsed itinerary on success", async () => {
    const itinerary = {
      itinerary: [
        { time: "09:00 AM", activity: "Visit Charminar", location: "Charminar", vibe: ["Iconic"] },
      ],
    };

    mockGenerateContent.mockResolvedValueOnce({
      response: { text: () => JSON.stringify(itinerary) },
    });

    const req = makeRequest({ vibe: "History", budget: "Low", duration: "4" });
    const res = await POST(req);
    const data = await res.json();

    expect(res.status).toBe(200);
    expect(data.itinerary).toHaveLength(1);
    expect(data.itinerary[0].location).toBe("Charminar");
  });

  it("returns 500 when Gemini returns invalid JSON", async () => {
    mockGenerateContent.mockResolvedValueOnce({
      response: { text: () => "This is not valid JSON at all" },
    });

    const req = makeRequest({ vibe: "History", budget: "Low", duration: "4" });
    const res = await POST(req);
    const data = await res.json();

    expect(res.status).toBe(500);
    expect(data.error).toBe("Failed to process request");
  });

  it("uses default values for missing params", async () => {
    const itinerary = { itinerary: [] };
    mockGenerateContent.mockResolvedValueOnce({
      response: { text: () => JSON.stringify(itinerary) },
    });

    const req = makeRequest({});
    const res = await POST(req);

    expect(res.status).toBe(200);
    expect(mockGenerateContent).toHaveBeenCalledOnce();
  });

  it("configures model with JSON response type", async () => {
    mockGenerateContent.mockResolvedValueOnce({
      response: { text: () => '{"itinerary":[]}' },
    });

    const req = makeRequest({ vibe: "Food" });
    await POST(req);

    expect(mockGetGenerativeModel).toHaveBeenCalledWith(
      expect.objectContaining({
        generationConfig: { responseMimeType: "application/json" },
      })
    );
  });
});
