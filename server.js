const http = require('node:http');
const fs = require('node:fs');
const path = require('node:path');

const port = process.env.PORT || 3000;
const htmlPath = path.join(__dirname, 'public', 'index.html');
const groqApiKey = process.env.GROQ_API_KEY;
const groqModel = process.env.GROQ_MODEL || 'llama-3.1-8b-instant';

function sendJson(response, statusCode, body) {
  response.writeHead(statusCode, { 'Content-Type': 'application/json; charset=utf-8' });
  response.end(JSON.stringify(body));
}

function readRequestBody(request) {
  return new Promise((resolve, reject) => {
    let body = '';

    request.on('data', (chunk) => {
      body += chunk;
      if (body.length > 100000) request.destroy();
    });
    request.on('end', () => resolve(body));
    request.on('error', reject);
  });
}

async function handleChat(request, response) {
  if (!groqApiKey) {
    sendJson(response, 500, { error: 'GROQ_API_KEY is not configured on the server.' });
    return;
  }

  try {
    const body = JSON.parse(await readRequestBody(request));
    const messages = Array.isArray(body.messages) ? body.messages : [];
    const validMessages = messages
      .filter((message) => message && ['user', 'assistant'].includes(message.role) && typeof message.content === 'string')
      .slice(-20)
      .map((message) => ({ role: message.role, content: message.content.slice(0, 4000) }));

    if (!validMessages.length || validMessages.at(-1).role !== 'user') {
      sendJson(response, 400, { error: 'A user message is required.' });
      return;
    }

    const groqResponse = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${groqApiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: groqModel,
        messages: [
          { role: 'system', content: 'You are a helpful, concise chat assistant.' },
          ...validMessages
        ],
        temperature: 0.7,
        max_tokens: 600
      })
    });

    const result = await groqResponse.json();
    if (!groqResponse.ok) {
      sendJson(response, groqResponse.status, { error: result.error?.message || 'Groq request failed.' });
      return;
    }

    sendJson(response, 200, { reply: result.choices[0].message.content });
  } catch (error) {
    console.error('Chat request failed:', error.message);
    sendJson(response, 500, { error: 'The assistant could not process that message.' });
  }
}

const server = http.createServer((request, response) => {
  const requestUrl = new URL(request.url, `http://${request.headers.host}`);

  if (request.method === 'POST' && requestUrl.pathname === '/api/chat') {
    handleChat(request, response);
    return;
  }

  if (request.method !== 'GET' || requestUrl.pathname !== '/') {
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
