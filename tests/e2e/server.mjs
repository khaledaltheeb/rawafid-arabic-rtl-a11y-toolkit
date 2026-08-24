import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';
import { resolve } from 'node:path';

const root = resolve(process.cwd());
const port = Number(process.env.PORT ?? 4173);
const routes = new Map([
  ['/', ['tests/e2e/fixture.html', 'text/html; charset=utf-8']],
  ['/dist/index.js', ['dist/index.js', 'text/javascript; charset=utf-8']],
  ['/styles/a11y.css', ['styles/a11y.css', 'text/css; charset=utf-8']],
  ['/styles/logical.css', ['styles/logical.css', 'text/css; charset=utf-8']],
]);

const server = createServer(async (request, response) => {
  try {
    const url = new URL(request.url ?? '/', `http://${request.headers.host ?? '127.0.0.1'}`);
    const route = routes.get(url.pathname);
    if (!route) {
      response.writeHead(404, { 'content-type': 'text/plain; charset=utf-8' });
      response.end('Not found');
      return;
    }
    const [path, contentType] = route;
    const content = await readFile(resolve(root, path));
    response.writeHead(200, {
      'content-type': contentType,
      'cache-control': 'no-store',
      'x-content-type-options': 'nosniff',
    });
    response.end(content);
  } catch (error) {
    response.writeHead(500, { 'content-type': 'text/plain; charset=utf-8' });
    response.end(error instanceof Error ? error.message : 'Internal error');
  }
});

server.listen(port, '127.0.0.1', () => {
  console.log(`RTL test fixture listening on http://127.0.0.1:${port}`);
});

for (const signal of ['SIGINT', 'SIGTERM']) {
  process.on(signal, () => server.close(() => process.exit(0)));
}
