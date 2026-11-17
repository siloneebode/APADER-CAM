(() => {
  const page = document.querySelector('.actions-page');
  const header = document.querySelector('#site-navigation');
  const jump = document.querySelector('.action-jump');
  const links = [...document.querySelectorAll('.action-jump-links a')];
  const sections = links.map(link => document.querySelector(link.getAttribute('href'))).filter(Boolean);
  let current = '';
  let menuBottom = 82;
  let closedMenuHeight = 74;
  let anchorOffset = 160;
  let frame = 0;
  let measureRequested = true;
  let userInteracted = false;

  function setCurrent(id) {
    if (id === current) return;
    current = id;
    links.forEach(link => {
      if (link.getAttribute('href') === '#' + id) link.setAttribute('aria-current', 'location');
      else link.removeAttribute('aria-current');
    });
  }
  function syncScrollState() {
    if (!page) return false;
    const scrolled = window.scrollY > 8;
    const changed = page.classList.contains('action-nav-scrolled') !== scrolled;
    page.classList.toggle('action-nav-scrolled', scrolled);
    return changed;
  }
  function measure() {
    if (!header || !jump || !page) return;
    syncScrollState();
    const headerRect = header.getBoundingClientRect();
    // Un mégamenu ouvert ne déplace pas les onglets sous toute sa hauteur.
    if (!header.classList.contains('has-open-menu')) closedMenuHeight = headerRect.height;
    menuBottom = Math.round(headerRect.top + closedMenuHeight);
    anchorOffset = Math.ceil(menuBottom + jump.getBoundingClientRect().height - 1);
    page.style.setProperty('--action-menu-bottom', menuBottom + 'px');
    page.style.setProperty('--action-bar-width', headerRect.width + 'px');
    page.style.setProperty('--action-anchor-offset', anchorOffset + 'px');
  }
  function update() {
    frame = 0;
    if (!header || !jump || !page) return;
    if (syncScrollState()) measureRequested = true;
    if (measureRequested) { measure(); measureRequested = false; }
    const docked = jump.getBoundingClientRect().top <= menuBottom + 1 && !header.classList.contains('has-open-menu');
    page.classList.toggle('action-nav-docked', docked);
    let active = sections[0];
    for (const section of sections) {
      if (section.getBoundingClientRect().top <= anchorOffset + 4) active = section;
      else break;
    }
    if (active) setCurrent(active.id);
  }
  function schedule(needsMeasure = false) {
    measureRequested = measureRequested || needsMeasure;
    if (!frame) frame = requestAnimationFrame(update);
  }
  if (header && jump) {
    window.addEventListener('scroll', () => schedule(), {passive:true});
    window.addEventListener('resize', () => schedule(true));
    if ('ResizeObserver' in window) {
      const resize = new ResizeObserver(() => schedule(true));
      resize.observe(header); resize.observe(jump);
    }
    new MutationObserver(() => schedule(true)).observe(header, {attributes:true, attributeFilter:['class']});
    links.forEach(link => link.addEventListener('click', () => {
      measure(); setCurrent(link.hash.slice(1)); schedule();
    }));
    ['wheel','touchstart','pointerdown','keydown'].forEach(type => window.addEventListener(type, () => { userInteracted = true; }, {once:true,passive:true}));
    const loaded = document.readyState === 'complete' ? Promise.resolve() : new Promise(resolve => window.addEventListener('load', resolve, {once:true}));
    Promise.all([loaded, document.fonts ? document.fonts.ready : Promise.resolve()]).then(() => {
      measure();
      const target = sections.find(section => '#' + section.id === location.hash);
      if (target && !userInteracted) target.scrollIntoView({block:'start',behavior:'instant'});
      schedule(true);
    });
    schedule(true);
  } else if (header && page) {
    window.addEventListener('scroll', syncScrollState, {passive:true});
    window.addEventListener('resize', syncScrollState);
    syncScrollState();
  }
  document.querySelectorAll('a[href]').forEach(link => {
    const url = new URL(link.href, location.href);
    const available = url.origin === location.origin && (url.pathname === '/' || ['/notre-impact/','/nos-actions/','/nos-projets/','/ressources/','/actualites/','/opportunites/'].some(prefix => url.pathname.startsWith(prefix)) || ["/contact/","/a-propos/nos-partenaires/","/revue/","/mentions-legales/","/politique-de-confidentialite/","/politique-de-cookies/","/conditions-generales-d-utilisation/","/a-propos/qui-sommes-nous/","/a-propos/equipe/","/a-propos/gouvernance-et-organisation/","/a-propos/notre-histoire/","/a-propos/nos-structures-operationnelles/","/a-propos/nos-structures-operationnelles/ciefad/","/a-propos/nos-structures-operationnelles/espace-jeunes-du-nde/"].includes(url.pathname));
    if (!available || link.getAttribute('href') === '#') link.addEventListener('click', event => event.preventDefault());
  });
})();
