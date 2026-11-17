(() => {
  const root = document.querySelector('#footer.apader-footer');
  if (!root) return;
  const groups = [...root.querySelectorAll('.af-group')];
  const mobile = window.matchMedia('(max-width:600px)');
  function updateGroups() {
    groups.forEach(group => {
      group.open = !mobile.matches;
      group.querySelector('summary').tabIndex = mobile.matches ? 0 : -1;
    });
  }
  groups.forEach(group => group.querySelector('summary').addEventListener('click', event => {
    if (!mobile.matches && !event.target.closest('a')) event.preventDefault();
  }));
  root.querySelectorAll('a').forEach(link => link.addEventListener('click', event => {
    const href = link.getAttribute('href') || '';
    if (href !== '/' && !href.startsWith('/actualites/') && !href.startsWith('/opportunites/') && !href.startsWith('/ressources/') && !href.startsWith('/nos-projets/') && !href.startsWith('/nos-actions/') && !href.startsWith('/notre-impact/') && !["/contact/","/a-propos/nos-partenaires/","/revue/","/mentions-legales/","/politique-de-confidentialite/","/politique-de-cookies/","/conditions-generales-d-utilisation/","/a-propos/qui-sommes-nous/","/a-propos/equipe/","/a-propos/gouvernance-et-organisation/","/a-propos/notre-histoire/","/a-propos/nos-structures-operationnelles/","/a-propos/nos-structures-operationnelles/ciefad/","/a-propos/nos-structures-operationnelles/espace-jeunes-du-nde/"].includes(href)) event.preventDefault();
  }));
  mobile.addEventListener('change', updateGroups);
  updateGroups();
})();
