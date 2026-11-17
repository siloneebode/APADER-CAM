(() => {
  const root = document.querySelector('.hero-carousel');
  if (!root) return;
  const scenes = [...root.querySelectorAll('.hero-scene')];
  const selectors = [...root.querySelectorAll('.hero-selector')];
  const previous = root.querySelector('[data-hero-previous]');
  const next = root.querySelector('[data-hero-next]');
  const toggle = root.querySelector('[data-hero-toggle]');
  const counter = root.querySelector('[data-hero-count]');
  const live = root.querySelector('.hero-live');
  const header = root.querySelector('#site-navigation');
  const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
  const duration = 9000;
  const reasons = new Set();
  const pans = new Map();
  let index = 0;
  let elapsed = 0;
  let lastFrame = performance.now();
  let userPaused = false;
  let motionPaused = reducedMotion.matches;
  let interactionOverride = false;
  let pointerStart = null;
  let frameId;

  const hardPaused = () => ['hidden','outside','menu'].some(reason => reasons.has(reason));
  const isPaused = () => userPaused || motionPaused || hardPaused() || (!interactionOverride && (reasons.has('hover') || reasons.has('focus')));
  function syncPlayback() {
    const paused = isPaused();
    root.dataset.heroPaused = String(paused);
    root.dataset.heroPauseReasons = [...reasons].join(' ');
    root.dataset.heroUserPaused = String(userPaused);
    root.dataset.heroMotionPaused = String(motionPaused);
    toggle.setAttribute('aria-pressed', String(paused));
    const label = paused ? 'Reprendre le défilement du héros' : 'Mettre le défilement du héros en pause';
    toggle.setAttribute('aria-label', label);
    toggle.title = label;
    for (const animation of pans.values()) {
      if (paused) animation.pause(); else animation.play();
    }
  }
  function setReason(reason, active) {
    const hadReason = reasons.has(reason);
    if (active) reasons.add(reason); else reasons.delete(reason);
    if (hadReason !== active) syncPlayback();
  }
  function startPan(sceneIndex) {
    pans.get(sceneIndex)?.cancel();
    if (reducedMotion.matches) return;
    const image = scenes[sceneIndex].querySelector('img');
    if (!image) return;
    const animation = image.animate(
      [{transform:'scale(1.075)'},{transform:'scale(1)'}],
      {duration:duration+1500,easing:'linear',fill:'both'}
    );
    pans.set(sceneIndex, animation);
  }
  function select(sceneIndex, manual = false) {
    const target = (sceneIndex + scenes.length) % scenes.length;
    const old = index;
    index = target;
    elapsed = 0;
    root.style.setProperty('--hero-progress','0');
    root.dataset.heroSlide = String(index+1);
    scenes.forEach((scene,i) => {
      scene.classList.toggle('is-current', i===index);
      scene.classList.toggle('is-previous', i===old && i!==index);
      scene.setAttribute('aria-hidden', String(i!==index));
    });
    selectors.forEach((button,i) => button.setAttribute('aria-pressed',String(i===index)));
    counter.textContent = String(index+1).padStart(2,'0');
    startPan(index);
    if (manual) live.textContent = `Diapositive ${index+1} sur ${scenes.length} : ${scenes[index].dataset.caption}`;
    syncPlayback();
  }
  previous.addEventListener('click', () => select(index-1,true));
  next.addEventListener('click', () => select(index+1,true));
  selectors.forEach((button,i) => button.addEventListener('click', () => select(i,true)));
  toggle.addEventListener('click', () => {
    if (isPaused()) {
      userPaused = false;
      motionPaused = false;
      interactionOverride = true;
    } else {
      userPaused = true;
      interactionOverride = false;
    }
    syncPlayback();
  });
  root.addEventListener('pointerenter', event => {
    if (event.pointerType==='mouse') {
      interactionOverride = false;
      setReason('hover',true);
      syncPlayback();
    }
  });
  root.addEventListener('pointerleave', event => {
    if (event.pointerType==='mouse') {
      if (!root.contains(document.activeElement)) interactionOverride = false;
      setReason('hover',false);
      syncPlayback();
    }
  });
  root.addEventListener('focusin', () => setReason('focus',true));
  root.addEventListener('focusout', () => queueMicrotask(() => {
    const inside = root.contains(document.activeElement);
    if (!inside) interactionOverride = false;
    setReason('focus',inside);
  }));
  root.addEventListener('keydown', event => {
    if (header?.contains(event.target) || !event.target.closest('.hero-selector,.hero-carousel-controls')) return;
    if (event.key==='ArrowLeft' || event.key==='ArrowRight') {
      event.preventDefault();
      select(index+(event.key==='ArrowRight'?1:-1),true);
    }
  });
  root.addEventListener('pointerdown', event => {
    if (event.pointerType==='mouse' || event.target.closest('a,button,nav,header')) return;
    pointerStart = {x:event.clientX,y:event.clientY,id:event.pointerId};
  });
  root.addEventListener('pointerup', event => {
    if (!pointerStart || pointerStart.id!==event.pointerId) return;
    const dx = event.clientX-pointerStart.x;
    const dy = event.clientY-pointerStart.y;
    pointerStart = null;
    if (Math.abs(dx)>56 && Math.abs(dx)>Math.abs(dy)*1.3) select(index+(dx<0?1:-1),true);
  });
  root.addEventListener('pointercancel', () => {pointerStart=null;});
  document.addEventListener('visibilitychange', () => setReason('hidden',document.hidden));
  new IntersectionObserver(entries => {
    setReason('outside',entries[0].intersectionRatio<.25);
  },{threshold:[0,.25,1]}).observe(root);
  if (header) {
    new MutationObserver(() => setReason('menu',header.classList.contains('has-open-menu')))
      .observe(header,{attributes:true,attributeFilter:['class']});
  }
  reducedMotion.addEventListener('change', () => {
    motionPaused = reducedMotion.matches;
    for (const animation of pans.values()) animation.cancel();
    pans.clear();
    startPan(index);
    syncPlayback();
  });
  function frame(now) {
    const delta = Math.min(now-lastFrame,100);
    lastFrame = now;
    if (!isPaused()) {
      elapsed += delta;
      if (elapsed >= duration) select(index+1);
    }
    root.style.setProperty('--hero-progress',String(Math.min(elapsed/duration,1)));
    frameId = requestAnimationFrame(frame);
  }
  setReason('hidden',document.hidden);
  if (root.matches(':hover')) reasons.add('hover');
  select(0);
  frameId = requestAnimationFrame(frame);
  window.addEventListener('pagehide', () => {
    cancelAnimationFrame(frameId);
    frameId = null;
    for (const animation of pans.values()) animation.pause();
  });
  window.addEventListener('pageshow', () => {
    setReason('hidden',document.hidden);
    if (!frameId) {
      lastFrame = performance.now();
      frameId = requestAnimationFrame(frame);
    }
    syncPlayback();
  });
})();
