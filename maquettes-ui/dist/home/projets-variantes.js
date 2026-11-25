/* Accueil — Projets, version C « Trois cartes visibles » (?vue-projets=c).
   Demande APADER (revue du 26 octobre) : comparer le carrousel à trois cartes
   visibles. Chargé après le carrousel : rend les trois projets accessibles
   et neutralise sa navigation au clavier. */
(() => {
  const root = document.querySelector('#projets');
  if (!root || new URLSearchParams(location.search).get('vue-projets') !== 'c') return;
  const win = root.querySelector('.project-window');
  const strip = root.querySelector('.project-strip');
  if (win) {
    ['tabindex', 'role', 'aria-label'].forEach(name => win.removeAttribute(name));
    win.addEventListener('keydown', event => {
      if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') event.stopPropagation();
    }, true);
  }
  strip?.style.removeProperty('--project-index');
  root.querySelectorAll('.project-slide').forEach(slide => {
    slide.inert = false;
    ['aria-hidden', 'aria-roledescription', 'aria-label'].forEach(name => slide.removeAttribute(name));
  });
})();
