// -----------------------------------------------
// SHADOW ROOT SETUP (runs once, at content script load)
// -----------------------------------------------
const shadowHost = document.createElement("div");
shadowHost.id = "highfine-host";
document.documentElement.appendChild(shadowHost); // <html>, not <body> — safer if body isn't ready yet

const shadowRoot = shadowHost.attachShadow({ mode: "open" });

const styleEl = document.createElement("style");

const fontFaceCSS = `
  @font-face{
    font-family:'Space Grotesk';
    font-weight:400;
    src:url('${browser.runtime.getURL("fonts/space-grotesk-400.woff2")}') format('woff2');
  }
  @font-face{
    font-family:'Space Grotesk';
    font-weight:500;
    src:url('${browser.runtime.getURL("fonts/space-grotesk-500.woff2")}') format('woff2');
  }
  @font-face{
    font-family:'Space Grotesk';
    font-weight:600;
    src:url('${browser.runtime.getURL("fonts/space-grotesk-600.woff2")}') format('woff2');
  }
  @font-face{
    font-family:'Inter';
    font-weight:400;
    src:url('${browser.runtime.getURL("fonts/inter-400.woff2")}') format('woff2');
  }
  @font-face{
    font-family:'Inter';
    font-weight:500;
    src:url('${browser.runtime.getURL("fonts/inter-500.woff2")}') format('woff2');
  }
  @font-face{
    font-family:'Inter';
    font-weight:600;
    src:url('${browser.runtime.getURL("fonts/inter-600.woff2")}') format('woff2');
  }
  @font-face{
    font-family:'Noto Sans KR';
    font-weight:400;
    src:url('${browser.runtime.getURL("fonts/noto-sans-kr-400.woff2")}') format('woff2');
  }
  @font-face{
    font-family:'Noto Sans KR';
    font-weight:500;
    src:url('${browser.runtime.getURL("fonts/noto-sans-kr-500.woff2")}') format('woff2');
  }
`;
;

