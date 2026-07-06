document.addEventListener("DOMContentLoaded", async () => {
  const key = await getAPIKey();
  document.getElementById("status").textContent = key ? "API key set ✓" : "No API key set";
});

document.getElementById("saveKey").addEventListener("click", async () => {
  const key = document.getElementById("apiKeyInput").value.trim();
  if (key) {
    await saveAPIKey(key);
    document.getElementById("status").textContent = "API key set ✓";
  }
});

async function saveAPIKey(key) {
  await browser.storage.local.set({API_KEY: key})
}

async function getAPIKey() {
  const {API_KEY} =  await browser.storage.local.get("API_KEY")
  return API_KEY
}
