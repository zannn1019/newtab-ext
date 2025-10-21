// Background Service Worker for Binance API calls
// This bypasses CORS restrictions in the browser extension

console.log("🚀 Background service worker loaded");

// Listen for messages from the content script/popup
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  console.log("📨 Received message:", request.action);

  if (request.action === "binanceApiCall") {
    console.log(
      "🌐 Making Binance API call:",
      request.url.substring(0, 80) + "..."
    );

    // Make the API call from the background script (no CORS issues)
    fetch(request.url, request.options)
      .then((response) => {
        console.log("📡 Response status:", response.status);

        if (!response.ok) {
          return response.text().then((text) => {
            console.error("❌ API Error:", response.status, text);
            throw new Error(`HTTP ${response.status}: ${text}`);
          });
        }
        return response.json();
      })
      .then((data) => {
        console.log(
          "✅ API Success:",
          Array.isArray(data) ? `${data.length} items` : "object"
        );
        sendResponse({ success: true, data });
      })
      .catch((error) => {
        console.error("❌ Fetch error:", error.message);
        sendResponse({ success: false, error: error.message });
      });

    // Return true to indicate we'll send response asynchronously
    return true;
  }
});