styleEl.textContent = fontFaceCSS + `
  :host{
    all: initial; /* defends the host element itself against aggressive page-wide selectors */
    --bg-page:#222222;
    --surface-card:#2a2a2a;
    --surface-raised:#313131;
    --accent:#961B2B;
    --accent-hover:#B32338;
    --gold:#e6b93a;
    --gold-dim:#8a6c22;
    --ink:#F2F2F2;
    --ink-muted:#9a9a9a;
    --line:#3d3d3d;
  }
  *{box-sizing:border-box;}

  /* ---------- TRIGGER BUTTON ---------- */
  .translate-wrap{
    position:relative;
    width:48px;
    height:48px;
    display:flex;
    align-items:center;
    justify-content:center;
    animation: translate-pop 0.28s cubic-bezier(0.34, 1.56, 0.64, 1);
  }
  @keyframes translate-pop{
    0%   { opacity:0; transform:scale(0.4); }
    60%  { opacity:1; transform:scale(1.12); }
    100% { opacity:1; transform:scale(1); }
  }
  @keyframes translate-pop-out{
    0%   { opacity:1; transform: scale(1); }
    100% { opacity:0; transform: scale(0.5); }
  }
  .translate-wrap.removing{
    animation: translate-pop-out 0.18s ease forwards;
    pointer-events: none;
  }

  .translate-btn{
    all: unset;
    box-sizing:border-box;
    width:36px;
    height:36px;
    border-radius:50%;
    background:var(--accent);
    color:#F2F2F2;
    display:flex;
    align-items:center;
    justify-content:center;
    font-family:'Space Grotesk',sans-serif;
    font-size:12px;
    cursor:pointer;
    position:relative;
    z-index:2;
    transition: transform 0.15s ease, background 0.15s ease, box-shadow 0.15s ease;
  }
  .translate-btn:hover{
    all: unset;
    box-sizing:border-box;
    width:36px;
    height:36px;
    border-radius:50%;
    background:var(--accent-hover);
    color:#F2F2F2;
    display:flex;
    align-items:center;
    justify-content:center;
    font-family:'Space Grotesk',sans-serif;
    font-size:12px;
    cursor:pointer;
    position:relative;
    z-index:2;
    transform:scale(1.08);
    box-shadow:0 0 10px 2px rgba(230,185,58,0.35);
    transition: transform 0.15s ease, background 0.15s ease, box-shadow 0.15s ease;
  }
  .translate-btn:active{
    all: unset;
    box-sizing:border-box;
    width:36px;
    height:36px;
    border-radius:50%;
    background:var(--accent);
    color:#F2F2F2;
    display:flex;
    align-items:center;
    justify-content:center;
    font-family:'Space Grotesk',sans-serif;
    font-size:12px;
    cursor:pointer;
    position:relative;
    z-index:2;
    transform:scale(0.9);
    transition: transform 0.1s ease;
  }
  .translate-btn:disabled{
    all: unset;
    box-sizing:border-box;
    width:36px;
    height:36px;
    border-radius:50%;
    background:var(--accent);
    color:#F2F2F2;
    display:flex;
    align-items:center;
    justify-content:center;
    font-family:'Space Grotesk',sans-serif;
    font-size:12px;
    cursor:default;
    position:relative;
    z-index:2;
    opacity:0.55;
    pointer-events:none;
  }

  .ring{
    position:absolute;
    inset:0;
    border-radius:50%;
    border:2px dashed var(--gold);
    animation:spin 3.2s linear infinite;
    box-shadow:0 0 12px 1px rgba(230,185,58,0.45);
  }
  @keyframes spin{
    to{transform:rotate(360deg);}
  }
  .state-caption{
    font-size:12px;
    color:var(--ink-muted);
    text-align:center;
  }

  /* ---------- RESULT CARD ---------- */
  .result-card{
    width:300px;
    background:var(--surface-card);
    border-radius:12px;
    border:1px solid var(--line);
    padding:18px 20px 16px;
    transform-origin: top left;
    animation: card-pop 0.32s cubic-bezier(0.34, 1.56, 0.64, 1);
    overflow: hidden;
    transition: height 0.28s ease;
  }
  @keyframes card-pop{
    0%   { opacity:0; transform: translateY(8px) scale(0.92); }
    60%  { opacity:1; transform: translateY(-2px) scale(1.02); }
    100% { opacity:1; transform: translateY(0) scale(1); }
  }
  @keyframes card-pop-out{
    0%   { opacity:1; transform: translateY(0) scale(1); }
    100% { opacity:0; transform: translateY(6px) scale(0.94); }
  }
  .result-card.removing{
    animation: card-pop-out 0.2s ease forwards;
    pointer-events: none;
  }

  .card-inner{
    transition: opacity 0.18s ease;
  }
  .card-inner.fade-out{
    opacity: 0;
  }

  .result-head{
    display:flex;
    align-items:baseline;
    gap:8px;
    margin-bottom:2px;
  }
  .word-kr{
    font-family:'Noto Sans KR',sans-serif;
    font-size:22px;
    font-weight:500;
    color:var(--ink);
  }
  .word-romanized{
    font-size:12px;
    color:var(--ink-muted);
  }
  .word-pos{
    font-size:10px;
    font-weight:500;
    color:#e88a97;
    background:rgba(150,27,43,0.28);
    padding:2px 7px;
    border-radius:20px;
    display:inline-block;
    margin:8px 0 14px;
  }
  .meaning{
    display:flex;
    gap:10px;
    padding:12px 0;
    border-top:1px solid var(--line);
  }
  .m-num{
    font-family:'Space Grotesk',sans-serif;
    font-size:13px;
    font-weight:600;
    color:var(--gold);
    min-width:16px;
  }
  .m-body{
    flex:1;
    font-family: 'Space Grotesk', sans-serif;
    font-weight: 400;
    font-size: 14px;
  }
  .m-def{
    font-size:13px;
    color:var(--ink);
    margin:0 0 8px;
    line-height:1.4;
  }
  .m-example{
    background:rgba(150,27,43,0.14);
    border-left:2px solid var(--accent);
    border-radius:0 6px 6px 0;
    padding:7px 10px;
  }
  .ex-kr{
    font-family:'Noto Sans KR',sans-serif;
    font-size:12.5px;
    color:var(--ink);
    margin:0 0 3px;
  }
  .ex-en{
    font-size:11.5px;
    color:var(--ink-muted);
    margin:0;
    font-style:italic;
  }
  .card-footer{
    margin-top:6px;
    padding-top:10px;
    border-top:1px solid var(--line);
    font-size:10px;
    color:var(--ink-muted);
    text-align:right;
  }

  /* ---------- SKELETON ---------- */
  .skel-line,
  .skel-box{
    background: linear-gradient(90deg, var(--surface-raised) 25%, #3d3d3d 50%, var(--surface-raised) 75%);
    background-size: 200% 100%;
    animation: skel-shimmer 1.4s ease-in-out infinite;
    border-radius: 4px;
  }
  @keyframes skel-shimmer{
    0%   { background-position: 200% 0; }
    100% { background-position: -200% 0; }
  }
  .skel-word{
    width: 55%;
    height: 22px;
    margin-bottom: 10px;
  }
  .skel-pos{
    width: 70px;
    height: 16px;
    border-radius: 20px;
    margin-bottom: 14px;
  }
  .skel-meaning{
    padding: 12px 0;
    border-top: 1px solid var(--line);
  }
  .skel-def{
    width: 100%;
    height: 13px;
    margin-bottom: 8px;
  }
  .skel-box{
    width: 100%;
    height: 40px;
  }
`;
shadowRoot.appendChild(styleEl);

