// BUG LIST
// THE DIV GENERATE COULD BE HIGHLIGHTED AND IF IT IS A KOREAN WORD IT WILL SHOW UP AGAIN
// SOME PAGES HAVE A WEIRD CSS
// https://www.90daykorean.com/korean-words/ THIS WEBSITE IS ONE OF THEM
// IF TRANSLATE CARD EXIST, CANT TRANSLATE ANOTHER WORD
// TRANSLATE CARD KIND OF FOLLOWS AROUND IT SHOULD JUST BE STICKY AND BE NEAR THE WORD IT WAS FROM
// IT'S ANNOYING TO HAVE THE CARD SHOWN FOREVER BUT I DONT WANT IT TO DISAPPEAR EASILY BECAUSE IT WILL USE A LOT OF TOKEN AND PROMPT.
// TEST A KOREAN WORD WITH MANY MEANINGS
// REVIEW THIS GENERATED CODE.
// IF NO KEY SHOW BUTTON
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
      const {word: translatedWord, meanings} = response.data;
      showResultCard(translatedWord, meanings);
    } else {
      console.error("Translation", response.error);
    }
  } catch (err) {
    console.error("Message sending failed", err);
  } finally {
    closeLoading();
  }
}

// -----------------------------------------------
// RESULT CARD FUNCTION
// -----------------------------------------------
function createResultCard(word, meanings) {
  const card = document.createElement("div");
  card.className = "result-card";
  card.id = "translate-result";

  const head = document.createElement("div");
  head.className = "result-head";

  const wordKr = document.createElement("span");
  wordKr.className = "word-kr";
  wordKr.textContent = word;

  head.appendChild(wordKr);
  card.appendChild(head);

  meanings.slice(0, 3).forEach(({meaning_number, definition, example_ko, example_en}) => {
    const meaningEl = document.createElement("div");
    meaningEl.className = "meaning";

    const num = document.createElement("span");
    num.className = "m-num";
    num.textContent = String(meaning_number).padStart(2, "0");

    const body = document.createElement("div");
    body.className = "m-body";

    const def = document.createElement("p");
    def.className = "m-def";
    def.textContent = definition;

    const example = document.createElement("div");
    example.className = "m-example";

    const exKr = document.createElement("p");
    exKr.className = "ex-kr";
    exKr.textContent = example_ko;

    const exEn = document.createElement("p");
    exEn.className = "ex-en";
    exEn.textContent = example_en;

    example.append(exKr, exEn);
    body.append(def, example);
    meaningEl.append(num, body);
    card.appendChild(meaningEl);
  });

  return card;
}

function showResultCard(word, meanings) {
  deleteResultCard();

  const card = createResultCard(word, meanings);
  const anchor = getButtonElement();
  const top = anchor ? parseInt(anchor.style.top, 10) : 100;
  const left = anchor ? parseInt(anchor.style.left, 10) : 100;

  Object.assign(card.style, {
    position: "fixed",
    top: `${top + 56}px`,
    left: `${left}px`,
    zIndex: "999999"
  });

  document.body.appendChild(card);
}

function deleteResultCard() {
  const existing = document.getElementById("translate-result");
  if (existing) existing.remove();
}

// -----------------------------------------------
// BUTTON FUNCTION
// -----------------------------------------------
function createButton(e, word) {
  const wrap = document.createElement("div");
  wrap.className = "trigger-wrap";
  wrap.id = "translate-wrap";
  Object.assign(wrap.style, {
    position: "fixed",
    top: `${e.clientY}px`,
    left: `${e.clientX}px`,
    zIndex: "999999"
  });
  const button = document.createElement("button");
  button.className = "trigger-btn"
  button.id = "translate-btn";
  button.textContent = "번역";
  button.addEventListener("click", () => {
    console.log("button clicked", word)
    startTranslate(word)
  });
  wrap.appendChild(button);
  document.body.appendChild(wrap);
}
function buttonExist() {
  return document.getElementById("translate-wrap") !== null;
}
function getButtonElement() {
  return document.getElementById("translate-wrap");
}
function deleteButton() {
  if (buttonExist()) {
    const wrap = getButtonElement()
    wrap.remove()
  }
}
function moveButton(e) {
  const wrap = getButtonElement()
  wrap.style.left = `${e.clientX}px`;
  wrap.style.top = `${e.clientY}px`;
}

function showLoading() {
  const wrap = getButtonElement();
  if (!wrap) return;
  wrap.classList.add("loading");

  const ring = document.createElement("div");
  ring.className = "ring";
  ring.id = "translate-ring";
  wrap.appendChild(ring);

  const button = document.getElementById("translate-btn");
  if (button) button.disabled = true;
}

function closeLoading() {
  const wrap = getButtonElement();
  if (!wrap) return;
  wrap.classList.remove("loading");

  const ring = document.getElementById("translate-ring");
  if (ring) ring.remove();

  const button = document.getElementById("translate-btn");
  if (button) button.disabled = false;
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
