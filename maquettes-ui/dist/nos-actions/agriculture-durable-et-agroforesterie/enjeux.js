(() => {
  const section = document.querySelector('#enjeux.agriculture-enjeux');
  if (!section || !('IntersectionObserver' in window) ||
      matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  const observer = new IntersectionObserver(entries => {
    for (const entry of entries) {
      if (!entry.isIntersecting) continue;
      const element = entry.target;
      const isLabel = element.classList.contains('pangram-kicker');
      element.classList.add(isLabel ? 'is-kicker-entering' : 'enjeux-entering');
      observer.unobserve(element);
    }
  });
  section.querySelectorAll('.pangram-kicker, h2, .enjeux-columns > div')
    .forEach(element => observer.observe(element));
})();
