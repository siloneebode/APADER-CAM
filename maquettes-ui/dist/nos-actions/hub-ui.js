/* Entrance motion for the general actions page, without changing navigation. */
(() => {
  const main = document.querySelector('body.actions-hub-ui #contenu');
  const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
  if (!main || main.classList.contains('actions-hub-motion-ready')
      || reducedMotion.matches || typeof IntersectionObserver !== 'function') return;
  main.classList.add('actions-hub-motion-ready');

  const label = main.querySelector('.action-hub-intro .pangram-kicker--apader');
  let labelObserver;
  if (label) {
    labelObserver = new IntersectionObserver(entries => {
      if (!entries.some(entry => entry.isIntersecting)) return;
      label.classList.add('is-kicker-entering');
      labelObserver.disconnect();
    }, {threshold:.5});
    labelObserver.observe(label);
  }

  const targets = new Map();
  [...main.querySelectorAll('.action-hub-intro h1, .action-hub-intro > .wrap > p:not(.eyebrow):not(.pangram-kicker)')]
    .forEach((element, index) => targets.set(element, {entered:false, delay:() => index * 80}));
  [...main.querySelectorAll('.action-hub-grid .action-domain-card')]
    .forEach((element, index) => targets.set(element, {
      entered:false,
      delay:() => Math.floor(index / (matchMedia('(max-width:700px)').matches ? 1 : 2)) * 80
    }));

  function finish(element) {
    const state = targets.get(element);
    if (!state) return;
    state.entered = true;
    observer.unobserve(element);
    element.classList.remove('actions-hub-entering');
    element.style.removeProperty('--actions-hub-delay');
  }

  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (!entry.isIntersecting || entry.intersectionRatio < .12) return;
      const element = entry.target;
      const state = targets.get(element);
      if (!state || state.entered) return;
      if (reducedMotion.matches || element.contains(document.activeElement)) {
        finish(element);
        return;
      }
      state.entered = true;
      observer.unobserve(element);
      element.style.setProperty('--actions-hub-delay', `${state.delay()}ms`);
      element.classList.add('actions-hub-entering');
    });
  }, {threshold:.12});
  targets.forEach((state, element) => observer.observe(element));

  main.addEventListener('animationend', event => {
    if (event.animationName === 'apader-actions-hub-in') finish(event.target);
  });
  main.addEventListener('focusin', event => {
    for (let element = event.target; element && element !== main; element = element.parentElement) {
      if (targets.has(element)) finish(element);
    }
  });
  reducedMotion.addEventListener('change', event => {
    if (!event.matches) return;
    observer.disconnect();
    targets.forEach((state, element) => finish(element));
    if (labelObserver) labelObserver.disconnect();
    if (label) label.classList.remove('is-kicker-entering');
  });
})();
