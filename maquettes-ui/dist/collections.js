(() => {
  'use strict';

  const labels = document.querySelectorAll('.apader-kicker');
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  if (!reducedMotion.matches && 'IntersectionObserver' in window) {
    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-entering');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: .3 });
    labels.forEach(label => observer.observe(label));
  }

  let feedback;
  let dismissFeedback;
  document.querySelector('main').addEventListener('click', event => {
    const link = event.target.closest('a[aria-disabled="true"], a[data-disabled], a[href="#"]');
    if (!link) return;
    event.preventDefault();
    if (!feedback) {
      feedback = document.createElement('p');
      feedback.className = 'ui-feedback';
      feedback.setAttribute('role', 'status');
      document.body.append(feedback);
    }
    feedback.textContent = 'Le contenu associé sera disponible après transmission par l’APADER.';
    feedback.hidden = false;
    clearTimeout(dismissFeedback);
    dismissFeedback = setTimeout(() => { feedback.hidden = true; }, 5000);
  });
})();
