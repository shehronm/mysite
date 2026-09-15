/* Event-driven enhancement: animation belongs to graphics, never scroll control. */
(() => {
  'use strict';
  const t=window.MiroI18n?.t??(text=>text);
  const root = document.documentElement;
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const fine = matchMedia('(hover: hover) and (pointer: fine)');
  const toggle = document.querySelector('.motion-toggle');
  let paused = false;
  try { paused = localStorage.getItem('miro:motion') === 'paused'; } catch { /* Optional preference. */ }
  const enabled = () => !reduced.matches && !paused;
  function sync() {
    root.dataset.motionPreference = paused ? 'paused' : 'running';
    root.classList.add('motion-ready');
    if (toggle) {
      toggle.hidden = reduced.matches;
      toggle.dataset.paused = String(paused);
      toggle.setAttribute('aria-label', t(paused ? 'Resume animations' : 'Pause animations'));
      toggle.title = t(paused ? 'Resume animations' : 'Pause animations');
    }
    if (!enabled()) {
      root.classList.remove('motion-entry');
      document.querySelectorAll('.section-arrive').forEach(el => el.classList.remove('section-arrive'));
    }
    document.dispatchEvent(new CustomEvent('miro:motion', {detail:{enabled:enabled()}}));
  }
  toggle?.addEventListener('click', () => {
    paused = !paused;
    try { localStorage.setItem('miro:motion', paused ? 'paused' : 'running'); } catch { /* In-memory control still works. */ }
    sync();
  });
  reduced.addEventListener('change', sync);
  if (enabled()) root.classList.add('motion-entry');
  sync();

  // Entrance classes are added on arrival. Unobserved and no-JS content stays visible.
  if ('IntersectionObserver' in window) {
    const waiting = new WeakSet();
    const arrive = new IntersectionObserver(entries => entries.forEach(entry => {
      if (!entry.isIntersecting) { waiting.add(entry.target);return; }
      if (waiting.has(entry.target) && enabled()) entry.target.classList.add('section-arrive');
      arrive.unobserve(entry.target);
    }), {threshold:.08,rootMargin:'0px 0px -20px 0px'});
    const textBlocks=[...document.querySelectorAll('main h2,main h3,main p,main blockquote,main .micro,main .principle,main .contact-option,main .person>div,main .evidence-item,main .practice-title,main .about-facts>div,main .contact-channel')]
      .filter(el=>!el.closest('.work-shell,.opening,.page-hero,.page-reviews .hero,.ticker,[aria-hidden="true"]'));
    textBlocks.filter(el=>!textBlocks.some(parent=>parent!==el && parent.contains(el))).forEach(el=>arrive.observe(el));
    const visibility = new IntersectionObserver(entries => entries.forEach(entry => {
      entry.target.dataset.motionVisible = String(entry.isIntersecting);
    }), {rootMargin:'60px'});
    document.querySelectorAll('.hero-art,.offer-mark').forEach(el => visibility.observe(el));
  }

  // A single scheduled frame per input burst; there is no permanent JS animation loop.
  const opening = document.querySelector('.opening');
  const art = document.querySelector('#heroWave');
  const orbit = document.querySelector('.hero-orbit');
  const field = document.querySelector('.offer-mark');
  let frame = 0;
  let pointerX = 0, pointerY = 0;
  function updateArt() {
    frame = 0;
    if (!enabled() || document.hidden || root.dataset.motion === 'paused') return;
    if (opening && art) {
      const rect = opening.getBoundingClientRect();
      if (rect.bottom > 0 && rect.top < innerHeight) {
        const progress = Math.max(0,Math.min(1,-rect.top / rect.height));
        art.style.setProperty('--art-x', `${(pointerX * 13).toFixed(2)}px`);
        art.style.setProperty('--art-y', `${(pointerY * 9 + progress * 35).toFixed(2)}px`);
        orbit?.style.setProperty('--orbit-x', `${(-pointerX * 7).toFixed(2)}px`);
        orbit?.style.setProperty('--orbit-y', `${(-pointerY * 5 - progress * 18).toFixed(2)}px`);
      }
    }
    if (field) {
      const rect = field.getBoundingClientRect();
      if (rect.bottom > 0 && rect.top < innerHeight) {
        const progress = 1 - Math.max(0,Math.min(1,rect.top / innerHeight));
        field.style.setProperty('--field-x', `${((progress - .5) * 18).toFixed(2)}px`);
      }
    }
  }
  function schedule() { if (!frame && enabled()) frame = requestAnimationFrame(updateArt); }
  opening?.addEventListener('pointermove', event => {
    if (!fine.matches || event.pointerType !== 'mouse' || !enabled()) return;
    const rect = opening.getBoundingClientRect();
    pointerX = (event.clientX - rect.left) / rect.width * 2 - 1;
    pointerY = (event.clientY - rect.top) / rect.height * 2 - 1;
    schedule();
  }, {passive:true});
  opening?.addEventListener('pointerleave', () => { pointerX=pointerY=0;schedule(); });
  if (opening || field) addEventListener('scroll',schedule,{passive:true});
  document.addEventListener('miro:overlay',event=>{if(!event.detail)schedule()});
  document.addEventListener('visibilitychange',()=>{if(!document.hidden)schedule()});
  document.addEventListener('miro:motion',schedule);

  document.querySelectorAll('.offer-row').forEach(row => {
    let rowFrame = 0, latestX = 50;
    row.addEventListener('pointermove',event=>{
      if (!enabled() || !fine.matches || event.pointerType !== 'mouse') return;
      const rect = row.getBoundingClientRect();
      latestX = (event.clientX-rect.left) / rect.width * 100;
      if (!rowFrame) rowFrame=requestAnimationFrame(()=>{row.style.setProperty('--row-x',`${latestX.toFixed(1)}%`);rowFrame=0});
    },{passive:true});
  });
})();
