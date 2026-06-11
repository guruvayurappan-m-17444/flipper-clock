# Zoho Catalyst – Flipper-Clock: Copilot Instructions

## Project Overview

**Project Name:** Flipper Clock
**Platform:** Zoho Catalyst (serverless full-stack)  
**Catalyst Project ID:** `41902000000026010`  
**Active Environment:** Development (`60072807661`) — domain: `catalyster-60072807661.development`  
**CLI Tool:** `zcatalyst-cli` (invoked as `catalyst` in the terminal)

---

## Workspace Structure

```
flipper-clock/
├── catalyst.json              # Catalyst project config (client + functions mapping)
├── .catalystrc                # CLI project/env defaults (do NOT edit manually)
├── vite.config.js             # Vite config for root-level React+Vite app
├── eslint.config.js           # ESLint config (flat config, ESM)
├── package.json               # Root package — React 18 + Vite dev server
├── index.html                 # Vite entry HTML
├── src/                       # Root Vite+React source (App.jsx, main.jsx)
│   ├── main.jsx
│   ├── App.jsx
│   └── assets/
│
├── react-app/                 # *** Catalyst-deployed client app (CRA, React 19) ***
│   ├── client-package.json    # Catalyst client metadata (name, homepage)
│   ├── package.json           # CRA app deps (react-scripts 5, zcatalyst-cli-plugin-react)
│   ├── public/                # Static assets (index.html, manifest.json)
│   └── src/
│       ├── index.js           # CRA entry point
│       ├── App.js             # Root component
│       ├── App.css / index.css
│       └── App.test.js
│
└── functions/
    └── node_function/         # *** Catalyst serverless function ***
        ├── catalyst-config.json  # Function deployment config
        ├── package.json          # Node dependencies
        └── index.js              # Function handler entry point
```

---

## Catalyst Configuration

### `catalyst.json`
```json
{
  "functions": {
    "targets": ["node_function"],
    "source": "functions"
  },
  "client": {
    "source": "react-app",
    "plugin": "zcatalyst-cli-plugin-react"
  }
}
```
- **Client source** is always `react-app/` — this is what Catalyst deploys to hosting.
- **Functions source** directory is `functions/` — each subdirectory is a separate function target.

---

## Frontend: Two React Apps Explained

| Location | Stack | Purpose |
|---|---|---|
| `src/` (root) | React 18 + Vite + SWC | Local dev only — fast HMR via `npm run dev` |
| `react-app/src/` | React 19 + CRA (react-scripts) | **Catalyst-deployed client** — built and served by Catalyst hosting |

> **Rule:** All production frontend code lives in `react-app/src/`. The root Vite app is for rapid prototyping/dev only. When a feature is ready, port it to `react-app/src/`.

### `react-app/client-package.json`
```json
{ "name": "react-app", "version": "0.0.1", "homepage": "index.html" }
```
Catalyst CLI reads this file to identify the client app. Do **not** rename or remove it.

---

## Backend: Catalyst Functions

### Function: `node_function`

**`functions/node_function/catalyst-config.json`:**
```json
{
  "deployment": {
    "name": "node_function",
    "stack": "node20",
    "type": "browser_logic",
    "env_variables": {}
  },
  "execution": {
    "main": "index.js"
  }
}
```

| Field | Value | Notes |
|---|---|---|
| `stack` | `node20` | Node.js 20 runtime |
| `type` | `browser_logic` | Uses Playwright (headless browser) |
| `main` | `index.js` | Entry point for all invocations |

### Function Handler Pattern (`index.js`)

```js
// Browser Logic function (type: browser_logic)
module.exports.playwright = async (request, response, page) => {
    // `page` is a Playwright Page instance — browser already launched
    await page.goto('https://example.com');
    const data = await page.title();
    response.setHeader('Content-Type', 'application/json');
    response.write(JSON.stringify({ output: data }));
    response.end();
};
```

- Export name must match the function type: `module.exports.playwright` for `browser_logic`.
- Uses CommonJS (`module.exports`), **not** ESM — do NOT use `import/export` in function files.
- Always call `response.end()` to close the response.
- `zcatalyst-sdk-node` is available for Catalyst service integrations (Datastore, Cache, etc.).

### Function Dependencies (`functions/node_function/package.json`)
```json
{
  "dependencies": {
    "playwright-core": "latest",
    "zcatalyst-sdk-node": "latest"
  }
}
```
- Keep `playwright-core` and `zcatalyst-sdk-node` as dependencies for browser_logic functions.
- Run `npm install` inside `functions/node_function/` before deploying.

---

## CLI Commands Reference

| Command | Description |
|---|---|
| `catalyst serve` | Start local dev server (serves both client + functions) |
| `catalyst deploy` | Deploy functions + client to Catalyst cloud |
| `catalyst deploy --only functions` | Deploy only functions |
| `catalyst deploy --only client` | Deploy only the React client |
| `catalyst functions:log <name>` | Tail function logs |
| `catalyst env list` | List environments |

> Catalyst CLI uses `.catalystrc` for default project/env resolution. Never delete or commit auth tokens from it.

---

## Development Workflow

1. **Local dev (UI only):** `npm run dev` at root → Vite HMR on `localhost:5173`
2. **Local dev (full stack):** `catalyst serve` → runs client + functions locally
3. **Build CRA client:** `cd react-app && npm run build` → outputs to `react-app/build/`
4. **Deploy:** `catalyst deploy` from project root

---

## Code Conventions

### Frontend (`react-app/src/`)
- Functional components only — no class components.
- File extension: `.js` (CRA default) — use `.jsx` only if you reconfigure CRA or use Vite.
- CSS: plain CSS files co-located with components (`App.css`, etc.).
- API calls to backend functions go through Catalyst's domain-relative paths or `zcatalyst-sdk-node` on the client side via `zcatalyst-cli-plugin-react`.

### Backend (`functions/`)
- CommonJS (`require`/`module.exports`) — **not ESM**.
- One function per directory under `functions/`.
- Each function directory **must** have:
  - `catalyst-config.json` — deployment metadata
  - `package.json` — dependencies
  - `index.js` (or file referenced in `execution.main`)
- Sensitive config goes in `env_variables` in `catalyst-config.json`, accessed via `process.env`.
- Do not hardcode credentials, API keys, or project IDs in source files.

### Environment Variables in Functions
```js
// Access env vars set in Catalyst console or catalyst-config.json
const apiKey = process.env.MY_API_KEY;
```

---

## Key Files — Do NOT Modify Without Understanding

| File | Risk if changed |
|---|---|
| `.catalystrc` | Breaks CLI project/env resolution |
| `catalyst.json` | Breaks deploy targets |
| `react-app/client-package.json` | Catalyst won't detect client app |
| `functions/node_function/catalyst-config.json` | Function won't deploy |

---

## Author / Project Context
- **Author email:** guruvayurappan.m@zohocorp.com
- **Timezone:** Asia/Kolkata
- **Node version for functions:** Node 20
- **React version (client):** React 19 (react-app), React 18 (root Vite)
