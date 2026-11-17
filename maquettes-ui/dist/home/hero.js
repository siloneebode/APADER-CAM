/* Home hero: three photographs, quiet crossfade, no pagination. */
(() => {
  const root = document.querySelector('#introduction.hero-carousel');
  if (!root) return;
  const scenes = [...root.querySelectorAll('.hero-scene')];
  const toggle = root.querySelector('[data-hero-toggle]');
  const live = root.querySelector('.hero-live');
  const header = document.querySelector('#apader-header');
  const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
  const reasons = new Set();
  let index = 0;
  let timer;
  let userPaused = false;
  let motionPaused = reducedMotion.matches;
  let pointerStart;

  function sync() {
    clearTimeout(timer);
    const paused = userPaused || motionPaused || reasons.size > 0;
    root.dataset.heroPaused = String(paused);
    root.dataset.heroUserPaused = String(userPaused);
    root.dataset.heroMotionPaused = String(motionPaused);
    toggle.setAttribute('aria-pressed', String(paused));
    const label = paused ? 'Reprendre le défilement du héros' : 'Mettre le défilement du héros en pause';
    toggle.setAttribute('aria-label', label);
    toggle.title = label;
    if (!paused && scenes.length > 1) timer = setTimeout(() => select(index + 1), 9000);
  }
  function reason(name, active) {
    if (active) reasons.add(name); else reasons.delete(name);
    sync();
  }
  function select(next, manual = false) {
    const previous = index;
    index = (next + scenes.length) % scenes.length;
    root.dataset.heroSlide = String(index + 1);
    scenes.forEach((scene, i) => {
      scene.classList.toggle('is-current', i === index);
      scene.classList.toggle('is-previous', i === previous && i !== index);
      scene.setAttribute('aria-hidden', String(i !== index));
    });
    if (manual && live) live.textContent = `Diapositive ${index + 1} sur ${scenes.length} : ${scenes[index].dataset.caption}`;
    sync();
  }
  toggle.addEventListener('click', () => {
    if (userPaused || motionPaused) {
      userPaused = false;
      motionPaused = false;
    } else userPaused = true;
    sync();
  });
  root.addEventListener('keydown', event => {
    if (event.target !== toggle || !['ArrowLeft', 'ArrowRight'].includes(event.key)) return;
    event.preventDefault();
    select(index + (event.key === 'ArrowRight' ? 1 : -1), true);
  });
  root.addEventListener('pointerdown', event => {
    if (event.pointerType === 'mouse' || event.target.closest('a,button,nav,header')) return;
    pointerStart = {x:event.clientX,y:event.clientY,id:event.pointerId};
  });
  root.addEventListener('pointerup', event => {
    if (!pointerStart || pointerStart.id !== event.pointerId) return;
    const dx = event.clientX - pointerStart.x;
    const dy = event.clientY - pointerStart.y;
    pointerStart = null;
    if (Math.abs(dx) > 56 && Math.abs(dx) > Math.abs(dy) * 1.3) select(index + (dx < 0 ? 1 : -1), true);
  });
  root.addEventListener('pointercancel', () => { pointerStart = null; });
  document.addEventListener('visibilitychange', () => reason('hidden', document.hidden));
  new IntersectionObserver(entries => reason('outside', entries[0].intersectionRatio < .25),
    {threshold:[0,.25,1]}).observe(root);
  if (header) new MutationObserver(() => reason('menu', header.classList.contains('has-open-menu')))
    .observe(header, {attributes:true,attributeFilter:['class']});
  reducedMotion.addEventListener('change', () => {
    motionPaused = reducedMotion.matches;
    sync();
  });
  window.addEventListener('pagehide', () => reason('hidden', true));
  window.addEventListener('pageshow', () => reason('hidden', document.hidden));
  reason('hidden', document.hidden);
  select(0);
})();
