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
  const cardObserver = new IntersectionObserver(entries => {
    const columns = matchMedia('(max-width:700px)').matches ? 1 : 2;
    entries.forEach(entry => {
      if (!entry.isIntersecting || entry.intersectionRatio < .12) return;
      const card = entry.target;
      cardObserver.unobserve(card);
      if (card.contains(document.activeElement)) return;
      const row = Math.floor(cards.indexOf(card) / columns);
      card.style.setProperty('--domain-entry-delay', `${row * 80}ms`);
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
