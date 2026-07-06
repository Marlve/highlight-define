export async function saveAPIKey(key) {
  await browser.storage.local.set({API_KEY: key})
}

export async function getAPIKey() {
  const {API_KEY} =  await browser.storage.local.get("API_KEY")
  return API_KEY
}

export async function saveCurrentModel() {
}

export async function getCurrentModel() {
  
}
