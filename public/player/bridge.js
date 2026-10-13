// The app page drives these prototype players by postMessage (PLAN.md §7.8). The player runs in an
// <iframe sandbox="allow-scripts"> (opaque origin, connect-src 'none'), so it can only draw what it is sent.
// Messages: {type:'reset'} · {type:'els', els} · {type:'els_add', els} · {type:'step', step, wav?} · {type:'done'}
//           · {type:'script', script, voice?} (a finished script: replay, or paper/match-cut after streaming; voice =
//             how many spoken lines will follow as WAVs from the app's voice) · {type:'wav', i, wav} (line i's WAV, or null when
//             the voice could not make it: that line gets the browser voice)
// The player answers {type:'ended'} when a run finishes and {type:'error', message} if a run throws.
(() => {
  const style = document.documentElement.dataset.style;
  document.documentElement.classList.add('embed');
  const tell = msg => parent.postMessage(msg, '*');       // the parent checks event.source, not the origin (ours is opaque)

  // A step may arrive with its line already spoken by the app (a WAV): play that. Without one (voice off
  // or failed), the player's own say() uses the browser's voice.
  let audio = null;
  const hush = () => { window.speechSynthesis?.cancel(); audio?.pause(); audio = null; };
  const playWav = (wav, text) => new Promise(done => {
    if (text != null) document.getElementById('caption').textContent = text;
    audio = new Audio(URL.createObjectURL(new Blob([wav], { type: 'audio/wav' })));
    audio.onended = audio.onerror = audio.onpause = () => done();
    audio.play().catch(() => done());
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

  // Whiteboard: steps play as they arrive. Paper and match-cut play the finished script.
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

  addEventListener('message', ev => {
    if (ev.source !== parent || !ev.data || typeof ev.data !== 'object') return;
    const m = ev.data;
    if (m.type === 'hello') { tell({ type: 'ready' }); return; }   // the page may have missed our first 'ready'
    if (m.type === 'reset') { gen++; A = null; done = false; hush(); }
    else if (m.type === 'script') playScript(m.script, m.voice);
    else if (m.type === 'wav' && self.VOICE_WAVS && Number.isInteger(m.i) && m.i >= 0 && m.i < self.VOICE_WAVS.length) {
      const w = self.VOICE_WAVS[m.i] = m.wav instanceof ArrayBuffer ? m.wav : null;
      (waiters[m.i] || []).forEach(f => f(w)); waiters[m.i] = [];
    }
    else if (style !== 'whiteboard') return;
    else if (m.type === 'els') { A = { els: { ...m.els }, steps: [] }; done = false; restart(); }
    else if (m.type === 'els_add' && A) { Object.assign(A.els, m.els); restart(); }   // rare: replay with the new drawings
    else if (m.type === 'step' && A) A.steps.push(m.wav instanceof ArrayBuffer ? { ...m.step, wav: m.wav } : m.step);
    else if (m.type === 'done') done = true;
  });
  tell({ type: 'ready' });
})();
