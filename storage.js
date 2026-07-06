export async function saveAPIKey(key) {
  await browser.storage.local.set({API_KEY: key})
}

export async function getAPIKey() {
  const {API_KEY} =  await browser.storage.local.get("API_KEY")
  return API_KEY
}

export async function saveCurrentModelIndex(index) {
  await browser.storage.local.set({MODEL_INDEX: index})
}

export async function getCurrentModelIndex() {
  const {MODEL_INDEX} = await browser.storage.local.get("MODEL_INDEX")
  return MODEL_INDEX ?? 0
}
