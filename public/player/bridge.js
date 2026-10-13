// The app page drives these prototype players by postMessage (PLAN.md §7.8). The player runs in an
// <iframe sandbox="allow-scripts"> (opaque origin, connect-src 'none'), so it can only draw what it is sent.
// Messages: {type:'reset'} · {type:'els', els} · {type:'els_add', els} · {type:'step', step, wav?} · {type:'done'}
//           (step and done: whiteboard and paper)
//           · {type:'script', script, voice?} (a finished script: replay, or paper/match-cut after streaming; voice =
//             how many spoken lines will follow as WAVs from the app's voice) · {type:'wav', i, wav} (line i's WAV, or null when
//             the voice could not make it: that line gets the browser voice)
// The player answers {type:'ended'} when a run finishes and {type:'error', message} if a run throws.
// Sound: an iPhone refuses audio started in this frame (no tap ever lands here), so the player asks the page to play
// each WAV — {type:'play', id, wav} → the page answers {type:'played', id} when it has ended — and {type:'hush'}
// stops it (13 Oct 2026).
(() => {
  const style = document.documentElement.dataset.style;
  document.documentElement.classList.add('embed');
  const tell = msg => parent.postMessage(msg, '*');       // the parent checks event.source, not the origin (ours is opaque)

  // A step may arrive with its line already spoken by the app (a WAV): play that. Without one (voice off
  // or failed), the player's own say() uses the browser's voice.
  let seq = 0;
  const playing = new Map();                                // id -> resolve, until the page says 'played'
  const hush = () => {
    window.speechSynthesis?.cancel();
    if (playing.size) { tell({ type: 'hush' }); playing.forEach(f => f()); playing.clear(); }
  };
  const playWav = (wav, text) => new Promise(done => {
    if (text != null) document.getElementById('caption').textContent = text;
    const id = ++seq;
    playing.set(id, done);
    tell({ type: 'play', id, wav });                        // copied, not transferred: a replay plays it again
  });

  // Paper and match-cut (stopmotion-topics.html play(), styles-lib.js narratedPlayer) start on the script and get
  // their lines as the app makes them (each ~2 s): VOICE_WAVS[i] is undefined until line i arrives, then a WAV, or
  // null for the browser voice. waitLine(i) waits for it; sayLine(i, text) speaks it either way.
  self.VOICE_WAVS = null;
  let waiters = [];
  self.waitLine = i => self.VOICE_WAVS?.[i] !== undefined ? Promise.resolve(self.VOICE_WAVS[i])
    : new Promise(r => (waiters[i] ||= []).push(r));
  self.sayLine = (wav, text) => wav ? playWav(wav, null) : new Promise(done => {
    if (!window.speechSynthesis) return setTimeout(done, 1200 + text.length * 70);
    const u = new SpeechSynthesisUtterance(text); u.rate = 1.02; u.onend = u.onerror = () => done(); speechSynthesis.speak(u);
  });
  self.hushVoice = () => hush();

  // The prototype pages draw a demo answer on load; an embedded player starts blank and silent.
  const blank = () => {
    hush(); document.getAnimations().forEach(a => a.cancel());
    if (style === 'whiteboard') scene.replaceChildren();
    else { const c = document.getElementById('cv'); c.getContext('2d').clearRect(0, 0, c.width, c.height); if (typeof player !== 'undefined') player?.stop?.(); }
    document.getElementById('caption').textContent = '';
  };
  blank();

  // Whiteboard and paper: steps play as they arrive. Match-cut plays the finished script.
  let A = null, done = false, gen = 0;
  async function streamPlay(my) {
    let i = 0;
    try {
      while (my === gen) {
        if (i < A.steps.length) {
          const s = A.steps[i++];
          await Promise.all([s.wav ? playWav(s.wav, s.say) : say(s.say), (async () => { for (const c of s.do) await run(c); await penUp(); })()]);
          await wait(250);
        } else if (done) break;
        else await new Promise(r => setTimeout(r, 80));
      }
      if (my === gen) tell({ type: 'ended' });
    } catch (e) { tell({ type: 'error', message: String(e.message || e) }); }
  }
  const restart = () => { gen++; hush(); document.getAnimations().forEach(a => a.cancel()); build(A); streamPlay(gen); };

  async function playScript(script, voice) {
    gen++; hush();
    self.VOICE_WAVS = Number.isInteger(voice) && voice > 0 ? new Array(voice).fill(undefined) : null; waiters = [];
    try {
      if (style === 'whiteboard') { A = { ...script, steps: [...script.steps] }; done = true; restart(); return; }
      if (style === 'paper') { TOPICS.embed = fromRecipe(script); current = 'embed'; play('embed'); }
      else { ANS.length = 0; ANS.push(script); show(0); }
    } catch (e) { tell({ type: 'error', message: String(e.message || e) }); }
  }

  // Paper while it is being written: each step plays as it arrives (with its WAV, or null for the browser voice);
  // waitLine(i) waits for step i, and 'done' puts LINE_END after the last one.
  self.LINE_END = Symbol('end');
  let P = null;
  function paperStream(m) {
    if (m.type === 'step' && m.step) {
      const s = m.step, start = !P;
      if (start) { P = { q: '', live: true, recipe: { steps: [] }, bgs: [], lines: [], scenes: [] }; self.VOICE_WAVS = []; waiters = []; }
      const i = P.lines.length;
      P.recipe.steps.push(s); P.bgs.push(s.bg); P.lines.push(s.say); P.scenes.push((t, f) => runRecipe(s.do, t, f));
      if (start) { TOPICS.embed = P; current = 'embed'; play('embed'); }
      lineIn(i, m.wav instanceof ArrayBuffer ? m.wav : null);
    } else if (m.type === 'done' && P) lineIn(P.lines.length, self.LINE_END);
  }
  const lineIn = (i, w) => { self.VOICE_WAVS[i] = w; (waiters[i] || []).forEach(f => f(w)); waiters[i] = []; };

  addEventListener('message', ev => {
    if (ev.source !== parent || !ev.data || typeof ev.data !== 'object') return;
    const m = ev.data;
    if (m.type === 'hello') { tell({ type: 'ready' }); return; }   // the page may have missed our first 'ready'
    if (m.type === 'played') { const f = playing.get(m.id); playing.delete(m.id); f?.(); return; }
    if (m.type === 'reset') { gen++; A = null; P = null; done = false; hush(); }
    else if (m.type === 'script') playScript(m.script, m.voice);
    else if (m.type === 'wav' && self.VOICE_WAVS && Number.isInteger(m.i) && m.i >= 0 && m.i < self.VOICE_WAVS.length) {
      const w = self.VOICE_WAVS[m.i] = m.wav instanceof ArrayBuffer ? m.wav : null;
      (waiters[m.i] || []).forEach(f => f(w)); waiters[m.i] = [];
    }
    else if (style === 'paper') paperStream(m);
    else if (style !== 'whiteboard') return;
    else if (m.type === 'els') { A = { els: { ...m.els }, steps: [] }; done = false; restart(); }
    else if (m.type === 'els_add' && A) { Object.assign(A.els, m.els); restart(); }   // rare: replay with the new drawings
    else if (m.type === 'step' && A) A.steps.push(m.wav instanceof ArrayBuffer ? { ...m.step, wav: m.wav } : m.step);
    else if (m.type === 'done') done = true;
  });
  tell({ type: 'ready' });
})();
