import {saveAPIKey, getAPIKey} from "../storage.js"

const statusText = document.getElementById("apiStatus");
const statusDot = document.getElementById("statusDot");
const saveBtn = document.getElementById("saveKey");
const apiKeyInput = document.getElementById("apiKeyInput");

document.addEventListener("DOMContentLoaded", async () => {
  const key = await getAPIKey();
  if (key) {
    statusDot.classList.add("active");
    statusText.textContent = "Connected";
  } else {
    statusText.textContent = "No API Key Saved.";
  }
});

saveBtn.addEventListener("click", async () => {
  const key = apiKeyInput.value.trim();

  if (!key) {
    apiKeyInput.classList.add("input-error");
    apiKeyInput.addEventListener("animationend", () => {
      apiKeyInput.classList.remove("input-error");
    }, { once: true });
    apiKeyInput.focus();
    return; // stop here, don't call saveAPIKey or touch status
  }

  saveBtn.disabled = true;

  try {
    await saveAPIKey(key);
    statusText.textContent = "Connected";
    statusDot.classList.add("active");

    saveBtn.classList.add("success");
    saveBtn.addEventListener("animationend", () => {
      saveBtn.classList.remove("success");
      saveBtn.disabled = false;
    }, { once: true });

  } catch (e) {
    console.log(e);
    statusText.textContent = "The API key is not valid.";
    statusDot.classList.remove("active");

    saveBtn.classList.add("error");
    saveBtn.addEventListener("animationend", () => {
      saveBtn.classList.remove("error");
      saveBtn.disabled = false;
    }, { once: true });
  }
});
