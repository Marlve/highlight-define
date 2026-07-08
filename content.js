document.addEventListener('mouseup', (e) => {
  if (e.target.closest("#translate-btn")) return;

  const selection = getSelection().toString().trim();

  if (selection.length === 0 || !isKorean(selection)) {
    deleteButton();
    return;
  }

  if (!buttonExist()) {
    createButton(e, selection);
  } else {
    moveButton(e)
  }
})

async function startTranslate(word) {
  try {
    showLoading();
    const response = await browser.runtime.sendMessage({
      type: "GET_TRANSLATION",
      word: word
    });

    if (response.success) {
      console.log("Translation:", response);
    } else {
      console.error("Translation", response.error);
    }
  } catch (err) {
    console.error("Message sending failed", err);
  }
}

function showLoading() {

}

function closeLoading() {
  
}

// -----------------------------------------------
// BUTTON FUNCTION
// -----------------------------------------------
function createButton(e, word) {
  const button = document.createElement("button");
  button.id = "translate-btn";
  button.textContent = "Translate";
  Object.assign(button.style, {
    position: "fixed",
    top: `${e.clientY}px`,
    left: `${e.clientX}px`,
    zIndex: "999999",
    padding: "12px 12px",
    background: "#4CAF50",
    color: "white",
    border: "none",
    borderRadius: "8px",
    cursor: "pointer",
    display: "block"
  });

  button.addEventListener("click", () => {
    console.log("button clicked", word)
    startTranslate(word)
  });

   document.body.appendChild(button);
}

function buttonExist() {
  return document.getElementById("translate-btn") !== null;
}

function getButtonElement() {
  return document.getElementById("translate-btn");
}

function deleteButton() {
  if (buttonExist()) {
    const button = getButtonElement()
    button.remove()
  }
}

function moveButton(e) {
  const button = getButtonElement()
  button.style.left = `${e.clientX}px`;
  button.style.top = `${e.clientY}px`;
}

// -----------------------------------------------
// HELPER FUNCTION
// -----------------------------------------------
 function isKorean(text) {
  // Hangul syllables + Jamo (individual consonants/vowels) + compatibility jamo
  const koreanRegex = /[\uAC00-\uD7A3\u1100-\u11FF\u3130-\u318F]/;
  return koreanRegex.test(text);
}

function extractKorean(text) {
  return text.match(/[\uAC00-\uD7A3\u1100-\u11FF\u3130-\u318F\s]+/g)?.join(" ").trim() ?? "";
}
