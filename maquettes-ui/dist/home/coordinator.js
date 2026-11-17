(() => {
  'use strict';
  const root = document.querySelector('#presidente.president-letter');
  if (!root || root.dataset.letterReady === 'true') return;
  const dialog = root.querySelector('.letter-dialog');
  const triggers = [...root.querySelectorAll('[data-letter-open]')];
  if (!dialog || typeof dialog.showModal !== 'function') return;
  root.dataset.letterReady = 'true';
  let opener = null;
  let previousOverflow = null;

  const syncExpanded = (value) => triggers.forEach((trigger) => trigger.setAttribute('aria-expanded', String(value)));
  triggers.forEach((trigger) => trigger.addEventListener('click', () => {
    if (dialog.open) return;
    opener = trigger;
    previousOverflow = document.documentElement.style.overflow;
    dialog.showModal();
    document.documentElement.style.overflow = 'hidden';
    dialog.scrollTop = 0;
    syncExpanded(true);
  }));

  dialog.addEventListener('click', (event) => {
    if (event.target !== dialog) return;
    const bounds = dialog.getBoundingClientRect();
    const outside = event.clientX < bounds.left || event.clientX > bounds.right || event.clientY < bounds.top || event.clientY > bounds.bottom;
    if (outside) dialog.close();
  });

  dialog.addEventListener('close', () => {
    syncExpanded(false);
    if (previousOverflow !== null) document.documentElement.style.overflow = previousOverflow;
    previousOverflow = null;
    if (opener && opener.isConnected) opener.focus({ preventScroll: true });
  });
})();

/* The exact moodboard cartouche animates once on entry. */
(() => {
  const label = document.querySelector('#presidente .letter-kicker');
  if (!label || matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  const observer = new IntersectionObserver(entries => {
    if (!entries.some(entry => entry.isIntersecting)) return;
    label.classList.add('is-kicker-entering');
    observer.disconnect();
  }, {threshold:.5});
  observer.observe(label);
})();
