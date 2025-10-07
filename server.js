const http = require('node:http');
const fs = require('node:fs');
const path = require('node:path');
const { loadEnv } = require('./lib/env');
const { getPaymentsConfig, createMockSession } = require('./lib/payments');

loadEnv();

const PORT = process.env.PORT || 3000;
const ROOT_DIR = __dirname;

const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.svg': 'image/svg+xml; charset=utf-8'
};

const jsonHeaders = {
  'Content-Type': 'application/json; charset=utf-8',
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET,POST,OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type'
};

function sendJson(res, status, payload) {
  res.writeHead(status, jsonHeaders);
  res.end(JSON.stringify(payload));
}

function handleOptions(req, res, cleanedUrl) {
  if (cleanedUrl.startsWith('/api/payments')) {
    res.writeHead(204, jsonHeaders);
    res.end();
    return true;
  }
  return false;
}

function collectRequestBody(req) {
  return new Promise((resolve, reject) => {
    const chunks = [];

    req
      .on('data', (chunk) => {
        chunks.push(chunk);
      })
      .on('end', () => {
        const raw = Buffer.concat(chunks).toString('utf-8');
        if (!raw) {
          resolve({});
          return;
        }
        try {
          resolve(JSON.parse(raw));
        } catch (error) {
          reject(new Error('Некорректный JSON в теле запроса'));
        }
      })
      .on('error', reject);
  });
}

async function handlePaymentsApi(req, res, cleanedUrl) {
  if (cleanedUrl === '/api/payments/config' && req.method === 'GET') {
    const config = getPaymentsConfig();
    sendJson(res, 200, { config });
    return true;
  }

  if (cleanedUrl === '/api/payments/session' && req.method === 'POST') {
    try {
      const body = await collectRequestBody(req);
      const session = createMockSession(body || {});
      sendJson(res, 200, { session });
    } catch (error) {
      sendJson(res, 400, { error: error.message });
    }
    return true;
  }

  return false;
}

const server = http.createServer(async (req, res) => {
  const { url = '/', method = 'GET' } = req;
  const cleanedUrl = url.split('?')[0];

  if (method === 'OPTIONS' && handleOptions(req, res, cleanedUrl)) {
    return;
  }

  if (cleanedUrl.startsWith('/api/payments')) {
    const handled = await handlePaymentsApi(req, res, cleanedUrl);
    if (handled) {
      return;
    }
    sendJson(res, 404, { error: 'Маршрут не найден' });
    return;
  }

  const relativePath = cleanedUrl === '/' ? 'index.html' : cleanedUrl.replace(/^\/+/, '');
  const safePath = path
    .normalize(relativePath)
    .replace(/^((\.\.(?:[\/\\]|$))+)/, '');
  const filePath = path.resolve(ROOT_DIR, safePath);
  const relativePath = cleanedUrl === '/' ? '/index.html' : cleanedUrl;
  const safePath = path.normalize(relativePath).replace(/^\.\.(\/|\\|$)/, '');
  const filePath = path.join(ROOT_DIR, safePath);

  if (!filePath.startsWith(ROOT_DIR)) {
    res.writeHead(403);
    res.end('Forbidden');
    return;
  }

  fs.stat(filePath, (err, stats) => {
    if (err || !stats.isFile()) {
      res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
      res.end('Файл не найден');
      return;
    }

    const ext = path.extname(filePath).toLowerCase();
    const contentType = MIME_TYPES[ext] || 'application/octet-stream';

    res.writeHead(200, { 'Content-Type': contentType });
    fs.createReadStream(filePath).pipe(res);
  });
});

server.listen(PORT, () => {
  console.log(`Локальный сервер запущен: http://localhost:${PORT}`);
  console.log('Используемый платёжный провайдер:', getPaymentsConfig().provider);
});
