const https = require('https');
const apiKey = process.env.GOOGLE_API_KEY;

https.get(`https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`, (res) => {
  let data = '';
  res.on('data', (chunk) => data += chunk);
  res.on('end', () => {
    try {
      const models = JSON.parse(data).models;
      if (models) {
        console.log("Available Models:");
        models.forEach(m => console.log(m.name, m.supportedGenerationMethods));
      } else {
        console.log("Error:", data);
      }
    } catch(e) {
      console.log("Parse Error:", e.message);
    }
  });
});
