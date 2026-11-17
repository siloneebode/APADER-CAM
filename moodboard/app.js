(() => {
  'use strict';
  document.documentElement.classList.add('has-js');
  const root = document.documentElement;
  const reducePreference = window.matchMedia('(prefers-reduced-motion: reduce)');
  const motionSwitch = document.querySelector('#motion-switch');
  const motionLink = document.querySelector('#reduce-motion-link');
  let motionEnabled = !reducePreference.matches;
  let toastTimer;
  const toast = (message) => {
    const el = document.querySelector('#toast');
    clearTimeout(toastTimer);
    el.querySelector('span').textContent = message;
    el.classList.add('is-visible');
    toastTimer = setTimeout(() => el.classList.remove('is-visible'), 3300);
  };

  const applyMotion = () => {
    root.dataset.motion = motionEnabled ? 'on' : 'off';
    motionSwitch.setAttribute('aria-checked', String(motionEnabled));
    motionSwitch.setAttribute('aria-label', motionEnabled ? 'Désactiver les animations' : 'Activer les animations');
    motionLink.querySelector('span').textContent = motionEnabled ? 'Comparer sans animation' : 'Réactiver les animations';
  };
  motionSwitch.addEventListener('click', () => { motionEnabled = !motionEnabled; applyMotion(); });
  motionLink.addEventListener('click', () => { motionEnabled = !motionEnabled; applyMotion(); toast(motionEnabled ? 'Les animations sont activées.' : 'Les animations sont désactivées. Le contenu reste visible.'); });
  reducePreference.addEventListener('change', () => { motionEnabled = !reducePreference.matches; applyMotion(); });

  document.querySelectorAll('[data-copy]').forEach(button => {
    button.addEventListener('click', async () => {
      const value = button.dataset.copy;
      try { await navigator.clipboard.writeText(value); toast(`${value} copié dans le presse-papiers.`); }
      catch { toast(`Code couleur : ${value}`); }
    });
  });
  document.querySelectorAll('[data-demo-toast]').forEach(button => button.addEventListener('click', () => toast(button.dataset.demoToast)));

  document.querySelectorAll('[data-font]').forEach(button => {
    button.addEventListener('click', () => {
      document.querySelectorAll('[data-font]').forEach(peer => { const active = peer === button; peer.classList.toggle('is-active', active); peer.setAttribute('aria-pressed', String(active)); });
      const contemporary = button.dataset.font === 'contemporary';
      document.querySelector('[data-type-sample]').dataset.style = button.dataset.font;
      document.querySelector('#type-caption').textContent = contemporary ? 'IBM Plex Sans · Regular 400 · Textes et interface' : 'Fraunces · Regular 400 · Titres et citations';
    });
  });
  document.querySelectorAll('[data-radius]').forEach(button => button.addEventListener('click', () => {
    document.querySelector('#radius-preview').style.borderRadius = `${button.dataset.radius}px`;
    document.querySelector('#radius-current').textContent = `Arrondi affiché : ${button.dataset.radius} px.`;
    document.querySelectorAll('[data-radius]').forEach(peer => { const active = peer === button; peer.classList.toggle('is-active', active); peer.setAttribute('aria-pressed', String(active)); });
  }));

  const buttonDemoTargets = document.querySelectorAll('.button-showcase .button, .button-showcase .text-link, .button-showcase .icon-button');
  document.querySelector('[data-demo-buttons]').addEventListener('click', event => {
    const trigger = event.currentTarget;
    const active = trigger.getAttribute('aria-pressed') !== 'true';
    buttonDemoTargets.forEach(button => button.classList.toggle('is-demo-hover', active));
    trigger.querySelector('span').textContent = active ? 'Revenir au repos' : 'Simuler le survol';
    trigger.setAttribute('aria-pressed', String(active));
  });

  const animateKicker = element => {
    if (!motionEnabled) return;
    element.classList.remove('is-kicker-entering');
    // Restart before the next paint so the end-state square cannot flash first.
    void element.offsetWidth;
    element.classList.add('is-kicker-entering');
  };
  const kickerObserver = new IntersectionObserver(entries => entries.forEach(entry => {
    if (!entry.isIntersecting) return;
    animateKicker(entry.target);
    kickerObserver.unobserve(entry.target);
  }), {threshold: .6});
  document.querySelectorAll('[data-kicker-reveal]').forEach(element => kickerObserver.observe(element));
  document.querySelector('#replay-kicker').addEventListener('click', () => {
    if (!motionEnabled) { toast('Activez les animations pour rejouer l’entrée du sous-titre.'); return; }
    document.querySelectorAll('.kicker-examples [data-kicker-reveal]').forEach(animateKicker);
  });

  const examples = document.querySelector('#motion-examples');
  const playMotion = () => {
    if (!motionEnabled) { toast('Le mouvement est réduit. Activez les animations pour voir la démonstration.'); return; }
    examples.classList.remove('is-playing');
    void examples.offsetWidth;
    examples.classList.add('is-playing');
  };
  document.querySelector('#replay-motion').addEventListener('click', playMotion);
  document.querySelector('#motion-speed').addEventListener('change', event => { root.style.setProperty('--speed', event.target.value); playMotion(); });
  const revealObserver = new IntersectionObserver(entries => entries.forEach(entry => {
    if (entry.isIntersecting) { entry.target.classList.add('is-visible'); revealObserver.unobserve(entry.target); }
  }), { threshold: .12 });
  document.querySelectorAll('.reveal').forEach(el => revealObserver.observe(el));
  const motionObserver = new IntersectionObserver(entries => entries.forEach(entry => {
    if (entry.isIntersecting) { if (motionEnabled) playMotion(); motionObserver.unobserve(entry.target); }
  }), { threshold: .35 });
  motionObserver.observe(examples);

  document.querySelector('#sample-form').addEventListener('submit', event => {
    event.preventDefault();
    const input = document.querySelector('#sample-email'), feedback = document.querySelector('#field-feedback');
    const valid = input.validity.valid;
    input.setAttribute('aria-invalid', String(!valid));
    input.dataset.valid = String(valid);
    feedback.classList.toggle('is-error', !valid);
    feedback.classList.toggle('is-success', valid);
    feedback.textContent = valid ? 'Adresse e-mail valide. Aucune donnée n’a été envoyée.' : 'Indiquez une adresse e-mail valide, par exemple nom@exemple.org.';
    if (!valid) input.focus();
  });

  let frameRequested = false;
  const navHeader = document.querySelector('#apader-header');
  const contentsBar = document.querySelector('.moodboard-tools');
  const sectionLinks = [...document.querySelectorAll('.moodboard-index a')];
  const linkedSections = sectionLinks.map(link => document.querySelector(link.hash));
  let menuBottom = 96, contentOffset = 180, currentSection = '';

  function measureNavigation() {
    const headerRect = navHeader.getBoundingClientRect();
    const row = navHeader.querySelector('.header-row');
    // The expanded mobile menu must not move the section navigation.
    const rowHeight = window.innerWidth <= 1049
      ? parseFloat(getComputedStyle(row).minHeight) || 68
      : row.getBoundingClientRect().height;
    menuBottom = headerRect.top + rowHeight;
    root.style.setProperty('--moodboard-menu-bottom', `${menuBottom}px`);
    root.style.setProperty('--moodboard-bar-width', `${headerRect.width}px`);
    contentOffset = Math.ceil(menuBottom - 1 + contentsBar.getBoundingClientRect().height + 16);
    root.style.setProperty('--moodboard-content-offset', `${contentOffset}px`);
  }

  function updateNavigation() {
    const docked = contentsBar.getBoundingClientRect().top <= menuBottom;
    document.body.classList.toggle('moodboard-nav-docked', docked);
    let active = '';
    linkedSections.forEach(section => {
      if (section && section.getBoundingClientRect().top <= contentOffset + 4) active = section.id;
    });
    if (active === currentSection) return;
    currentSection = active;
    sectionLinks.forEach(link => {
      if (link.hash === `#${active}`) {
        link.setAttribute('aria-current', 'location');
        const index = link.parentElement;
        const left = link.offsetLeft - index.offsetLeft;
        if (left < index.scrollLeft || left + link.offsetWidth > index.scrollLeft + index.clientWidth) {
          index.scrollTo({left: Math.max(0, left - 12), behavior: 'auto'});
        }
      } else link.removeAttribute('aria-current');
    });
  }
  const navigationResize = new ResizeObserver(() => { measureNavigation(); onScroll(); });
  navigationResize.observe(navHeader);
  navigationResize.observe(contentsBar);
  window.addEventListener('resize', measureNavigation, {passive: true});
  sectionLinks.forEach(link => link.addEventListener('click', measureNavigation));
  measureNavigation();

  const reading = document.querySelector('.reading-progress>span');
  function onScroll() {
    if (frameRequested) return;
    frameRequested = true;
    requestAnimationFrame(() => {
      frameRequested = false;
      updateNavigation();
      reading.style.transform = `scaleX(${Math.min(1, Math.max(0, window.scrollY / Math.max(1, document.documentElement.scrollHeight - innerHeight)))})`;
    });
  }
  window.addEventListener('scroll', onScroll, {passive:true});
  document.fonts.ready.then(() => { measureNavigation(); onScroll(); });
  applyMotion();
  onScroll();
})();
