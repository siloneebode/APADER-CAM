/* Entrance motion for the home page; existing carousels and labels stay intact. */
(() => {
  const body = document.querySelector('body.content-home');
  const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
  if (!body || body.classList.contains('home-motion-ready')
      || reducedMotion.matches || typeof IntersectionObserver !== 'function') return;
  body.classList.add('home-motion-ready');

  const targets = new Map();
  function register(selector, mode = 'rise', initialDelay = 0, eager = false) {
    [...body.querySelectorAll(selector)].forEach((element, index) => {
      targets.set(element, {
        mode,
        delay:initialDelay + Math.min(index, 3) * 80,
        eager,
        entered:false
      });
    });
  }

  register('#apader-header', 'fade', 0, true);
  register('#contenu #introduction .hero-editorial');
  // These labels already have their own entrance: target their siblings only.
  register('#contenu #presentation .about-title, #contenu #presentation .about-body, #contenu #presentation .about-media');
  register('#contenu #presentation .about-facts > div');
  register('#contenu #presidente .letter-intro > h2');
  register('#contenu #presidente .letter-open, #contenu #presidente .letter-preview', 'fade', 80);
  register('#contenu #domaines #actions-heading');
  register('#contenu #structures .section-heading');
  register('#contenu #structures .editorial-card');
  register('#contenu #projets .section-heading');
  register('#contenu #projets .project-window', 'fade');
  register('#contenu #projets .project-controls');
  register('#contenu #impact .stats-heading');
  register('#contenu #impact .teachers-grid > .stat-card, #contenu #impact .teachers-grid > .stats-context');
  register('#contenu #impact .story-heading');
  register('#contenu #impact .carousel-stage', 'fade');
  register('#contenu #impact .story-pagination', 'fade');
  register('#contenu #ressources .resources-heading');
  register('#contenu #ressources .document-grid > li');
  register('#contenu #actualites .editorial-heading');
  register('#contenu #actualites .editorial-grid > .editorial-card');
  register('#contenu #opportunites .opportunity-heading');
  register('#contenu #opportunites .opportunity-row');
  register('#contenu #opportunites .opportunity-footer');
  register('#contenu #partenaires .partner-heading');
  register('#contenu #partenaires .partner-logos');
  register('#contenu #partenaires .partner-link', 'fade');
  register('#contenu #contact .contact-copy');
  register('#footer', 'fade');

  function finish(element) {
    const state = targets.get(element);
    if (!state) return;
    state.entered = true;
    observer.unobserve(element);
    element.classList.remove('home-motion-entering', 'home-motion-fade');
    element.style.removeProperty('--home-motion-delay');
  }

  function enter(element) {
    const state = targets.get(element);
    if (!state || state.entered) return;
    if (reducedMotion.matches || element.contains(document.activeElement)) {
      finish(element);
      return;
    }
    state.entered = true;
    observer.unobserve(element);
    element.style.setProperty('--home-motion-delay', `${state.delay}ms`);
    if (state.mode === 'fade') element.classList.add('home-motion-fade');
    element.classList.add('home-motion-entering');
  }

  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting && entry.intersectionRatio >= .12) enter(entry.target);
    });
  }, {threshold:.12});

  targets.forEach((state, element) => {
    if (state.eager) enter(element);
    else observer.observe(element);
  });

  body.addEventListener('animationend', event => {
    if (event.animationName === 'apader-home-rise-in'
        || event.animationName === 'apader-home-fade-in') finish(event.target);
  });

  body.addEventListener('focusin', event => {
    for (let element = event.target; element && element !== body; element = element.parentElement) {
      if (targets.has(element)) finish(element);
    }
  });

  reducedMotion.addEventListener('change', event => {
    if (!event.matches) return;
    observer.disconnect();
    targets.forEach((state, element) => finish(element));
  });
})();
