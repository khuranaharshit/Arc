/**
 * Local filesystem storage server for development/testing.
 * Reads/writes unencrypted JSON files to ./data/ directory.
 *
 * Usage: node dev-server.js
 * Runs on http://localhost:3001
 *
 * Endpoints:
 *   GET    /api/data           → list all keys
 *   GET    /api/data/:key      → read a key
 *   PUT    /api/data/:key      → write a key (body = JSON)
 *   DELETE /api/data/:key      → delete a key
 *   GET    /api/health         → health check
 */

import { createServer } from 'http';
import { readdir, readFile, writeFile, unlink, mkdir, access } from 'fs/promises';
import { join } from 'path';

const PORT = 3001;
const DATA_DIR = join(process.cwd(), 'data');

// Ensure data directory exists
await mkdir(DATA_DIR, { recursive: true });

function filePath(key) {
  // Sanitize key to prevent path traversal
  const safe = key.replace(/[^a-zA-Z0-9_-]/g, '');
  return join(DATA_DIR, `${safe}.json`);
}

async function fileExists(path) {
  try { await access(path); return true; } catch { return false; }
}

function cors(res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
}

function json(res, status, data) {
  cors(res);
  res.writeHead(status, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify(data));
}

function readBody(req) {
  return new Promise((resolve, reject) => {
    let body = '';
    req.on('data', (chunk) => { body += chunk; });
    req.on('end', () => {
      try { resolve(JSON.parse(body)); }
      catch { reject(new Error('Invalid JSON body')); }
    });
    req.on('error', reject);
  });
}

const server = createServer(async (req, res) => {
  const url = new URL(req.url, `http://localhost:${PORT}`);
  const path = url.pathname;

  // CORS preflight
  if (req.method === 'OPTIONS') {
    cors(res);
    res.writeHead(204);
    res.end();
    return;
  }

  try {
    // Health check
    if (path === '/api/health') {
      return json(res, 200, { status: 'ok', data_dir: DATA_DIR });
    }

    // List all keys
    if (path === '/api/data' && req.method === 'GET') {
      const files = await readdir(DATA_DIR).catch(() => []);
      const keys = files
        .filter((f) => f.endsWith('.json'))
        .map((f) => f.replace('.json', ''));
      return json(res, 200, { keys });
    }

    // Match /api/data/:key
    const match = path.match(/^\/api\/data\/([a-zA-Z0-9_-]+)$/);
    if (!match) {
      return json(res, 404, { error: 'Not found' });
    }

    const key = match[1];
    const fp = filePath(key);

    // GET — read
    if (req.method === 'GET') {
      if (!(await fileExists(fp))) {
        return json(res, 404, { error: 'Key not found', key });
      }
      const content = await readFile(fp, 'utf-8');
      const data = JSON.parse(content);
      return json(res, 200, { key, data });
    }

    // PUT — write
    if (req.method === 'PUT') {
      const body = await readBody(req);
      await writeFile(fp, JSON.stringify(body, null, 2), 'utf-8');
      console.log(`[write] ${key}`);
      return json(res, 200, { key, status: 'written' });
    }

    // DELETE — delete
    if (req.method === 'DELETE') {
      if (await fileExists(fp)) {
        await unlink(fp);
        console.log(`[delete] ${key}`);
      }
      return json(res, 200, { key, status: 'deleted' });
    }

    return json(res, 405, { error: 'Method not allowed' });

  } catch (err) {
    console.error('Server error:', err);
    return json(res, 500, { error: err.message });
  }
});

server.listen(PORT, () => {
  console.log(`Arc dev storage server running at http://localhost:${PORT}`);
  console.log(`Data directory: ${DATA_DIR}`);
  console.log(`Endpoints:`);
  console.log(`  GET    /api/data           — list all keys`);
  console.log(`  GET    /api/data/:key      — read a key`);
  console.log(`  PUT    /api/data/:key      — write a key`);
  console.log(`  DELETE /api/data/:key      — delete a key`);
});
