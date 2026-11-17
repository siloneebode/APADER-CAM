(() => {
  const requestedNumber = new URLSearchParams(location.search).get('n');
  const number = /^0[1-8]$/.test(requestedNumber || '') ? requestedNumber : '01';
  const params = new URLSearchParams(location.search);
  params.set('n', number);
  const paths = {
    a: '/nos-projets/apercu-habille/',
    b: '/nos-projets/apercu-habille/presentation-b.html'
  };
  document.querySelectorAll('[data-project-presentation-other]').forEach(link => {
    const path = paths[link.dataset.projectPresentationOther];
    if (path) link.href = `${path}?${params.toString()}#presentation`;
  });
})();
