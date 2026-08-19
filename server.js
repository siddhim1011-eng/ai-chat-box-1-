const http = require('node:http');
const fs = require('node:fs');
const path = require('node:path');

const port = process.env.PORT || 3000;
const htmlPath = path.join(__dirname, 'public', 'index.html');

const server = http.createServer((request, response) => {
  if (request.method !== 'GET' || request.url !== '/') {
    response.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
    response.end('Not found');
    return;
  }

  fs.readFile(htmlPath, (error, html) => {
    if (error) {
      response.writeHead(500, { 'Content-Type': 'text/plain; charset=utf-8' });
      response.end('Unable to load the page');
      return;
    }

    response.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
    response.end(html);
  });
});

server.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
