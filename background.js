import {getTranslation} from "./api.js"

browser.runtime.onMessage.addListener(async (message) => {
  if (message.type == "GET_TRANSLATION") {
    try {
      const result = await getTranslation(message.word)
      return {success: true, data: result}
    } catch (err) {
      return {success: false, error: err}
    }
  }
})
