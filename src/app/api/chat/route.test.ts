import { describe, it, expect, vi, beforeEach } from "vitest";

const { mockSendMessage, mockStartChat, mockGetGenerativeModel } = vi.hoisted(() => {
  const mockSendMessage = vi.fn();
  const mockStartChat = vi.fn(() => ({ sendMessage: mockSendMessage }));
  const mockGetGenerativeModel = vi.fn(() => ({ startChat: mockStartChat }));
  return { mockSendMessage, mockStartChat, mockGetGenerativeModel };
});

vi.mock("@google/generative-ai", () => ({
  GoogleGenerativeAI: class {
    getGenerativeModel = mockGetGenerativeModel;
  },
}));

vi.mock("../../../../data/hyderabad-spots.json", () => ({
  default: [
    { name: "Charminar", category: "History", vibe: ["Iconic"] },
    { name: "Paradise Biryani", category: "Food", vibe: ["Bustling"] },
  ],
}));

import { POST } from "./route";

function makeRequest(body: object): Request {
  return new Request("http://localhost:3000/api/chat", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

describe("POST /api/chat", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.stubEnv("GOOGLE_API_KEY", "test-key");
  });

  it("returns 500 when GOOGLE_API_KEY is not set", async () => {
    vi.stubEnv("GOOGLE_API_KEY", "");

    const req = makeRequest({ history: [], message: "Hello" });
    const res = await POST(req);
    const data = await res.json();

    expect(res.status).toBe(500);
    expect(data.error).toBe("GOOGLE_API_KEY is not configured.");
  });

  it("returns a reply on successful chat", async () => {
    mockSendMessage.mockResolvedValueOnce({
      response: { text: () => "Welcome to Hyderabad! How many days are you planning?" },
    });

    const req = makeRequest({ history: [], message: "Plan a trip" });
    const res = await POST(req);
    const data = await res.json();

    expect(res.status).toBe(200);
    expect(data.reply).toBe("Welcome to Hyderabad! How many days are you planning?");
  });

  it("passes chat history to the model", async () => {
    mockSendMessage.mockResolvedValueOnce({
      response: { text: () => "Got it!" },
    });

    const history = [
      { role: "user", parts: [{ text: "Hello" }] },
      { role: "model", parts: [{ text: "Hi there!" }] },
    ];

    const req = makeRequest({ history, message: "2 days" });
    await POST(req);

    expect(mockStartChat).toHaveBeenCalledWith({ history });
    expect(mockSendMessage).toHaveBeenCalledWith("2 days");
  });

  it("returns 500 on Gemini API error", async () => {
    mockSendMessage.mockRejectedValueOnce(new Error("API limit exceeded"));

    // Also mock the fallback model listing fetch
    global.fetch = vi.fn().mockRejectedValueOnce(new Error("fetch failed"));

    const req = makeRequest({ history: [], message: "Hello" });
    const res = await POST(req);
    const data = await res.json();

    expect(res.status).toBe(500);
    expect(data.error).toBe("Failed to process chat request");
    expect(data.details).toBe("API limit exceeded");
  });

  it("uses gemini-2.5-flash model", async () => {
    mockSendMessage.mockResolvedValueOnce({
      response: { text: () => "Reply" },
    });

    const req = makeRequest({ history: [], message: "Hello" });
    await POST(req);

    expect(mockGetGenerativeModel).toHaveBeenCalledWith(
      expect.objectContaining({ model: "gemini-2.5-flash" })
    );
  });
});
