/* Home domains: card treatment chosen in the review panel (wireframe engine).
   ?vue-domaines=a (default) = blocs composés ; ?vue-domaines=b = cartes colorées. */
(() => {
  const root = document.querySelector('#domaines');
  if (!root) return;
  const params = new URLSearchParams(location.search);
  const choice = params.get('vue-domaines');
  const couleurs = choice === 'b' || (!choice && params.get('domaines') === 'couleurs');
  root.classList.toggle('domaines--couleurs', couleurs);
  root.classList.toggle('domaines--blocs', !couleurs);
})();

/* Home domains only: the cartouche and cards reveal once on viewport entry. */
(() => {
  const root = document.querySelector('#domaines');
  if (!root || root.dataset.domainsMotionReady === 'true'
      || matchMedia('(prefers-reduced-motion: reduce)').matches
      || typeof IntersectionObserver !== 'function') return;
  root.dataset.domainsMotionReady = 'true';

  const label = root.querySelector('.pangram-kicker.pangram-kicker--apader');
  if (label) {
    const labelObserver = new IntersectionObserver(entries => {
      if (!entries.some(entry => entry.isIntersecting)) return;
      label.classList.add('is-kicker-entering');
      labelObserver.disconnect();
    }, {threshold: .5});
    labelObserver.observe(label);
  }

  const cards = [...root.querySelectorAll('.revue-domain-card')];
  const grid = root.querySelector('.revue-domain-grid');
  const cardObserver = new IntersectionObserver(entries => {
    // Column count comes from the active layout (2 or 1 for A and B).
    const columns = Math.max(1, getComputedStyle(grid).gridTemplateColumns.split(' ').length);
    entries.forEach(entry => {
      if (!entry.isIntersecting || entry.intersectionRatio < .12) return;
      const card = entry.target;
      cardObserver.unobserve(card);
      if (card.contains(document.activeElement)) return;
      const index = cards.indexOf(card);
      const delay = (index % columns) * 90 + Math.floor(index / columns) * 60;
      card.style.setProperty('--domain-entry-delay', `${delay}ms`);
      card.classList.add('is-domain-entering');
    });
  }, {threshold: .12});

  cards.forEach(card => {
    cardObserver.observe(card);
    card.addEventListener('animationend', event => {
      if (event.animationName !== 'apader-domains-card-in') return;
      card.classList.remove('is-domain-entering');
      card.style.removeProperty('--domain-entry-delay');
    });
  });

  root.addEventListener('focusin', event => {
    const card = event.target.closest('.revue-domain-card');
    if (!card || !root.contains(card)) return;
    cardObserver.unobserve(card);
    card.classList.remove('is-domain-entering');
    card.style.removeProperty('--domain-entry-delay');
  });
})();
