import { getAPIKey, saveCurrentModelIndex, getCurrentModelIndex } from "./storage.js";

// 40RPM, 580 Request per day, 1m 250k tokens
const model = ["gemini-3.1-flash-lite", "gemini-2.5-flash-lite", "gemini-3.5-flash", "gemini-2.5-flash", "gemini-3-flash-preview"]

export async function getTranslation(word) {
  console.log("Running Translation")
  try {
    const apiKey = await getAPIKey();
    if (!apiKey) {throw new Error(`no API Key in the storage.`)}

    const response = await fetchAPI(word, apiKey);

    const formatted_data = await formatAPIResponse(response)

    return formatted_data

  } catch (err) {
    console.error("API.JS", err);
    throw err
  }
}

async function fetchAPI(word, apiKey) {
  const startIndex = await getCurrentModelIndex();

  for (let i = 0; i < model.length; i++) {
    const idx = (startIndex + i) % model.length;

    const response = await fetch(
      "https://generativelanguage.googleapis.com/v1beta/interactions",
      {
        method: "POST",
        headers: {
          "x-goog-api-key": apiKey,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          model: model[idx],
          input: getPrompt(word),
          response_format: getResponseFormat()
        })
      }
    );

    if (response.status === 429 || response.status === 503) continue; // CHECK, probably change the 503 later
    if (!response.ok) throw new Error(`Error fetching ${response.status}: ${await response.text()}`);

    await saveCurrentModelIndex(idx);
    return response;
  }
}

async function formatAPIResponse(response) {
  const json_response = await response.json();

  const text = json_response.steps
                ?.find(step => step.type === "model_output")
                ?.content?.find(c => c.type === "text")
                ?.text;

  if (!text) throw new Error("No text found in API response");

  return JSON.parse(text);
}

function getPrompt(word) {
  const prompt = `You are a Korean-English dictionary assistant.

The user highlighted this Korean word or phrase:
"${word}"

Provide:
1. The 1-3 most common meanings/senses a learner should know.
2. For each meaning:
   - short English definition
   - one natural Korean example sentence
   - English translation of the example

Respond only using the provided JSON schema.`;

  return prompt
}

function getResponseFormat() {
  const responseFormat = {
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
                      meaning_number: {type: "integer", description: "The order it is in the array."},
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
  return responseFormat
}

// -----------------------------------------------
// HELPER FUNCTION
// -----------------------------------------------

export async function confirmAPIKey(apiKey) {
  const response = await fetch(
    "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-goog-api-key": apiKey,
      },
      body: JSON.stringify({
        contents: [
          {
            parts: [
              { text: "Hello" }
            ]
          }
        ]
      })
    }
  );

  return response.status === 200 || response.status === 429;
}
