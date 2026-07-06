document.addEventListener('mouseup', async () => {
  const selection = getSelection();
  const highlightedText = selection.toString().trim();

  if (!highlightedText.length) return;

  try {
    const response = await browser.runtime.sendMessage({
      type: "GET_TRANSLATION",
      word: highlightedText
    });

    if (response.success) {
      console.log("Translation:", response.data);
    } else {
      console.error("Translation failed:", response.error);
    }
  } catch (err) {
    console.error("Message sending failed:", err);
  }

  function isKorean(text) {
  // Hangul syllables + Jamo (individual consonants/vowels) + compatibility jamo
  const koreanRegex = /[\uAC00-\uD7A3\u1100-\u11FF\u3130-\u318F]/;
  return koreanRegex.test(text);
}
})
