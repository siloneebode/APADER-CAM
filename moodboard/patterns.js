(() => {
  'use strict';
  const root = document.querySelector('#motifs');
  if (!root) return;
  const patterns = {
    angles: {name: 'A · Angles du wireframe', file: 'angles.svg', quote: 'angles-mot.svg', footer: 'angles-footer.svg'},
    halo: {name: 'E · Halo', file: 'halo.svg'},
    faisceaux: {name: 'F · Faisceaux', file: 'faisceaux.svg'},
    filament: {name: 'G · Filament', file: 'filament.svg'}
  };
  const initial = new URLSearchParams(location.search);
  const acceptedInitialPattern = Object.keys(patterns).includes(initial.get('motif'));
  let selectedPattern = acceptedInitialPattern ? initial.get('motif') : 'halo';
  let selectedFooterTreatment = ['compact','ouvert','frise'].includes(initial.get('footer')) ? initial.get('footer') : 'ouvert';
  const updateAddress = anchor => {
    const url = new URL(location.href);
    url.searchParams.set('motif', selectedPattern);
    url.searchParams.set('footer', selectedFooterTreatment);
    url.searchParams.delete('couleur');
    if (anchor) url.hash = anchor;
    history.replaceState(null, '', url);
  };

  const applyPattern = preview => {
    preview.dataset.pattern = selectedPattern;
    if (preview.id === 'footer') preview.dataset.pansColour = 'ivoire';
    else delete preview.dataset.pansColour;
    const pattern = patterns[selectedPattern];
    preview.querySelectorAll('.pattern-art').forEach(image => {
      image.src = `assets/patterns/${pattern[preview.dataset.patternPreview] || pattern.file}`;
    });
  };
  const render = () => {
    const pattern = patterns[selectedPattern];
    root.querySelectorAll('[data-select-pattern]').forEach(peer => {
      const active = peer.dataset.selectPattern === selectedPattern;
      if (!peer.hasAttribute('data-show-pattern-footer')) peer.setAttribute('aria-pressed', String(active));
      const caption = peer.querySelector('.pattern-option-state');
      if (caption) caption.textContent = active ? 'Affiché' : 'Voir en situation ↗';
    });
    root.querySelectorAll('[data-pattern-preview]:not([data-fixed-pattern])').forEach(applyPattern);
    const footer = document.querySelector('#footer[data-pattern-preview]');
    if (footer) {
      applyPattern(footer);
      footer.dataset.footerTreatment = selectedFooterTreatment;
    }
    document.querySelectorAll('[data-footer-treatment-select]').forEach(peer => {
      peer.setAttribute('aria-pressed', String(peer.dataset.footerTreatmentSelect === selectedFooterTreatment));
    });
    const footerSelect = document.querySelector('#footer-pattern-select');
    if (footerSelect) footerSelect.value = selectedPattern;
    const footerName = document.querySelector('#footer-current-pattern');
    if (footerName) footerName.textContent = pattern.name;
    const currentPattern = root.querySelector('#pattern-current');
    if (currentPattern) currentPattern.textContent = pattern.name;
  };
  root.querySelectorAll('[data-select-pattern]').forEach(button => {
    button.addEventListener('click', () => {
      const key = button.dataset.selectPattern;
      if (!patterns[key]) return;
      selectedPattern = key;
      render();
      const showFooter = button.hasAttribute('data-show-pattern-footer');
      updateAddress(showFooter ? 'comparaison-footer' : 'motifs-en-situation');
      if (showFooter) {
        document.querySelector('#comparaison-footer')?.scrollIntoView({
          block: 'start',
          behavior: document.documentElement.dataset.motion === 'on' ? 'smooth' : 'auto'
        });
      } else if (button.hasAttribute('data-jump-to-pattern')) {
        root.querySelector('#motifs-en-situation')?.scrollIntoView({
          block: 'start',
          behavior: document.documentElement.dataset.motion === 'on' ? 'smooth' : 'auto'
        });
      }
    });
  });
  document.querySelectorAll('[data-footer-treatment-select]').forEach(button => {
    button.addEventListener('click', () => {
      selectedFooterTreatment = button.dataset.footerTreatmentSelect;
      render();
      updateAddress('comparaison-footer');
      if (button.hasAttribute('data-jump-to-footer')) {
        document.querySelector('#comparaison-footer').scrollIntoView({
          block: 'start', behavior: document.documentElement.dataset.motion === 'on' ? 'smooth' : 'auto'
        });
      }
    });
  });
  document.querySelector('#footer-pattern-select')?.addEventListener('change', event => {
    if (!patterns[event.target.value]) return;
    selectedPattern = event.target.value;
    render();
    updateAddress('comparaison-footer');
  });
  render();
  // Old review links resolve to a motif in the selected family.
  if ((initial.has('motif') && !acceptedInitialPattern) || initial.has('couleur')) updateAddress();
})();
