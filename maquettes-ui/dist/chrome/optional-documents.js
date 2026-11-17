(() => {
  const linksByDocument = new Map();

  for (const link of document.querySelectorAll('a[href^="/documents/"]')) {
    const url = new URL(link.href);
    if (!url.pathname.endsWith('.pdf')) continue;

    const links = linksByDocument.get(url.href) ?? [];
    links.push(link);
    linksByDocument.set(url.href, links);
  }

  function showUnavailable(links) {
    for (const link of links) {
      link.removeAttribute('href');
      link.removeAttribute('download');
      link.setAttribute('aria-disabled', 'true');
      link.append(' (PDF indisponible dans cet aperçu)');
    }
  }

  for (const [url, links] of linksByDocument) {
    fetch(url, { method: 'HEAD' })
      .then(response => {
        const contentType = response.headers.get('Content-Type');
        if (!response.ok || !contentType?.startsWith('application/pdf')) {
          showUnavailable(links);
        }
      })
      .catch(() => showUnavailable(links));
  }
})();
