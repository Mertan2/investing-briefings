(function () {
  if (!('speechSynthesis' in window)) return;

  const css = `
    .tts-bar {
      position: sticky; top: 0; z-index: 100;
      background: var(--panel, #161a22);
      border: 1px solid var(--line, var(--border, #262d3b));
      border-radius: 12px;
      padding: 8px 12px;
      margin: 0 0 18px;
      display: flex; gap: 8px; align-items: center; flex-wrap: wrap;
      font-size: 13px;
      box-shadow: 0 6px 18px rgba(0,0,0,0.18);
    }
    .tts-bar button, .tts-bar select, .tts-bar input[type="range"] {
      background: var(--panel-2, var(--panel, #1d2330));
      color: var(--text, inherit);
      border: 1px solid var(--line, var(--border, #262d3b));
      border-radius: 8px;
      padding: 6px 10px;
      font: inherit; font-size: 13px; cursor: pointer;
    }
    .tts-bar button:hover { border-color: var(--accent, #4ea1ff); }
    .tts-bar button:disabled { opacity: 0.4; cursor: not-allowed; }
    .tts-bar label { color: var(--muted, #9aa4b2); font-size: 12px; display: inline-flex; align-items: center; gap: 6px; }
    .tts-bar input[type="range"] { width: 90px; padding: 0; }
    .tts-active {
      background: rgba(78, 161, 255, 0.16) !important;
      outline: 2px solid var(--accent, #4ea1ff);
      outline-offset: 4px;
      border-radius: 4px;
      transition: background .2s, outline .2s;
      scroll-margin-top: 80px;
    }
  `;
  const styleEl = document.createElement('style');
  styleEl.textContent = css;
  document.head.appendChild(styleEl);

  const bar = document.createElement('div');
  bar.className = 'tts-bar';
  bar.setAttribute('role', 'toolbar');
  bar.setAttribute('aria-label', 'Audio reader');
  bar.innerHTML = `
    <button data-act="play" type="button" aria-label="Read aloud">🔊 Listen</button>
    <button data-act="pause" type="button" hidden aria-label="Pause">⏸ Pause</button>
    <button data-act="resume" type="button" hidden aria-label="Resume">▶ Resume</button>
    <button data-act="stop" type="button" hidden aria-label="Stop">⏹ Stop</button>
    <label>Voice <select data-act="voice"></select></label>
    <label>Speed <input data-act="rate" type="range" min="0.7" max="1.6" step="0.1" value="1"></label>
  `;
  const container = document.querySelector('.wrap, .container, main') || document.body;
  container.insertBefore(bar, container.firstChild);

  const playBtn = bar.querySelector('[data-act="play"]');
  const pauseBtn = bar.querySelector('[data-act="pause"]');
  const resumeBtn = bar.querySelector('[data-act="resume"]');
  const stopBtn = bar.querySelector('[data-act="stop"]');
  const voiceSel = bar.querySelector('[data-act="voice"]');
  const rateInp = bar.querySelector('[data-act="rate"]');

  let voices = [];
  let chunks = [];
  let chunkIdx = 0;

  function loadVoices() {
    const all = speechSynthesis.getVoices();
    voices = all
      .filter(v => v.lang.startsWith('en'))
      .sort((a, b) => {
        const ag = a.name.toLowerCase().includes('google');
        const bg = b.name.toLowerCase().includes('google');
        if (ag !== bg) return ag ? -1 : 1;
        return a.name.localeCompare(b.name);
      });
    if (!voices.length) voices = all;
    voiceSel.innerHTML = voices.map((v, i) =>
      `<option value="${i}">${v.name.toLowerCase().includes('google') ? '★ ' : ''}${v.name} (${v.lang})</option>`
    ).join('');
  }
  loadVoices();
  speechSynthesis.addEventListener('voiceschanged', loadVoices);

  function readables() {
    const root = document.querySelector('.wrap, .container, main') || document.body;
    return Array.from(root.querySelectorAll('h1, h2, h3, p, li, td, .card'))
      .filter(el => {
        if (bar.contains(el)) return false;
        const txt = el.textContent.trim();
        if (!txt) return false;
        // skip if a parent is already in the list (avoid double-reading)
        for (let p = el.parentElement; p && p !== root; p = p.parentElement) {
          if (p.matches('h1, h2, h3, p, li, td')) return false;
        }
        return true;
      });
  }

  function clearHi() {
    document.querySelectorAll('.tts-active').forEach(el => el.classList.remove('tts-active'));
  }

  function setUI(state) {
    playBtn.hidden = state !== 'idle';
    pauseBtn.hidden = state !== 'playing';
    resumeBtn.hidden = state !== 'paused';
    stopBtn.hidden = state === 'idle';
  }

  function readNext() {
    if (chunkIdx >= chunks.length) {
      clearHi();
      setUI('idle');
      return;
    }
    clearHi();
    const el = chunks[chunkIdx];
    el.classList.add('tts-active');
    el.scrollIntoView({ behavior: 'smooth', block: 'center' });
    const utt = new SpeechSynthesisUtterance(el.textContent.trim());
    const v = voices[voiceSel.value];
    if (v) utt.voice = v;
    utt.rate = parseFloat(rateInp.value);
    utt.onend = () => { chunkIdx++; readNext(); };
    utt.onerror = () => { chunkIdx++; readNext(); };
    speechSynthesis.speak(utt);
  }

  playBtn.addEventListener('click', () => {
    chunks = readables();
    chunkIdx = 0;
    setUI('playing');
    speechSynthesis.cancel();
    readNext();
  });
  pauseBtn.addEventListener('click', () => { speechSynthesis.pause(); setUI('paused'); });
  resumeBtn.addEventListener('click', () => { speechSynthesis.resume(); setUI('playing'); });
  stopBtn.addEventListener('click', () => {
    speechSynthesis.cancel();
    clearHi();
    chunkIdx = chunks.length;
    setUI('idle');
  });

  window.addEventListener('beforeunload', () => speechSynthesis.cancel());
})();
