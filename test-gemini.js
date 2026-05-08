const { GoogleGenerativeAI } = require("@google/generative-ai");
const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY);
async function run() {
  const model = genAI.getGenerativeModel({ model: "gemini-1.5-pro" });
  try {
    const chat = model.startChat({
      history: [
        { role: "user", parts: [{ text: "" }] }
      ]
    });
    const result = await chat.sendMessage("test");
    console.log(result.response.text());
  } catch(e) {
    console.error("Test 1 error:", e.message);
  }
}
run();
