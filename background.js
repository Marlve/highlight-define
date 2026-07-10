import {getTranslation} from "./api.js";
import { getAPIKey } from "./storage.js";

const cache = new Map()
const MAX_CACHE_SIZE = 100;

browser.runtime.onMessage.addListener(async (message) => {
  if (message.type === "GET_TRANSLATION") {
    try {
      if (cache.has(message.word)) {
        console.log("CACHE EXIST")
        return {success: true, data: cache.get(message.word)}
      };

      const result = await getTranslation(message.word)

      addToCache(message.word, result);

      return {success: true, data: result}
    } catch (err) {
      return {success: false, error: err}
    }
  }

  if (message.type === "HAS_APIKEY") {
    if (await getAPIKey()) return true;
    return false;
  }
});

function addToCache(word, result) {
  cache.set(word, result)

  if (cache.size > MAX_CACHE_SIZE) {
    const oldestKey = cache.keys().next().value;
    cache.delete(oldestKey)
  }
};
