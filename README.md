# Node.js HTML Server

A small Node.js server that serves a chat page and connects it to Groq.

## Requirements

- Node.js installed
- A Groq API key

## Configure Groq

Copy `.env.example` to `.env` and set your key:

```text
GROQ_API_KEY=your_groq_api_key
```

The key is used only by the server and is never sent to the browser. Do not commit `.env`.

For Render, open your service's **Environment** settings and add:

- `GROQ_API_KEY`: your replacement Groq key
- `GROQ_MODEL`: `llama-3.1-8b-instant`

## Run the server

```powershell
node server.js
```

The page is available at:

[http://localhost:3000/](http://localhost:3000/)

The deployed server is available at:

[https://ai-chat-box-1-os0l.onrender.com](https://ai-chat-box-1-os0l.onrender.com)

You can also use the npm script:

```powershell
npm.cmd start
```

On systems where PowerShell blocks `npm.ps1`, use `node server.js` or `npm.cmd start`.

## Project structure

```text
.
├── public/
│   └── index.html
├── .env.example
├── .gitignore
├── server.js
├── package.json
└── README.md
```
