/**
 * Extension Info Helper
 * Use this to get your extension's redirect URI for Spotify setup
 */

// Add this to your console to get the redirect URI
console.log("=== EXTENSION INFO ===");

if (typeof chrome !== "undefined" && chrome.runtime && chrome.runtime.id) {
  const extensionId = chrome.runtime.id;
  const redirectUri = `https://${extensionId}.chromiumapp.org/`;

  console.log("✅ Running as Chrome Extension");
  console.log("Extension ID:", extensionId);
  console.log("Redirect URI for Spotify:", redirectUri);
  console.log(
    "\nCopy the redirect URI above and add it to your Spotify App settings:"
  );
  console.log("1. Go to https://developer.spotify.com/dashboard");
  console.log("2. Open your app → Settings");
  console.log('3. Under "Redirect URIs", paste:', redirectUri);
  console.log('4. Click "Add" then "Save"');
} else {
  console.log("⚠️ Not running as extension (localhost mode)");
  console.log("Redirect URI:", "http://localhost:5173/");
  console.log("\nIf developing locally, add this to Spotify App settings:");
  console.log("http://localhost:5173/");
}

console.log("====================");

// Also add a button to copy the URI to clipboard
if (typeof chrome !== "undefined" && chrome.runtime && chrome.runtime.id) {
  const redirectUri = `https://${chrome.runtime.id}.chromiumapp.org/`;

  // Create a temporary element to show the URI
  const notice = document.createElement("div");
  notice.style.cssText = `
    position: fixed;
    top: 20px;
    right: 20px;
    background: rgba(30, 215, 96, 0.95);
    color: white;
    padding: 20px;
    border-radius: 8px;
    font-family: monospace;
    font-size: 14px;
    z-index: 10000;
    box-shadow: 0 4px 12px rgba(0,0,0,0.3);
    max-width: 400px;
    line-height: 1.5;
  `;

  notice.innerHTML = `
    <strong>🎵 Spotify Setup</strong><br><br>
    Your Redirect URI:<br>
    <code style="background: rgba(0,0,0,0.2); padding: 4px 8px; border-radius: 4px; display: block; margin: 8px 0;">${redirectUri}</code>
    <br>
    <button id="copy-uri-btn" style="background: white; color: #1DB954; border: none; padding: 8px 16px; border-radius: 4px; cursor: pointer; font-weight: bold;">
      Copy to Clipboard
    </button>
    <button id="close-notice-btn" style="background: rgba(0,0,0,0.2); color: white; border: none; padding: 8px 16px; border-radius: 4px; cursor: pointer; margin-left: 8px;">
      Close
    </button>
    <br><br>
    <small>Add this to your Spotify App settings</small>
  `;

  document.body.appendChild(notice);

  // Copy button
  document.getElementById("copy-uri-btn").addEventListener("click", () => {
    navigator.clipboard.writeText(redirectUri).then(() => {
      const btn = document.getElementById("copy-uri-btn");
      btn.textContent = "✓ Copied!";
      setTimeout(() => {
        btn.textContent = "Copy to Clipboard";
      }, 2000);
    });
  });

  // Close button
  document.getElementById("close-notice-btn").addEventListener("click", () => {
    notice.remove();
  });

  // Auto-hide after 15 seconds
  setTimeout(() => {
    if (notice.parentElement) {
      notice.style.opacity = "0";
      notice.style.transition = "opacity 0.5s";
      setTimeout(() => notice.remove(), 500);
    }
  }, 15000);
}
