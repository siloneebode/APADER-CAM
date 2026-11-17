/* The presentation's official cartouche enters once, when it becomes visible. */
(() => {
  const label = document.querySelector('#presentation .about-eyebrow');
  if (!label || matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  const observer = new IntersectionObserver(entries => {
    if (!entries.some(entry => entry.isIntersecting)) return;
    label.classList.add('is-kicker-entering');
    observer.disconnect();
  }, {threshold: .5});
  observer.observe(label);
})();
