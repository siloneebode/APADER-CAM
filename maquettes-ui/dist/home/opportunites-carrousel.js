/* Accueil — Opportunités, modèle C « Carrousel » (?vue-opportunites=c).
   Chargé après le moteur de revue : agit seulement si la version C est affichée.
   Flèches, clavier, compteur et barre de progression ; défilement natif au doigt. */
(() => {
  const root = document.querySelector('#opportunites');
  if (!root || root.dataset.apReviewVariant !== 'c') return;
  const list = root.querySelector('.opportunity-list');
  const cards = [...list.querySelectorAll('.opportunity-row')];
  const prev = root.querySelector('.opportunity-nav-prev');
  const next = root.querySelector('.opportunity-nav-next');
  const counter = root.querySelector('.opportunity-counter');
  const fill = root.querySelector('.opportunity-progress > span');
  if (!list || cards.length < 2 || !prev || !next) return;

  list.setAttribute('role', 'region');
  list.setAttribute('aria-label', 'Carrousel de ' + cards.length + ' opportunités, flèches gauche et droite pour naviguer');
  list.tabIndex = 0;

  const step = () => cards[1].getBoundingClientRect().left - cards[0].getBoundingClientRect().left;
  const go = direction => list.scrollBy({ left: direction * step() });

  prev.addEventListener('click', () => go(-1));
  next.addEventListener('click', () => go(1));
  list.addEventListener('keydown', event => {
    if (event.target !== list) return;
    if (event.key === 'ArrowRight') { event.preventDefault(); go(1); }
    if (event.key === 'ArrowLeft') { event.preventDefault(); go(-1); }
  });

  let frame = 0;
  function update() {
    frame = 0;
    const max = list.scrollWidth - list.clientWidth;
    const x = list.scrollLeft;
    prev.disabled = x <= 2;
    next.disabled = x >= max - 2;

    const box = list.getBoundingClientRect();
    const visible = cards
      .map((card, index) => {
        const r = card.getBoundingClientRect();
        return r.left >= box.left - 2 && r.right <= box.right + 2 ? index + 1 : 0;
      })
      .filter(Boolean);
    const first = visible[0] || 1;
    const last = visible[visible.length - 1] || first;
    const text = first === last
      ? 'Opportunité ' + first + ' sur ' + cards.length
      : 'Opportunités ' + first + ' à ' + last + ' sur ' + cards.length;
    if (counter && counter.textContent !== text) counter.textContent = text;

    if (fill) {
      const ratio = Math.min(1, list.clientWidth / list.scrollWidth);
      fill.style.width = (ratio * 100) + '%';
      fill.style.transform = 'translateX(' + (max > 0 ? (x / max) * (1 / ratio - 1) * 100 : 0) + '%)';
    }
  }
  const schedule = () => { if (!frame) frame = requestAnimationFrame(update); };
  list.addEventListener('scroll', schedule, { passive: true });
  window.addEventListener('resize', schedule, { passive: true });
  schedule();
})();
