document.addEventListener('mouseup', () => {
  const selection = getSelection();
  const highlightedText = selection.toString().trim();

  if (highlightedText.length) {
    getTranslation(highlightedText)
  }
})

async function saveAPIKey(key) {
  await browser.storage.local.set({API_KEY: key})
}

async function getAPIKey() {
  const {API_KEY} =  await browser.storage.local.get("API_KEY")
  return API_KEY
}

function getPrompt(word) {
  const prompt = `You are a Korean-English dictionary assistant. The user highlighted this Korean word or phrase on a webpage: "${word}"

Provide:
1. All common meanings/senses of this word (Korean words often have multiple distinct meanings the learner should know)
2. For each meaning, a short English definition
3. For each meaning, one natural example sentence in Korean using that word in that sense, plus its English translation

Respond only in the specified JSON structure, no other text.`;

return prompt
}



async function getTranslation(word) {
  try {
    const apiKey = await getAPIKey();
    console.log(apiKey)
    const response = await fetch(
      "https://generativelanguage.googleapis.com/v1beta/interactions",
      {
        method: "POST",
        headers: {
          "x-goog-api-key": apiKey,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          model: "gemini-3.5-flash",
          input: getPrompt(word),
          response_format: {
            type: "text",
            mime_type: "application/json",
            schema: {
              type: "object",
              properties: {
                word: {
                  type: "string",
                  description: "The word that is being translated."
                },
                meanings: {
                  type: "array",
                  items: {
                    type: "object",
                    properties: {
                      meaning_number: {type: "string", description: "The order it is in the array."},
                      definition: {type: "string", description: "The definition of translated word. (Always give a one word/short sentence definition)"},
                      example_ko: {type: "string", description: "An example sentence written in Korean."},
                      example_en: {type: "string", description: "An example sentence written in English."}
                    },
                    required: ["meaning_number", "definition", "example_ko", "example_en"]
                  }
                }
              },
              required: ["word", "meanings"]
            }
          }
        })
      }
    );

    if (!response.ok) {
      const errBody = await response.text();
      throw new Error(`API error ${response.status}: ${errBody}`)
    }

    const data = await response.json();
    const content = data.steps.find(step => step.type === "model_output")?.content?.find(c => c.type === "text")?.text;
    console.log("DATA:", content);
  } catch (err) {
    console.error("ERROR:", err);
  }
}


// const prompt = `You are a Korean-English dictionary assistant. The user highlighted this Korean word or phrase on a webpage: "${highlightedWord}"

// It appeared in this surrounding context: "${surroundingSentence}"

// Provide:
// 1. All common meanings/senses of this word (not just the one matching the context — Korean words often have multiple distinct meanings the learner should know)
// 2. For each meaning, a short English definition
// 3. For each meaning, one natural example sentence in Korean using that word in that sense, plus its English translation
// 4. Indicate which meaning best fits the given context

// Respond only in the specified JSON structure, no other text.`;
