// The app page drives these prototype players by postMessage (PLAN.md §7.8). The player runs in an
// <iframe sandbox="allow-scripts"> (opaque origin, connect-src 'none'), so it can only draw what it is sent.
// Messages: {type:'reset'} · {type:'els', els} · {type:'els_add', els} · {type:'step', step} · {type:'done'}
//           · {type:'script', script} (a finished script: replay, or paper/match-cut after streaming)
// The player answers {type:'ended'} when a run finishes and {type:'error', message} if a run throws.
(() => {
  const style = document.documentElement.dataset.style;
  document.documentElement.classList.add('embed');
  const tell = msg => parent.postMessage(msg, '*');       // the parent checks event.source, not the origin (ours is opaque)

  // The prototype pages draw a demo answer on load; an embedded player starts blank and silent.
  const blank = () => {
    window.speechSynthesis?.cancel(); document.getAnimations().forEach(a => a.cancel());
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
          await Promise.all([say(s.say), (async () => { for (const c of s.do) await run(c); await penUp(); })()]);
          await wait(250);
        } else if (done) break;
        else await new Promise(r => setTimeout(r, 80));
      }
      if (my === gen) tell({ type: 'ended' });
    } catch (e) { tell({ type: 'error', message: String(e.message || e) }); }
  }
  const restart = () => { gen++; window.speechSynthesis?.cancel(); document.getAnimations().forEach(a => a.cancel()); build(A); streamPlay(gen); };

  async function playScript(script) {
    gen++;
    try {
      if (style === 'whiteboard') { A = { ...script, steps: [...script.steps] }; done = true; restart(); return; }
      if (style === 'paper') { TOPICS.embed = fromRecipe(script); current = 'embed'; play('embed'); }
      else { ANS.length = 0; ANS.push(script); show(0); }
    } catch (e) { tell({ type: 'error', message: String(e.message || e) }); }
  }

  addEventListener('message', ev => {
    if (ev.source !== parent || !ev.data || typeof ev.data !== 'object') return;
    const m = ev.data;
    if (m.type === 'reset') { gen++; A = null; done = false; window.speechSynthesis?.cancel(); }
    else if (m.type === 'script') playScript(m.script);
    else if (style !== 'whiteboard') return;
    else if (m.type === 'els') { A = { els: { ...m.els }, steps: [] }; done = false; restart(); }
    else if (m.type === 'els_add' && A) { Object.assign(A.els, m.els); restart(); }   // rare: replay with the new drawings
    else if (m.type === 'step' && A) A.steps.push(m.step);
    else if (m.type === 'done') done = true;
  });
  tell({ type: 'ready' });
})();
