/** Serve the production demo locally, without installing a server dependency. */
import { createServer } from 'node:http';
import { createReadStream } from 'node:fs';
import { access, stat } from 'node:fs/promises';
import { resolve, join, sep, extname } from 'node:path';

const root = resolve('dist/sq-ui/browser');
await access(join(root, 'index.html'));
const port = Number(process.env.STYLE_PREVIEW_PORT || 4201);
const types = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.json': 'application/json', '.svg': 'image/svg+xml', '.png': 'image/png', '.ico': 'image/x-icon', '.woff2': 'font/woff2', '.woff': 'font/woff', '.ttf': 'font/ttf' };

const server = createServer(async (request, response) => {
  if (!['GET', 'HEAD'].includes(request.method)) { response.writeHead(405).end(); return; }
  let pathname;
  try { pathname = decodeURIComponent(new URL(request.url, 'http://localhost').pathname); }
  catch { response.writeHead(400).end(); return; }
  const file = resolve(root, '.' + (pathname === '/' ? '/index.html' : pathname));
  if (!file.startsWith(root + sep)) { response.writeHead(403).end(); return; }
  try {
    if (!(await stat(file)).isFile()) { response.writeHead(404).end(); return; }
    response.writeHead(200, { 'Content-Type': types[extname(file)] || 'application/octet-stream', 'Cache-Control': 'no-store' });
    if (request.method === 'HEAD') response.end();
    else createReadStream(file).on('error', () => response.destroy()).pipe(response);
  } catch { response.writeHead(404).end(); }
});

server.listen(port, '127.0.0.1', () => console.log(`Built preview: http://127.0.0.1:${port}/#/preview`));
