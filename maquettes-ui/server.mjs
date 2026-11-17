import { createServer } from 'node:http';
import { readFile, stat } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const directory = path.dirname(fileURLToPath(import.meta.url));
const roots = [
  path.join(directory, 'dist'),
  path.resolve(directory, '../wireframe'),
];
const types = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.png': 'image/png',
  '.webp': 'image/webp',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
  '.pdf': 'application/pdf',
};

async function findFile(urlPath) {
  for (const root of roots) {
    const base = path.resolve(root, `.${urlPath}`);
    if (base !== root && !base.startsWith(`${root}${path.sep}`)) continue;
    for (const candidate of [base, path.join(base, 'index.html'), `${base}.html`]) {
      const information = await stat(candidate).catch(() => null);
      if (information?.isFile()) return candidate;
    }
  }
  return null;
}

const server = createServer(async (request, response) => {
  try {
    if (request.method !== 'GET' && request.method !== 'HEAD') {
      response.writeHead(405, { Allow: 'GET, HEAD' }).end();
      return;
    }
    const pathname = decodeURIComponent(new URL(request.url, 'http://localhost').pathname);
    const file = await findFile(pathname);
    if (!file) {
      response.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
      response.end('Cette page ne figure pas encore dans l’aperçu local.');
      return;
    }
    const content = await readFile(file);
    response.writeHead(200, {
      'Content-Type': types[path.extname(file)] ?? 'application/octet-stream',
      'Content-Length': content.length,
      'Cache-Control': 'no-store',
      'X-Content-Type-Options': 'nosniff',
    });
    response.end(request.method === 'HEAD' ? undefined : content);
  } catch {
    response.writeHead(400, { 'Content-Type': 'text/plain; charset=utf-8' });
    response.end('La page demandée ne peut pas être affichée.');
  }
});

server.listen(8794, '127.0.0.1', () => {
  console.log('Maquettes APADER disponibles sur http://127.0.0.1:8794');
});
