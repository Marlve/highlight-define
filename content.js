document.addEventListener('mouseup', async (e) => {
  const hasKey = await browser.runtime.sendMessage({type: "HAS_APIKEY"});

  if (!hasKey) return;

  if (e.target.closest("#translate-btn")) return;
  const selection = getSelection().toString().trim();
  if (selection.length === 0 || !isKorean(selection)) {
    deleteButton();
    deleteResultCard();
    return;
  } else {
    deleteButton();
    createButton(e, selection);
  };
})

async function startTranslate(word) {
  try {
    showLoading();
    showSkeletonCard();

    const response = await browser.runtime.sendMessage({
      type: "GET_TRANSLATION",
      word: word
    });

    if (response.success) {
      const {word: translatedWord, meanings} = response.data;
      transitionToResult(translatedWord, meanings);
    } else {
      console.error("Translation", response.error);
      deleteResultCard();
    }
  } catch (err) {
    console.error("Message sending failed", err);
    deleteResultCard();
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
  const card = document.getElementById("translate-result");
  if (!card) return;

  card.classList.add("removing");
  card.addEventListener("animationend", () => {
    card.remove();
  }, { once: true });
}

function createSkeletonCard() {
  const card = document.createElement("div");
  card.className = "result-card";
  card.id = "translate-result";

  const word = document.createElement("div");
  word.className = "skel-line skel-word";

  const pos = document.createElement("div");
  pos.className = "skel-line skel-pos";

  card.append(word, pos);

  for (let i = 0; i < 2; i++) {
    const meaning = document.createElement("div");
    meaning.className = "skel-meaning";

    const def = document.createElement("div");
    def.className = "skel-line skel-def";

    const box = document.createElement("div");
    box.className = "skel-box";

    meaning.append(def, box);
    card.appendChild(meaning);
  }

  return card;
}

function showSkeletonCard() {
  deleteResultCard();

  const card = document.createElement("div");
  card.className = "result-card";
  card.id = "translate-result";
  card.appendChild(buildSkeletonInner());

  const anchor = getButtonElement();
  const top = anchor ? parseInt(anchor.style.top, 10) : 100;
  const left = anchor ? parseInt(anchor.style.left, 10) : 100;

  Object.assign(card.style, {
    position: "absolute",
    top: `${top + 56}px`,
    left: `${left}px`,
    zIndex: "999999"
  });

  document.body.appendChild(card);
}

function buildSkeletonInner() {
  const inner = document.createElement("div");
  inner.className = "card-inner";

  const word = document.createElement("div");
  word.className = "skel-line skel-word";

  const pos = document.createElement("div");
  pos.className = "skel-line skel-pos";

  inner.append(word, pos);

  for (let i = 0; i < 2; i++) {
    const meaning = document.createElement("div");
    meaning.className = "skel-meaning";

    const def = document.createElement("div");
    def.className = "skel-line skel-def";

    const box = document.createElement("div");
    box.className = "skel-box";

    meaning.append(def, box);
    inner.appendChild(meaning);
  }

  return inner;
}

function buildResultInner(word, meanings) {
  const inner = document.createElement("div");
  inner.className = "card-inner";

  const head = document.createElement("div");
  head.className = "result-head";

  const wordKr = document.createElement("span");
  wordKr.className = "word-kr";
  wordKr.textContent = word;

  head.appendChild(wordKr);
  inner.appendChild(head);

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
    inner.appendChild(meaningEl);
  });

  return inner;
}


function transitionToResult(word, meanings) {
  const card = document.getElementById("translate-result");
  if (!card) {
    return;
  }

  const currentInner = card.querySelector(".card-inner");
  const startHeight = card.offsetHeight;
  card.style.height = `${startHeight}px`;

  currentInner.classList.add("fade-out");

  currentInner.addEventListener("transitionend", () => {
    // build new content, measure it while invisible
    const newInner = buildResultInner(word, meanings);
    newInner.style.opacity = "0";
    card.replaceChild(newInner, currentInner);

    const targetHeight = newInner.scrollHeight;
    card.style.height = `${targetHeight}px`;

    requestAnimationFrame(() => {
      newInner.style.transition = "opacity 0.18s ease";
      newInner.style.opacity = "1";
    });

    card.addEventListener("transitionend", function clearHeight(e) {
      if (e.propertyName === "height") {
        card.style.height = "auto";
        card.removeEventListener("transitionend", clearHeight);
      }
    });
  }, { once: true });
}


// -----------------------------------------------
// BUTTON FUNCTION
// -----------------------------------------------
function createButton(e, word) {
  const wrap = document.createElement("div");
  wrap.className = "translate-wrap";
  wrap.id = "translate-wrap";
  Object.assign(wrap.style, {
    position: "absolute",
    top: `${e.pageY}px`,
    left: `${e.pageX}px`,
    zIndex: "999999"
  });
  const button = document.createElement("button");
  button.className = "translate-btn"
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
  const wrap = getButtonElement();
  if (!wrap) return;

  wrap.classList.add("removing");
  wrap.addEventListener("animationend", () => {
    wrap.remove();
  }, { once: true });
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
