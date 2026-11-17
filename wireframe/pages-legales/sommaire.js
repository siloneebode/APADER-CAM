(() => {
  const toc = document.querySelector('.legal-toc');
  if (!toc) return;
  const entries = [...toc.querySelectorAll('a[href^="#"]')].map(link => ({
    link,
    section: document.getElementById(link.getAttribute('href').slice(1))
  })).filter(entry => entry.section);
  if (!entries.length) return;

  let activeLink;
  let pending = false;
  function update() {
    pending = false;
    const readingLine = parseFloat(getComputedStyle(entries[0].section).scrollMarginTop) || 120;
    let active = entries[0];
    for (const entry of entries) {
      if (entry.section.getBoundingClientRect().top <= readingLine + 1) active = entry;
      else break;
    }
    if (active.link === activeLink) return;
    entries.forEach(({ link }) => {
      if (link === active.link) link.setAttribute('aria-current', 'location');
      else link.removeAttribute('aria-current');
    });
    activeLink = active.link;
  }
  function schedule() {
    if (pending) return;
    pending = true;
    requestAnimationFrame(update);
  }
  window.addEventListener('scroll', schedule, { passive: true });
  window.addEventListener('resize', schedule);
  window.addEventListener('hashchange', schedule);
  window.addEventListener('pageshow', schedule);
  window.addEventListener('load', schedule);
  if (document.fonts) document.fonts.ready.then(schedule);
  schedule();
})();