document.addEventListener('mouseup', async (e) => {
  const path = e.composedPath();
  if (path.some(el => el.id === "translate-btn")) return; // If clicks button don't proceed to the rest of the code.

  const hasKey = await browser.runtime.sendMessage({type: "HAS_APIKEY"});
  if (!hasKey) return;

  const selection = getSelection().toString().trim();
  if (selection.length === 0 || !isKorean(selection)) {
    deleteButton();
    deleteResultCard();
    return;
  } else {
    deleteButton();
    createButton(e, selection);
  }
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

  shadowRoot.appendChild(card);
}

function transitionToResult(word, meanings) {
  const card = shadowRoot.querySelector("#translate-result");
  if (!card) return;

  const currentInner = card.querySelector(".card-inner");
  const startHeight = card.offsetHeight;
  card.style.height = `${startHeight}px`;

  currentInner.classList.add("fade-out");

  currentInner.addEventListener("transitionend", () => {
    const newInner = buildResultInner(word, meanings);
    newInner.style.opacity = "0";
    card.replaceChild(newInner, currentInner);

    const targetHeight = newInner.scrollHeight;
    card.style.height = `${targetHeight}px`;

    requestAnimationFrame(() => {
      newInner.style.transition = "opacity 0.18s ease";
      newInner.style.opacity = "1";
    });

    card.addEventListener("transitionend", function clearHeight(ev) {
      if (ev.propertyName === "height") {
        card.style.height = "auto";
        card.removeEventListener("transitionend", clearHeight);
      }
    });
  }, { once: true });
}

function deleteResultCard() {
  const card = shadowRoot.querySelector("#translate-result");
  if (!card) return;

  card.classList.add("removing");
  card.addEventListener("animationend", () => {
    card.remove();
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
  button.className = "translate-btn";
  button.id = "translate-btn";
  button.textContent = "번역";
  button.addEventListener("click", () => {
    startTranslate(word);
  });

  wrap.appendChild(button);
  shadowRoot.appendChild(wrap);
}

function buttonExist() {
  return shadowRoot.querySelector("#translate-wrap") !== null;
}

function getButtonElement() {
  return shadowRoot.querySelector("#translate-wrap");
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

  const button = shadowRoot.querySelector("#translate-btn");
  if (button) button.disabled = true;
}

function closeLoading() {
  const wrap = getButtonElement();
  if (!wrap) return;
  wrap.classList.remove("loading");

  const ring = shadowRoot.querySelector("#translate-ring");
  if (ring) ring.remove();

  const button = shadowRoot.querySelector("#translate-btn");
  if (button) button.disabled = false;
}

// -----------------------------------------------
// HELPER FUNCTION
// -----------------------------------------------
function isKorean(text) {
  const koreanRegex = /[\uAC00-\uD7A3\u1100-\u11FF\u3130-\u318F]/;
  return koreanRegex.test(text);
}
function extractKorean(text) {
  return text.match(/[\uAC00-\uD7A3\u1100-\u11FF\u3130-\u318F\s]+/g)?.join(" ").trim() ?? "";
}
