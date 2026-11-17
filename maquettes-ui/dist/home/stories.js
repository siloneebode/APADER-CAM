/* Revue client : les récits s’ouvrent par leurs liens de lecture. */
(() => {
  const root = document.querySelector('#impact #recits-impact');
  if (!root) return;

  const cards = [...root.querySelectorAll('.impact-story')];
  const dots = [...root.querySelectorAll('.story-dot')];
  const positions = ['current', 'near-right', 'near-left'];
  const stage = root.querySelector('.carousel-stage');
  const live = root.querySelector('#story-live');
  let current = 0;
  if (!cards.length) return;

  let heightFrame = 0;
  function syncStageHeight() {
    heightFrame = 0;
    if (!stage) return;
    if (window.matchMedia('(max-width:700px)').matches) {
      stage.style.height = Math.ceil(cards[current].getBoundingClientRect().height + 24) + 'px';
    } else {
      stage.style.removeProperty('height');
    }
  }
  function scheduleHeight() {
    if (!heightFrame) heightFrame = requestAnimationFrame(syncStageHeight);
  }

  function select(index) {
    if (!Number.isFinite(index)) return;
    const moveFocus = cards.some(card => card.contains(document.activeElement));
    current = ((Math.trunc(index) % cards.length) + cards.length) % cards.length;

    cards.forEach((card, i) => {
      const offset = (i - current + cards.length) % cards.length;
      card.classList.remove(...positions);
      card.classList.add(positions[offset] || 'far-right');
      card.classList.toggle('peek', offset !== 0);

      const link = card.querySelector('.story-read-link');
      const peek = card.querySelector('.peek-target');
      if (link) link.tabIndex = offset ? -1 : 0;
      if (peek) {
        peek.tabIndex = offset ? 0 : -1;
        peek.setAttribute('aria-hidden', String(offset === 0));
      }
    });

    dots.forEach((dot, i) => dot.setAttribute('aria-pressed', String(i === current)));
    if (live) live.textContent = 'Récit ' + (current + 1) + ' sur ' + cards.length;
    scheduleHeight();
    if (moveFocus) {
      cards[current].querySelector('.story-read-link')?.focus({ preventScroll: true });
    }
  }

  dots.forEach((dot, i) => dot.addEventListener('click', () => select(i)));
  root.querySelectorAll('[data-select]').forEach(button => {
    button.addEventListener('click', () => select(Number(button.dataset.select)));
  });
  stage?.addEventListener('keydown', event => {
    if (!['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(event.key)) return;
    event.preventDefault();
    select(event.key === 'Home' ? 0 : event.key === 'End' ? cards.length - 1 : current + (event.key === 'ArrowRight' ? 1 : -1));
  });

  window.addEventListener('resize', scheduleHeight, { passive: true });
  if ('ResizeObserver' in window) {
    const heightObserver = new ResizeObserver(scheduleHeight);
    cards.forEach(card => heightObserver.observe(card));
  }
  if (document.fonts) document.fonts.ready.then(scheduleHeight);
  select(0);
})();
