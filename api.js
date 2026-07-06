import { getAPIKey } from "./storage.js";

// 40RPM, 580 Request per day, 1m 250k tokens
const model = ["gemini-3.5-flash", "gemini-3.1-flash-lite", "gemini-3-flash-preview", "gemini-2.5-flash-lite", "gemini-2.5-flash"]

async function fetchAPI(word, apiKey) {
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
          response_format: getResponseFormat()
        })
      }
    );

    return response
}

export async function getTranslation(word) {
  console.log("Running API")
  try {
    const apiKey = await getAPIKey();
    if (!apiKey) {throw new Error(`no API Key in the storage.`)}

    const response = await fetchAPI(word, apiKey);

    if (!response.ok) {
      const errBody = await response.text();
      throw new Error(`API error ${response.status}: ${errBody}`)
    }
    const formatted_date = formatAPIResponse(response)

  } catch (err) {
    console.error("ERROR:", err);
  }
}

async function formatAPIResponse(response) {
  const json_response = await response.json();
  const text = json_response.steps
                ?.find(step => step.type === "model_output")
                ?.content?.find(c => c.type === "text")
                ?.text
  const parsed_text = JSON.parse(text)

  return parsed_text
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
