const express = require("express");
const axios = require("axios");
const app = express();
const API_KEY = "YOUR_GOOGLE_SAFE_BROWSING_API_KEY"; // Use your generated API key

app.use(express.json());

// Endpoint to check a URL
app.post("/check-url", async (req, res) => {
  const url = req.body.url;

  // API request to Google Safe Browsing
  try {
    const response = await axios.post(
      "https://safebrowsing.googleapis.com/v4/threatMatches:find",
      {
        client: {
          clientId: "your-app",
          clientVersion: "1.0.0",
        },
        threatInfo: {
          threatTypes: ["MALWARE", "SOCIAL_ENGINEERING", "UNWANTED_SOFTWARE"],
          platformTypes: ["WINDOWS"],
          urlList: [url],
        },
      },
      {
        headers: {
          "Content-Type": "application/json",
        },
        params: {
          key: API_KEY,
        },
      }
    );

    if (response.data.matches) {
      res.status(200).send({ isSafe: false, message: "Unsafe URL detected" });
    } else {
      res.status(200).send({ isSafe: true, message: "URL is safe" });
    }
  } catch (error) {
    console.error("Error checking URL:", error);
    res.status(500).send({ isSafe: false, message: "Error checking URL" });
  }
});

app.listen(5000, () => {
  console.log("Server running on port 5000");
});
