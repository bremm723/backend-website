import { L } from "./shared";

const AsyncFunction = Object.getPrototypeOf(async function () {}).constructor;
const RESERVED = new Set([
  "break", "case", "catch", "class", "const", "continue", "debugger", "default", "delete",
  "do", "else", "export", "extends", "finally", "for", "function", "if", "import", "in",
  "instanceof", "let", "new", "return", "super", "switch", "this", "throw", "try", "typeof",
  "var", "void", "while", "with", "yield", "await", "async", "console", "api", "sleep",
]);

const DENY = /\b(window|document|globalThis|global|fetch|XMLHttpRequest|localStorage|sessionStorage|indexedDB|WebSocket|Worker|SharedWorker|importScripts|eval|constructor|__proto__|prototype|require|process|top|parent|self|frames|opener|postMessage|location|open|alert|confirm|prompt|Reflect|Proxy|navigator|history|caches|cookie|setTimeout|setInterval|clearTimeout|clearInterval|import)\b|import\s*\(/i;

const seedHearts = () => [
  { id: 1, to: "Tuan Putri Ratih", note: "Semangat belajar backend!" },
  { id: 2, to: "Tuan Putri Ratih", note: "Jangan lupa istirahat." },
  { id: 3, to: "Tuan Putri Ratih", note: "Kamu makin jago tiap hari." },
];

export function createNodeState() {
  const state = {
    variables: {},
    logs: [],
    hearts: seedHearts(),
    nextId: 4,
    initialized: false,
    deps: [],
    serverRunning: false,
    packageJson: {
      name: "nduttt-api",
      version: "1.0.0",
      private: true,
      scripts: { start: "node server.js", dev: "node server.js" },
      dependencies: {},
    },
  };

  state.console = {
    log: (...args) => {
      state.logs.push(
        args
          .map((value) =>
            typeof value === "string" ? value : JSON.stringify(value, null, 2)
          )
          .join(" ")
      );
    },
    error: (...args) => state.console.log(...args),
  };

  state.sleep = (ms) =>
    new Promise((resolve) => {
      const wait = Math.max(0, Math.min(Number(ms) || 0, 600));
      setTimeout(resolve, wait);
    });

  const apiGet = async (path) => {
    await state.sleep(80);
    if (path === "/api/hearts" || path === "/api/hearts/") {
      return { data: [...state.hearts], meta: { count: state.hearts.length, page: 1 } };
    }
    const match = String(path).match(/^\/api\/hearts\/(\d+)$/);
    if (match) {
      const heart = state.hearts.find((item) => item.id === Number(match[1]));
      if (!heart) {
        const error = new Error("404 — hati tidak ditemukan");
        error.status = 404;
        error.body = { error: { code: "HEART_NOT_FOUND", message: "Hati tidak ditemukan." } };
        throw error;
      }
      return { data: heart };
    }
    throw new Error(`Endpoint GET ${path} belum ada di lab ini.`);
  };

  state.api = {
    get: apiGet,
    post: async (path, body) => {
      await state.sleep(80);
      if (path !== "/api/hearts") throw new Error("Endpoint POST hanya /api/hearts.");
      if (!body || typeof body.to !== "string" || !body.to.trim()) {
        const error = new Error("400 — field to wajib diisi");
        error.status = 400;
        throw error;
      }
      const heart = {
        id: state.nextId++,
        to: body.to,
        note: body.note || "",
      };
      state.hearts.push(heart);
      return { data: heart };
    },
    patch: async (path, body) => {
      await state.sleep(80);
      const match = String(path).match(/^\/api\/hearts\/(\d+)$/);
      const heart = match && state.hearts.find((item) => item.id === Number(match[1]));
      if (!heart) {
        const error = new Error("404 — hati tidak ditemukan");
        error.status = 404;
        throw error;
      }
      Object.assign(heart, body || {});
      return { data: heart };
    },
    delete: async (path) => {
      await state.sleep(80);
      const match = String(path).match(/^\/api\/hearts\/(\d+)$/);
      const id = match ? Number(match[1]) : null;
      state.hearts = state.hearts.filter((item) => item.id !== id);
      return { data: null, status: 204 };
    },
  };

  return state;
}

function scopeKeys(state) {
  return Object.keys(state.variables).filter(
    (name) => /^[A-Za-z_$][\w$]*$/.test(name) && !RESERVED.has(name)
  );
}

async function evaluate(expression, state) {
  if (DENY.test(expression)) {
    throw new Error(
      "Demi keamanan, sandbox lab memblokir akses ke browser/server (window, document, fetch, process, constructor, dll)."
    );
  }
  const keys = scopeKeys(state);
  const params = [...keys, "console", "api", "sleep", "Function"];
  const values = [
    ...keys.map((key) => state.variables[key]),
    state.console,
    state.api,
    state.sleep,
    undefined,
  ];
  const fn = new AsyncFunction(...params, `"use strict"; return (${expression});`);
  return fn(...values);
}

function formatResult(value) {
  if (typeof value === "undefined") return "undefined";
  if (typeof value === "string") return value;
  if (typeof value === "function") return "[function]";
  try {
    return JSON.stringify(value, null, 2);
  } catch {
    return String(value);
  }
}

function packageJson(state) {
  return JSON.stringify(state.packageJson, null, 2);
}

function helpLines() {
  return [
    L.info("JavaScript mini (sandbox aman)"),
    L.text('  console.log("Halo Ratih")'),
    L.text('  const nama = "Ratih"'),
    L.text("  2 + 3 * 4"),
    L.text('  function sapa(nama) { return "Halo " + nama; }'),
    L.text('  const hati = [{ to: "Ratih" }, { to: "Sahabat" }]'),
    L.text("  hati.map((item) => item.to)"),
    L.text('  const data = await api.get("/api/hearts")'),
    L.text("  console.log(data.data.length)"),
    L.info("Terminal Node & npm"),
    L.text("  node --version · npm --version · ls · pwd"),
    L.text("  npm init -y · npm install express · cat package.json"),
    L.text("  node server.js · curl localhost:3000/api/hearts"),
    L.muted("Satu baris = satu perintah. Variabel tersimpan selama lab terbuka."),
    L.warn("Ini sandbox mini, bukan Node.js asli. Akses file/network sengaja diblokir."),
  ];
}

function handleShell(raw, state) {
  if (/^node\s+--version$/i.test(raw)) {
    return { events: [], lines: [L.success("v20.11.1"), L.muted("Node.js menjalankan JavaScript di luar browser.")] };
  }
  if (/^npm\s+--version$/i.test(raw)) {
    return { events: [], lines: [L.success("10.2.4")] };
  }
  if (/^pwd$/i.test(raw)) {
    return { events: [], lines: [L.text("/home/ratih/nduttt-api")] };
  }
  if (/^ls$/i.test(raw)) {
    return {
      events: [],
      lines: [
        L.text("package.json  server.js  node_modules/  .env  README.md"),
        L.muted("Di Node asli, `ls` menampilkan file. Di lab ini isinya simulasi."),
      ],
    };
  }
  if (/^npm\s+init\s+-y$/i.test(raw)) {
    state.initialized = true;
    return {
      events: ["node:init"],
      lines: [
        L.success("Wrote to package.json"),
        L.code(packageJson(state)),
        L.info("package.json adalah KTP proyek: nama, script, dan daftar dependency."),
      ],
    };
  }
  if (/^npm\s+install\s+express$/i.test(raw)) {
    if (!state.deps.includes("express")) state.deps.push("express");
    state.packageJson.dependencies.express = "^4.19.2";
    return {
      events: ["node:install"],
      lines: [
        L.success("added 1 package (simulasi express@4.19.2)"),
        L.muted("Di terminal asli, npm mengunduh package ke folder node_modules/."),
        L.info("Sekarang coba: cat package.json"),
      ],
    };
  }
  if (/^cat\s+package\.json$/i.test(raw)) {
    return { events: [], lines: [L.code(packageJson(state))] };
  }
  if (/^(node\s+server\.js|npm\s+run\s+dev)$/i.test(raw)) {
    state.serverRunning = true;
    return {
      events: ["node:server"],
      lines: [
        L.info("Menjalankan server Node..."),
        L.success("nduttt API berjalan di http://localhost:3000"),
        L.muted("Server tetap hidup di background lab. Coba curl localhost:3000/api/hearts"),
        L.code("[GET] /api/hearts 200 12ms  ← permintaan berikutnya akan muncul di sini"),
      ],
    };
  }
  if (/^curl\s+(.+)$/i.test(raw)) {
    const url = raw.replace(/^curl\s+/i, "").trim();
    if (/localhost:3000\/api\/hearts\/?$/i.test(url)) {
      if (!state.serverRunning) {
        return {
          events: ["node:curl-fail"],
          lines: [
            L.error("curl: (7) Failed to connect to localhost port 3000"),
            L.warn("Server belum jalan. Jalankan `node server.js` dulu."),
          ],
        };
      }
      return {
        events: ["node:curl"],
        lines: [
          L.http({
            method: "GET",
            path: "/api/hearts",
            status: 200,
            statusText: "OK",
            headers: [["Content-Type", "application/json"]],
            body: { data: state.hearts, meta: { count: state.hearts.length } },
            ms: 12,
          }),
        ],
      };
    }
    if (/localhost:3000\/api\/health$/i.test(url)) {
      return {
        events: ["node:curl"],
        lines: [
          L.http({
            method: "GET",
            path: "/api/health",
            status: state.serverRunning ? 200 : 500,
            statusText: state.serverRunning ? "OK" : "Internal Server Error",
            headers: [["Content-Type", "application/json"]],
            body: state.serverRunning
              ? { status: "ok", uptime: "8s" }
              : { error: { code: "SERVER_DOWN", message: "Server belum berjalan." } },
            ms: 5,
          }),
        ],
      };
    }
    return {
      events: [],
      lines: [L.error(`curl: endpoint ${url} belum ada di lab. Coba localhost:3000/api/hearts`)],
    };
  }
  return null;
}

async function handleJavaScript(raw, state) {
  if (DENY.test(raw)) {
    return {
      events: [],
      lines: [
        L.error("Kode diblokir oleh sandbox lab."),
        L.muted("Lab ini hanya untuk latihan JS dasar. Akses browser, file, network, dan constructor sengaja diblokir."),
      ],
    };
  }

  const events = [];
  if (/console\.log\s*\(/.test(raw)) events.push("js:console");
  if (/\bawait\b/.test(raw)) events.push("js:await");
  if (/\.(map|filter|reduce|find|forEach)\s*\(/.test(raw)) events.push("js:array");

  try {
    const functionMatch = raw.match(
      /^(async\s+)?function\s+([A-Za-z_$][\w$]*)\s*\(([^)]*)\)\s*\{([\s\S]*)\}\s*;?$/
    );
    if (functionMatch) {
      const isAsync = Boolean(functionMatch[1]);
      const name = functionMatch[2];
      const params = functionMatch[3];
      const body = functionMatch[4];
      const keys = scopeKeys(state);
      const allParams = [...keys, "console", "api", "sleep", "Function"];
      const values = [
        ...keys.map((key) => state.variables[key]),
        state.console,
        state.api,
        state.sleep,
        undefined,
      ];
      const source = `${isAsync ? "async " : ""}function ${name}(${params}) {${body}}`;
      const outer = new Function(...allParams, `"use strict"; return (${source});`);
      state.variables[name] = outer(...values);
      events.push("js:function");
      return {
        events,
        lines: [L.success(`Fungsi ${name} dibuat. Coba panggil: ${name}(...)`)],
      };
    }

    const declaration = raw.match(
      /^(?:const|let|var)\s+([A-Za-z_$][\w$]*)\s*=\s*([\s\S]+?);?$/
    );
    if (declaration) {
      const name = declaration[1];
      const expression = declaration[2].replace(/;\s*$/, "");
      const value = await evaluate(expression, state);
      state.variables[name] = value;
      events.push("js:variable");
      let resultLine = L.success(`${name} = ${formatResult(value)}`);
      if (typeof value === "function") events.push("js:function");
      return { events, lines: [resultLine, ...state.logs.splice(0).map((text) => L.text(text))] };
    }

    const assignment = raw.match(/^([A-Za-z_$][\w$]*)\s*=\s*([\s\S]+)$/);
    if (assignment && !/^(const|let|var)\b/.test(raw)) {
      const name = assignment[1];
      const value = await evaluate(assignment[2], state);
      state.variables[name] = value;
      return {
        events: ["js:variable"],
        lines: [L.success(`${name} = ${formatResult(value)}`)],
      };
    }

    const logMatch = raw.match(/^console\.log\s*\(([\s\S]*)\)\s*;?$/);
    if (logMatch) {
      state.logs.length = 0;
      await evaluate(`console.log(${logMatch[1]})`, state);
      const output = state.logs.splice(0);
      return {
        events,
        lines: output.length ? output.map((text) => L.text(text)) : [L.muted("console.log tidak mencetak apa pun.")],
      };
    }

    state.logs.length = 0;
    const value = await evaluate(raw.replace(/;\s*$/, ""), state);
    const logged = state.logs.splice(0).map((text) => L.text(text));
    if (logged.length) {
      return { events, lines: [...logged, ...(typeof value === "undefined" ? [] : [L.info(`→ ${formatResult(value)}`)])] };
    }
    return {
      events,
      lines: [
        L.info(`→ ${formatResult(value)}`),
        L.muted("Ekspresi dihitung. Variabel dan fungsi tersimpan untuk perintah berikutnya."),
      ],
    };
  } catch (error) {
    state.logs.length = 0;
    return {
      events: [],
      lines: [
        L.error(`${error.name || "Error"}: ${error.message}`),
        L.muted("Periksa tanda kutip, kurung, titik koma, dan nama variabel."),
      ],
    };
  }
}

export async function runNodeCommand(rawInput, state) {
  const raw = rawInput.trim();
  if (!raw) return { lines: [], events: [] };
  if (/^help$/i.test(raw)) return { lines: helpLines(), events: [] };
  if (/^(clear|cls)$/i.test(raw)) return { lines: [], events: [], clear: true };

  const shell = handleShell(raw, state);
  if (shell) return shell;
  return handleJavaScript(raw, state);
}
