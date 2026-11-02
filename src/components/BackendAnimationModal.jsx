"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";

/* ================================================================
   CONCEPT DEFINITIONS
   Setiap konsep punya steps animasi flow data dengan:
   - nodes  : aktor di kanvas  { id, x, y, icon, label, active }
   - packets: paket bergerak   { id, label, color, fromNode, toNode }

   Semua % adalah posisi dalam kanvas (kiri=0%, kanan=100%).
   ================================================================ */

const BASE_CONCEPTS = {
  /* ─────────────── GET REQUEST ─────────────── */
  GET_REQUEST: {
    title: "GET Request",
    subtitle: "Client meminta data — Server mengambil & mengembalikannya",
    color: { from: "#f472b6", to: "#e879f9", glow: "rgba(244,114,182,0.4)" },
    steps: [
      {
        id: "idle",
        label: "Situasi Awal",
        description:
          "Client (browser/aplikasi) siap mengirim permintaan GET kepada Server. Server sedang menunggu request.",
        nodes: [
          { id: "client", x: 10, y: 50, icon: "💻", label: "Client",   active: true  },
          { id: "server", x: 55, y: 50, icon: "🖥️",  label: "Server",   active: false },
          { id: "db",     x: 88, y: 50, icon: "🗄️",  label: "Database", active: false },
        ],
        packets: [],
      },
      {
        id: "request",
        label: "HTTP GET Dikirim",
        description:
          "Client mengirim HTTP GET /api/hearts membawa header Authorization dan Accept: application/json.",
        nodes: [
          { id: "client", x: 10, y: 50, icon: "💻", label: "Client",   active: true  },
          { id: "server", x: 55, y: 50, icon: "🖥️",  label: "Server",   active: true  },
          { id: "db",     x: 88, y: 50, icon: "🗄️",  label: "Database", active: false },
        ],
        packets: [{ id: "req", label: "GET /api/hearts", color: "#f472b6", fromNode: "client", toNode: "server" }],
      },
      {
        id: "fetch",
        label: "Server Query ke DB",
        description:
          "Server menerima request, memeriksa auth jika diperlukan, lalu mengirim SELECT query ke Database.",
        nodes: [
          { id: "client", x: 10, y: 50, icon: "💻", label: "Client",   active: false },
          { id: "server", x: 55, y: 50, icon: "🖥️",  label: "Server",   active: true  },
          { id: "db",     x: 88, y: 50, icon: "🗄️",  label: "Database", active: true  },
        ],
        packets: [{ id: "query", label: "SELECT * FROM hearts", color: "#a78bfa", fromNode: "server", toNode: "db" }],
      },
      {
        id: "response",
        label: "200 OK + JSON",
        description:
          "Database mengirim data ke Server. Server membentuk response JSON { data: [...] } dan mengirimnya ke Client dengan status 200 OK.",
        nodes: [
          { id: "client", x: 10, y: 50, icon: "💻", label: "Client",   active: true  },
          { id: "server", x: 55, y: 50, icon: "🖥️",  label: "Server",   active: true  },
          { id: "db",     x: 88, y: 50, icon: "🗄️",  label: "Database", active: true  },
        ],
        packets: [
          { id: "dbres",   label: "rows[]",              color: "#34d399", fromNode: "db",     toNode: "server" },
          { id: "jsonres", label: "200 OK { data: [] }",  color: "#22d3ee", fromNode: "server", toNode: "client" },
        ],
      },
    ],
  },

  /* ─────────────── POST REQUEST ─────────────── */
  POST_REQUEST: {
    title: "POST Request",
    subtitle: "Client mengirim data baru — divalidasi & disimpan ke Database",
    color: { from: "#fb923c", to: "#f43f5e", glow: "rgba(251,146,60,0.4)" },
    steps: [
      {
        id: "idle",
        label: "Situasi Awal",
        description:
          "Client punya data baru (payload JSON) yang akan dikirimkan ke Server untuk disimpan.",
        nodes: [
          { id: "client",    x: 8,  y: 50, icon: "💻", label: "Client",   active: true  },
          { id: "server",    x: 45, y: 50, icon: "🖥️",  label: "Server",   active: false },
          { id: "validator", x: 72, y: 28, icon: "✅", label: "Validator", active: false },
          { id: "db",        x: 88, y: 65, icon: "🗄️",  label: "Database", active: false },
        ],
        packets: [],
      },
      {
        id: "send",
        label: "Payload Dikirim",
        description:
          'Client mengirim POST /api/hearts dengan body JSON: { "to": "Ratih", "note": "Semangat!" } dan header Content-Type: application/json.',
        nodes: [
          { id: "client",    x: 8,  y: 50, icon: "💻", label: "Client",   active: true  },
          { id: "server",    x: 45, y: 50, icon: "🖥️",  label: "Server",   active: true  },
          { id: "validator", x: 72, y: 28, icon: "✅", label: "Validator", active: false },
          { id: "db",        x: 88, y: 65, icon: "🗄️",  label: "Database", active: false },
        ],
        packets: [{ id: "body", label: 'POST { "to": "Ratih" }', color: "#fb923c", fromNode: "client", toNode: "server" }],
      },
      {
        id: "validate",
        label: "Validasi di Server",
        description:
          "Server meneruskan body ke Validator — memeriksa field wajib, tipe data, panjang, dan aturan bisnis. Jika gagal → 400 Bad Request.",
        nodes: [
          { id: "client",    x: 8,  y: 50, icon: "💻", label: "Client",   active: false },
          { id: "server",    x: 45, y: 50, icon: "🖥️",  label: "Server",   active: true  },
          { id: "validator", x: 72, y: 28, icon: "✅", label: "Validator ✓", active: true },
          { id: "db",        x: 88, y: 65, icon: "🗄️",  label: "Database", active: false },
        ],
        packets: [{ id: "val", label: "validate(body)", color: "#fbbf24", fromNode: "server", toNode: "validator" }],
      },
      {
        id: "save",
        label: "INSERT ke Database",
        description:
          "Validasi lolos. Server menyimpan data ke Database dengan INSERT INTO hearts. Database menghasilkan id dan timestamp otomatis.",
        nodes: [
          { id: "client",    x: 8,  y: 50, icon: "💻", label: "Client",   active: false },
          { id: "server",    x: 45, y: 50, icon: "🖥️",  label: "Server",   active: true  },
          { id: "validator", x: 72, y: 28, icon: "✅", label: "Validator ✓", active: false },
          { id: "db",        x: 88, y: 65, icon: "🗄️",  label: "Database", active: true  },
        ],
        packets: [{ id: "insert", label: "INSERT INTO hearts", color: "#a78bfa", fromNode: "server", toNode: "db" }],
      },
      {
        id: "created",
        label: "201 Created",
        description:
          "Database mengonfirmasi data tersimpan. Server mengirim 201 Created + data lengkap (termasuk id, createdAt) ke Client.",
        nodes: [
          { id: "client",    x: 8,  y: 50, icon: "💻", label: "Client",   active: true  },
          { id: "server",    x: 45, y: 50, icon: "🖥️",  label: "Server",   active: true  },
          { id: "validator", x: 72, y: 28, icon: "✅", label: "Validator ✓", active: false },
          { id: "db",        x: 88, y: 65, icon: "🗄️",  label: "Database", active: true  },
        ],
        packets: [{ id: "resp", label: "201 Created { id: 4 }", color: "#34d399", fromNode: "server", toNode: "client" }],
      },
    ],
  },

  /* ─────────────── MIDDLEWARE ─────────────── */
  MIDDLEWARE: {
    title: "Middleware Pipeline",
    subtitle: "Request melewati rangkaian gatekeeper sebelum sampai ke Controller",
    color: { from: "#818cf8", to: "#a78bfa", glow: "rgba(129,140,248,0.4)" },
    steps: [
      {
        id: "idle",
        label: "Situasi Awal",
        description:
          "Request masuk dan akan melewati middleware satu per satu sebelum mencapai Route Controller.",
        nodes: [
          { id: "client",     x: 5,  y: 50, icon: "💻", label: "Client",          active: true  },
          { id: "auth",       x: 28, y: 50, icon: "🔐", label: "Auth Check",       active: false },
          { id: "validation", x: 52, y: 50, icon: "🛡️",  label: "Validation",      active: false },
          { id: "controller", x: 80, y: 50, icon: "⚙️",  label: "Route Controller", active: false },
        ],
        packets: [],
      },
      {
        id: "enter",
        label: "Request Masuk",
        description:
          "Client mengirim request (misal POST /api/hearts). Request memasuki pipeline middleware dari kiri ke kanan.",
        nodes: [
          { id: "client",     x: 5,  y: 50, icon: "💻", label: "Client",          active: true  },
          { id: "auth",       x: 28, y: 50, icon: "🔐", label: "Auth Check",       active: true  },
          { id: "validation", x: 52, y: 50, icon: "🛡️",  label: "Validation",      active: false },
          { id: "controller", x: 80, y: 50, icon: "⚙️",  label: "Route Controller", active: false },
        ],
        packets: [{ id: "req", label: "Request →", color: "#818cf8", fromNode: "client", toNode: "auth" }],
      },
      {
        id: "auth",
        label: "Auth Middleware",
        description:
          "Middleware Auth memeriksa JWT token / session. Token tidak valid → tolak dengan 401 Unauthorized. Token valid → tambah req.user dan panggil next().",
        nodes: [
          { id: "client",     x: 5,  y: 50, icon: "💻", label: "Client",          active: false },
          { id: "auth",       x: 28, y: 50, icon: "🔐", label: "Auth ✓ next()",   active: true  },
          { id: "validation", x: 52, y: 50, icon: "🛡️",  label: "Validation",      active: false },
          { id: "controller", x: 80, y: 50, icon: "⚙️",  label: "Route Controller", active: false },
        ],
        packets: [{ id: "tok", label: "Token valid next()", color: "#fbbf24", fromNode: "auth", toNode: "validation" }],
      },
      {
        id: "validation",
        label: "Validation Middleware",
        description:
          "Middleware Validation memeriksa body/params sesuai schema (Zod/Joi). Gagal → tolak 400 Bad Request. Lolos → next().",
        nodes: [
          { id: "client",     x: 5,  y: 50, icon: "💻", label: "Client",          active: false },
          { id: "auth",       x: 28, y: 50, icon: "🔐", label: "Auth ✓",          active: false },
          { id: "validation", x: 52, y: 50, icon: "🛡️",  label: "Valid ✓ next()", active: true  },
          { id: "controller", x: 80, y: 50, icon: "⚙️",  label: "Route Controller", active: false },
        ],
        packets: [{ id: "valid", label: "Input valid next()", color: "#34d399", fromNode: "validation", toNode: "controller" }],
      },
      {
        id: "controller",
        label: "Route Controller",
        description:
          "Request yang sudah bersih & terautentikasi tiba di Controller. Controller memproses bisnis logic dan mengirim response.",
        nodes: [
          { id: "client",     x: 5,  y: 50, icon: "💻", label: "Client",          active: true  },
          { id: "auth",       x: 28, y: 50, icon: "🔐", label: "Auth ✓",          active: false },
          { id: "validation", x: 52, y: 50, icon: "🛡️",  label: "Valid ✓",        active: false },
          { id: "controller", x: 80, y: 50, icon: "⚙️",  label: "Controller ✓",   active: true  },
        ],
        packets: [{ id: "res", label: "200 OK { data }", color: "#f472b6", fromNode: "controller", toNode: "client" }],
      },
    ],
  },

  /* ─────────────── DATABASE QUERY ─────────────── */
  DATABASE_QUERY: {
    title: "Database Query",
    subtitle: "Perintah SQL mencari & menyaring data di dalam tabel",
    color: { from: "#34d399", to: "#22d3ee", glow: "rgba(52,211,153,0.4)" },
    steps: [
      {
        id: "idle",
        label: "Tabel Database",
        description:
          "Database memiliki tabel 'hearts' dengan banyak baris. Server akan mengirim perintah SQL untuk mengambil data tertentu.",
        nodes: [
          { id: "server", x: 10, y: 50, icon: "🖥️",  label: "Server",     active: true  },
          { id: "engine", x: 45, y: 50, icon: "⚙️",  label: "SQL Engine",  active: false },
          { id: "table",  x: 82, y: 50, icon: "📋", label: "Tabel hearts", active: false },
        ],
        packets: [],
      },
      {
        id: "query",
        label: "Kirim Query SQL",
        description:
          "Server mengirim SQL: SELECT * FROM hearts WHERE owner_uid = 'u_ratih' ORDER BY created_at DESC LIMIT 10;",
        nodes: [
          { id: "server", x: 10, y: 50, icon: "🖥️",  label: "Server",     active: true  },
          { id: "engine", x: 45, y: 50, icon: "⚙️",  label: "SQL Engine",  active: true  },
          { id: "table",  x: 82, y: 50, icon: "📋", label: "Tabel hearts", active: false },
        ],
        packets: [{ id: "sql", label: "SELECT * WHERE owner=ratih", color: "#34d399", fromNode: "server", toNode: "engine" }],
      },
      {
        id: "parse",
        label: "Parse & Query Plan",
        description:
          "SQL Engine mem-parse query, memilih query plan optimal, dan memanfaatkan index pada kolom owner_uid jika ada.",
        nodes: [
          { id: "server", x: 10, y: 50, icon: "🖥️",  label: "Server",     active: false },
          { id: "engine", x: 45, y: 50, icon: "⚙️",  label: "Parsing 🔍",  active: true  },
          { id: "table",  x: 82, y: 50, icon: "📋", label: "Tabel hearts", active: true  },
        ],
        packets: [{ id: "scan", label: "Index Scan →", color: "#fbbf24", fromNode: "engine", toNode: "table" }],
      },
      {
        id: "filter",
        label: "Filter + Urutkan",
        description:
          "Engine menerapkan WHERE (hanya baris milik u_ratih), lalu ORDER BY created_at DESC, lalu LIMIT 10.",
        nodes: [
          { id: "server", x: 10, y: 50, icon: "🖥️",  label: "Server",     active: false },
          { id: "engine", x: 45, y: 50, icon: "⚙️",  label: "Filter+Sort ✓", active: true },
          { id: "table",  x: 82, y: 50, icon: "📋", label: "Tabel hearts", active: true  },
        ],
        packets: [{ id: "rows", label: "← 3 rows matched", color: "#a78bfa", fromNode: "table", toNode: "engine" }],
      },
      {
        id: "result",
        label: "Result Set Kembali",
        description:
          "SQL Engine mengembalikan result set (array of rows) ke Server. Server mengubahnya menjadi JSON dan mengirim ke Client.",
        nodes: [
          { id: "server", x: 10, y: 50, icon: "🖥️",  label: "Server ✓",   active: true  },
          { id: "engine", x: 45, y: 50, icon: "⚙️",  label: "SQL Engine",  active: true  },
          { id: "table",  x: 82, y: 50, icon: "📋", label: "Tabel hearts", active: false },
        ],
        packets: [{ id: "res", label: "rows[] → Server", color: "#22d3ee", fromNode: "engine", toNode: "server" }],
      },
    ],
  },

  /* ─────────────── AUTH FLOW ─────────────── */
  AUTH_FLOW: {
    title: "Alur Authentication",
    subtitle: "Login → Token → Akses resource yang dilindungi",
    color: { from: "#f59e0b", to: "#ef4444", glow: "rgba(245,158,11,0.4)" },
    steps: [
      {
        id: "idle",
        label: "Situasi Awal",
        description:
          "Client belum login. Server tidak mengenali siapa pengirim request.",
        nodes: [
          { id: "client",  x: 8,  y: 50, icon: "💻", label: "Client (belum login)", active: true  },
          { id: "auth",    x: 48, y: 50, icon: "🔐", label: "Auth Server",           active: false },
          { id: "session", x: 85, y: 50, icon: "🪙", label: "Token/Session",         active: false },
        ],
        packets: [],
      },
      {
        id: "login",
        label: "Kirim Kredensial",
        description:
          'Client POST /api/login dengan body { "email": "ratih@nduttt.be", "password": "rahasia" } ke Auth Server.',
        nodes: [
          { id: "client",  x: 8,  y: 50, icon: "💻", label: "Client",      active: true  },
          { id: "auth",    x: 48, y: 50, icon: "🔐", label: "Auth Server",  active: true  },
          { id: "session", x: 85, y: 50, icon: "🪙", label: "Token/Session", active: false },
        ],
        packets: [{ id: "cred", label: "POST { email, password }", color: "#f59e0b", fromNode: "client", toNode: "auth" }],
      },
      {
        id: "verify",
        label: "Verifikasi & Hash",
        description:
          "Auth Server mengambil user dari DB, lalu membandingkan password dengan hash bcrypt yang tersimpan. Jika cocok, lanjut buat token.",
        nodes: [
          { id: "client",  x: 8,  y: 50, icon: "💻", label: "Client",      active: false },
          { id: "auth",    x: 48, y: 50, icon: "🔐", label: "bcrypt.compare ✓", active: true },
          { id: "session", x: 85, y: 50, icon: "🪙", label: "JWT dibuat",   active: true  },
        ],
        packets: [{ id: "tok", label: "sign(payload, secret)", color: "#a78bfa", fromNode: "auth", toNode: "session" }],
      },
      {
        id: "token",
        label: "Token Dikirim ke Client",
        description:
          "Auth Server mengirim JWT token (atau Set-Cookie session) ke Client. Client menyimpannya untuk request berikutnya.",
        nodes: [
          { id: "client",  x: 8,  y: 50, icon: "💻", label: "Client ✓",    active: true  },
          { id: "auth",    x: 48, y: 50, icon: "🔐", label: "Auth Server",  active: true  },
          { id: "session", x: 85, y: 50, icon: "🪙", label: "JWT",          active: false },
        ],
        packets: [{ id: "jwt", label: "200 OK { token: eyJ... }", color: "#34d399", fromNode: "auth", toNode: "client" }],
      },
      {
        id: "access",
        label: "Akses Resource",
        description:
          "Client membawa token di header Authorization: Bearer <jwt>. Middleware memverifikasi signature — jika valid, request lanjut ke handler.",
        nodes: [
          { id: "client",  x: 8,  y: 50, icon: "💻", label: "Client",      active: true  },
          { id: "auth",    x: 48, y: 50, icon: "🔐", label: "Middleware verify ✓", active: true },
          { id: "session", x: 85, y: 50, icon: "🪙", label: "req.user set",  active: true  },
        ],
        packets: [{ id: "access", label: "Bearer eyJ... → 200", color: "#f472b6", fromNode: "client", toNode: "auth" }],
      },
    ],
  },

  /* ─────────────── ERROR HANDLING ─────────────── */
  ERROR_FLOW: {
    title: "Error Handling Flow",
    subtitle: "Bagaimana request yang bermasalah ditolak dengan pesan yang jelas",
    color: { from: "#f87171", to: "#fb923c", glow: "rgba(248,113,113,0.4)" },
    steps: [
      {
        id: "idle",
        label: "Situasi Awal",
        description:
          "Client mengirim request yang mungkin valid atau tidak. Server harus menangani keduanya dengan benar.",
        nodes: [
          { id: "client",   x: 8,  y: 50, icon: "💻", label: "Client",    active: true  },
          { id: "validate", x: 40, y: 50, icon: "🛡️",  label: "Validator", active: false },
          { id: "handler",  x: 70, y: 50, icon: "⚙️",  label: "Handler",   active: false },
          { id: "errlog",   x: 88, y: 75, icon: "📋", label: "Error Log",  active: false },
        ],
        packets: [],
      },
      {
        id: "bad_input",
        label: "Input Tidak Valid",
        description:
          'Client mengirim POST /api/hearts tanpa field "to" yang wajib. Validator menolak dan merespons 400.',
        nodes: [
          { id: "client",   x: 8,  y: 50, icon: "💻", label: "Client",       active: true  },
          { id: "validate", x: 40, y: 50, icon: "🛡️",  label: "Validator ✗", active: true  },
          { id: "handler",  x: 70, y: 50, icon: "⚙️",  label: "Handler",      active: false },
          { id: "errlog",   x: 88, y: 75, icon: "📋", label: "Error Log",     active: false },
        ],
        packets: [{ id: "bad", label: 'POST { } → 400', color: "#f87171", fromNode: "validate", toNode: "client" }],
      },
      {
        id: "valid_input",
        label: "Input Valid Lanjut",
        description:
          "Client mengirim request yang valid. Validator lolos dan request diteruskan ke Handler untuk diproses.",
        nodes: [
          { id: "client",   x: 8,  y: 50, icon: "💻", label: "Client",       active: false },
          { id: "validate", x: 40, y: 50, icon: "🛡️",  label: "Validator ✓", active: true  },
          { id: "handler",  x: 70, y: 50, icon: "⚙️",  label: "Handler",      active: true  },
          { id: "errlog",   x: 88, y: 75, icon: "📋", label: "Error Log",     active: false },
        ],
        packets: [{ id: "ok", label: "valid next()", color: "#34d399", fromNode: "validate", toNode: "handler" }],
      },
      {
        id: "server_error",
        label: "Error Tak Terduga",
        description:
          "Handler melempar exception (misal database down). try/catch menangkap error, mencatat ke log, dan merespons 500 generik ke Client.",
        nodes: [
          { id: "client",   x: 8,  y: 50, icon: "💻", label: "Client",    active: true  },
          { id: "validate", x: 40, y: 50, icon: "🛡️",  label: "Validator", active: false },
          { id: "handler",  x: 70, y: 50, icon: "⚙️",  label: "catch(err)", active: true  },
          { id: "errlog",   x: 88, y: 75, icon: "📋", label: "Log detail",  active: true  },
        ],
        packets: [
          { id: "log",  label: "error detail →",        color: "#fbbf24", fromNode: "handler",  toNode: "errlog" },
          { id: "safe", label: "500 pesan aman →",       color: "#f87171", fromNode: "handler",  toNode: "client" },
        ],
      },
    ],
  },

  /* ─────────────── DEPLOY PIPELINE ─────────────── */
  DEPLOY_PIPELINE: {
    title: "Deploy Pipeline",
    subtitle: "Dari kode lokal ke production: build → test → deploy → pantau",
    color: { from: "#60a5fa", to: "#818cf8", glow: "rgba(96,165,250,0.4)" },
    steps: [
      {
        id: "idle",
        label: "Push ke Repo",
        description:
          "Developer melakukan git push ke branch main. CI/CD pipeline otomatis terpicu di GitHub Actions.",
        nodes: [
          { id: "dev",      x: 8,  y: 50, icon: "👩‍💻", label: "Developer",     active: true  },
          { id: "repo",     x: 35, y: 50, icon: "📦", label: "Git Repo",       active: true  },
          { id: "ci",       x: 62, y: 50, icon: "⚙️",  label: "CI Pipeline",   active: false },
          { id: "hosting",  x: 88, y: 50, icon: "🌐", label: "Firebase Hosting", active: false },
        ],
        packets: [{ id: "push", label: "git push main", color: "#60a5fa", fromNode: "dev", toNode: "repo" }],
      },
      {
        id: "ci",
        label: "Install & Test",
        description:
          "CI Pipeline menjalankan npm ci (install dependency terkunci), lalu npm test. Jika ada test gagal, deploy dihentikan.",
        nodes: [
          { id: "dev",      x: 8,  y: 50, icon: "👩‍💻", label: "Developer",     active: false },
          { id: "repo",     x: 35, y: 50, icon: "📦", label: "Git Repo",       active: false },
          { id: "ci",       x: 62, y: 50, icon: "⚙️",  label: "npm ci + test ✓", active: true },
          { id: "hosting",  x: 88, y: 50, icon: "🌐", label: "Firebase Hosting", active: false },
        ],
        packets: [{ id: "trigger", label: "trigger build →", color: "#818cf8", fromNode: "repo", toNode: "ci" }],
      },
      {
        id: "build",
        label: "Build Production",
        description:
          "Test hijau. CI menjalankan npm run build → Next.js menghasilkan folder out/ (static export) yang siap di-upload.",
        nodes: [
          { id: "dev",      x: 8,  y: 50, icon: "👩‍💻", label: "Developer",     active: false },
          { id: "repo",     x: 35, y: 50, icon: "📦", label: "Git Repo",       active: false },
          { id: "ci",       x: 62, y: 50, icon: "⚙️",  label: "npm build ✓",   active: true  },
          { id: "hosting",  x: 88, y: 50, icon: "🌐", label: "Firebase Hosting", active: false },
        ],
        packets: [{ id: "build", label: "folder out/ →", color: "#34d399", fromNode: "ci", toNode: "hosting" }],
      },
      {
        id: "deploy",
        label: "Deploy ke Hosting",
        description:
          "CI upload folder out/ ke Firebase Hosting CDN. Hosting menyebarkan ke edge server global dengan HTTPS otomatis.",
        nodes: [
          { id: "dev",      x: 8,  y: 50, icon: "👩‍💻", label: "Developer",     active: false },
          { id: "repo",     x: 35, y: 50, icon: "📦", label: "Git Repo",       active: false },
          { id: "ci",       x: 62, y: 50, icon: "⚙️",  label: "CI",            active: false },
          { id: "hosting",  x: 88, y: 50, icon: "🌐", label: "Live ✓ HTTPS",   active: true  },
        ],
        packets: [{ id: "live", label: "https://nduttt.be ✓", color: "#22d3ee", fromNode: "hosting", toNode: "dev" }],
      },
    ],
  },
};

/* ================================================================
   OVERRIDE CONTENT — konten step yang disesuaikan per section
   Key format: "<topicId>:<sectionTitle>"
   ================================================================ */
const SECTION_OVERRIDES = {
  /* ─── HTTP ─── */
  "http:Dari mengetik URL sampai server menjawab": {
    conceptKey: "GET_REQUEST",
    titleOverride: "Client → Server → Kamu",
    subtitleOverride: "Alur request-response dari URL sampai halaman tampil",
  },
  "http:Anatomi URL: alamat yang menyimpan banyak informasi": {
    conceptKey: "GET_REQUEST",
    titleOverride: "GET Request + Anatomi URL",
    subtitleOverride: "Bagaimana path param & query param memengaruhi apa yang diambil",
  },
  "http:HTTP Method: kata kerja di balik request": {
    conceptKey: "POST_REQUEST",
    titleOverride: "HTTP Method: GET vs POST",
    subtitleOverride: "GET mengambil data, POST mengirim data baru ke server",
  },
  "http:Status Code: bahasa singkat server": {
    conceptKey: "GET_REQUEST",
    titleOverride: "Request → Status Code",
    subtitleOverride: "Server menjawab dengan kode yang berbeda tergantung hasilnya",
  },
  "http:Header & Body: amplop dan isi surat": {
    conceptKey: "POST_REQUEST",
    titleOverride: "POST dengan Header & Body",
    subtitleOverride: "Header = amplop metadata, Body = isi data yang dikirim",
  },
  "http:Stateless & kenapa login butuh session": {
    conceptKey: "AUTH_FLOW",
    titleOverride: "HTTP Stateless + Session",
    subtitleOverride: "Server tidak ingat kamu — token/session dipakai untuk membuktikan identitas",
  },

  /* ─── REST ─── */
  "rest:API adalah kontrak, bukan sekadar URL": {
    conceptKey: "GET_REQUEST",
    titleOverride: "GET Request = Kontrak Terpenuhi",
    subtitleOverride: "Client tahu apa yang diminta, server tahu apa yang harus dikirim",
  },
  "rest:Prinsip REST yang perlu kamu pegang": {
    conceptKey: "GET_REQUEST",
    titleOverride: "REST: Resource-Oriented Request",
    subtitleOverride: "URL menyebut benda, method menyebut aksi, response selalu konsisten",
  },
  "rest:Menamai endpoint dengan benar": {
    conceptKey: "GET_REQUEST",
    titleOverride: "Naming & GET /api/hearts",
    subtitleOverride: "Noun jamak, huruf kecil, path param untuk identitas",
  },
  "rest:Path param vs query param": {
    conceptKey: "GET_REQUEST",
    titleOverride: "GET /hearts/17 vs GET /hearts?page=2",
    subtitleOverride: "Path param = identitas spesifik, query param = filter opsional",
  },
  "rest:CRUD lengkap dengan REST": {
    conceptKey: "POST_REQUEST",
    titleOverride: "POST → CREATE Resource",
    subtitleOverride: "Siklus CRUD: POST buat, GET baca, PATCH ubah, DELETE hapus",
  },
  "rest:Response yang konsisten: data, meta, dan error": {
    conceptKey: "GET_REQUEST",
    titleOverride: "Response { data, meta, error }",
    subtitleOverride: "Bentuk response konsisten membuat frontend lebih mudah",
  },
  "rest:Routing di Next.js App Router": {
    conceptKey: "MIDDLEWARE",
    titleOverride: "Request → Next.js Route Handler",
    subtitleOverride: "Folder route.js menangani method GET/POST/PATCH/DELETE",
  },

  /* ─── NODE ─── */
  "node:JavaScript di browser vs Node.js": {
    conceptKey: "GET_REQUEST",
    titleOverride: "Node.js Menerima Request",
    subtitleOverride: "Node.js = JavaScript di server yang bisa menangani HTTP",
  },
  "node:Async/await: kenapa backend banyak menunggu": {
    conceptKey: "GET_REQUEST",
    titleOverride: "Async: Server Menunggu Database",
    subtitleOverride: "await membuat Node menunggu tanpa memblokir request lain",
  },
  "node:Server Node pertama": {
    conceptKey: "MIDDLEWARE",
    titleOverride: "Server Node: Terima & Balas Request",
    subtitleOverride: "http.createServer → routing manual → kirim response",
  },

  /* ─── DB ─── */
  "db:Kenapa aplikasi butuh database": {
    conceptKey: "DATABASE_QUERY",
    titleOverride: "Server → Database: Data Persisten",
    subtitleOverride: "Database menyimpan data sehingga tidak hilang saat server restart",
  },
  "db:SQL vs NoSQL: memilih model data": {
    conceptKey: "DATABASE_QUERY",
    titleOverride: "Query SQL vs Dokumen NoSQL",
    subtitleOverride: "SQL: tabel relasional, NoSQL: dokumen fleksibel",
  },
  "db:CRUD dengan SQL": {
    conceptKey: "DATABASE_QUERY",
    titleOverride: "SQL CRUD di Database",
    subtitleOverride: "SELECT, INSERT, UPDATE, DELETE — empat perintah dasar",
  },
  "db:Primary Key, Foreign Key, dan relasi": {
    conceptKey: "DATABASE_QUERY",
    titleOverride: "JOIN: Gabungkan Dua Tabel",
    subtitleOverride: "Primary key + foreign key + JOIN menghasilkan data terintegrasi",
  },
  "db:Index: daftar isi untuk query cepat": {
    conceptKey: "DATABASE_QUERY",
    titleOverride: "Index Scan vs Sequential Scan",
    subtitleOverride: "Index seperti daftar isi: langsung ke baris yang dicari",
  },
  "db:Transaksi & ACID": {
    conceptKey: "DATABASE_QUERY",
    titleOverride: "BEGIN → query → COMMIT / ROLLBACK",
    subtitleOverride: "Transaksi menjamin semua operasi berhasil atau tidak sama sekali",
  },
  "db:Latihan: query ranking pemain": {
    conceptKey: "DATABASE_QUERY",
    titleOverride: "SELECT + JOIN + ORDER BY + LIMIT",
    subtitleOverride: "Gabungkan relasi, filter, sort, dan limit dalam satu query",
  },

  /* ─── AUTH ─── */
  "auth:Authentication vs authorization": {
    conceptKey: "AUTH_FLOW",
    titleOverride: "Autentikasi vs Otorisasi",
    subtitleOverride: "401 = belum login, 403 = sudah login tapi tidak punya izin",
  },
  "auth:Password: hash, salt, dan bcrypt": {
    conceptKey: "AUTH_FLOW",
    titleOverride: "Hash Password di Auth Server",
    subtitleOverride: "bcrypt.hash saat daftar, bcrypt.compare saat login",
  },
  "auth:Session vs JWT": {
    conceptKey: "AUTH_FLOW",
    titleOverride: "Session Cookie vs JWT Token",
    subtitleOverride: "Session: state di server, JWT: claims di dalam token",
  },
  "auth:Anatomi JWT": {
    conceptKey: "AUTH_FLOW",
    titleOverride: "JWT: Header.Payload.Signature",
    subtitleOverride: "Payload terbaca siapa pun — hanya signature yang tidak bisa dipalsukan",
  },
  "auth:Middleware: satpam di pintu masuk": {
    conceptKey: "MIDDLEWARE",
    titleOverride: "Auth Middleware Pipeline",
    subtitleOverride: "Token → verify → req.user → handler (atau tolak 401)",
  },
  "auth:Serangan umum dan cara mencegahnya": {
    conceptKey: "MIDDLEWARE",
    titleOverride: "Pertahanan Berlapis",
    subtitleOverride: "SQL injection, XSS, CSRF, IDOR — middleware & query aman sebagai tameng",
  },

  /* ─── QUALITY ─── */
  "quality:Error yang jelas lebih baik daripada error yang hilang": {
    conceptKey: "ERROR_FLOW",
    titleOverride: "400 vs 500: Error yang Berbeda Makna",
    subtitleOverride: "4xx = kesalahan client, 5xx = masalah server",
  },
  "quality:Validasi input di server": {
    conceptKey: "ERROR_FLOW",
    titleOverride: "Validasi Tolak Request Tidak Valid",
    subtitleOverride: "Schema Zod memeriksa body sebelum menyentuh database",
  },
  "quality:try/catch dan error async": {
    conceptKey: "ERROR_FLOW",
    titleOverride: "try/catch Tangkap Error Async",
    subtitleOverride: "Tanpa try/catch, exception membuat request menggantung selamanya",
  },
  "quality:Memilih status code yang tepat": {
    conceptKey: "ERROR_FLOW",
    titleOverride: "Status Code = Komunikasi Server",
    subtitleOverride: "Frontend membuat keputusan berdasarkan status: 401→login, 403→izin, 404→kosong",
  },
  "quality:Testing API": {
    conceptKey: "POST_REQUEST",
    titleOverride: "Test: Kirim Request, Periksa Response",
    subtitleOverride: "Integration test mengirim request dan memverifikasi status + body",
  },

  /* ─── OPS ─── */
  "ops:Dari localhost ke internet": {
    conceptKey: "DEPLOY_PIPELINE",
    titleOverride: "localhost → Build → Production",
    subtitleOverride: "Urutan deploy: install → test → build → upload → cek health",
  },
  "ops:Static export & Firebase Hosting": {
    conceptKey: "DEPLOY_PIPELINE",
    titleOverride: "next build → Firebase Hosting",
    subtitleOverride: "Static export menghasilkan out/ yang di-host CDN global",
  },
  "ops:CI/CD: rilis otomatis yang bisa dipercaya": {
    conceptKey: "DEPLOY_PIPELINE",
    titleOverride: "git push → CI → Deploy Otomatis",
    subtitleOverride: "GitHub Actions: install → test → build → firebase deploy",
  },
  "ops:Monitoring, health check, dan rollback": {
    conceptKey: "DEPLOY_PIPELINE",
    titleOverride: "Monitor & Rollback",
    subtitleOverride: "Health check memantau aplikasi; rollback saat ada masalah",
  },
  "ops:Reverse proxy & HTTPS": {
    conceptKey: "GET_REQUEST",
    titleOverride: "Client → HTTPS → Nginx → App",
    subtitleOverride: "Reverse proxy terminasi TLS dan meneruskan ke aplikasi di port lokal",
  },

  /* ─── CAPSTONE ─── */
  "capstone:Rancang fitur & kontrak API": {
    conceptKey: "GET_REQUEST",
    titleOverride: "Kontrak API: dari cerita ke endpoint",
    subtitleOverride: "Setiap aksi punya method, path, input, output, dan error",
  },
  "capstone:Alur request end-to-end": {
    conceptKey: "POST_REQUEST",
    titleOverride: "POST End-to-End: Browser → API → DB",
    subtitleOverride: "Client → middleware → validasi → database → response → UI update",
  },
  "capstone:Bangun fitur create & read": {
    conceptKey: "POST_REQUEST",
    titleOverride: "Create (POST) & Read (GET)",
    subtitleOverride: "POST → validasi → INSERT → 201 | GET → SELECT → 200",
  },
  "capstone:Bangun fitur update & delete": {
    conceptKey: "DATABASE_QUERY",
    titleOverride: "UPDATE & DELETE di Database",
    subtitleOverride: "PATCH → UPDATE SET WHERE | DELETE → DELETE WHERE | cek kepemilikan",
  },
  "capstone:Auth & proteksi endpoint": {
    conceptKey: "MIDDLEWARE",
    titleOverride: "Auth Middleware di Capstone",
    subtitleOverride: "Login → JWT → middleware verify → handler (401 / 403 / 200)",
  },
  "capstone:Uji, deploy, dan rawat": {
    conceptKey: "DEPLOY_PIPELINE",
    titleOverride: "Test → Build → Deploy → Monitor",
    subtitleOverride: "Definition of done: test hijau, deploy sukses, health check OK",
  },
};

/* ================================================================
   HELPER: resolve concept + override dari topicId + sectionTitle
   ================================================================ */
export function resolveAnimationConcept(topicId, sectionTitle) {
  const key = `${topicId}:${sectionTitle}`;
  const override = SECTION_OVERRIDES[key];
  if (override) return override.conceptKey;
  return null; // tidak ada animasi untuk section ini
}

/* ================================================================
   SUB-KOMPONEN: Node Badge
   ================================================================ */
function NodeBadge({ node, conceptColor }) {
  return (
    <motion.div
      layout
      animate={{ scale: node.active ? 1 : 0.88, opacity: node.active ? 1 : 0.38 }}
      transition={{ duration: 0.38, ease: "easeOut" }}
      className="absolute -translate-x-1/2 -translate-y-1/2"
      style={{ left: `${node.x}%`, top: `${node.y}%` }}
    >
      <div className="relative flex flex-col items-center gap-1" style={{ minWidth: 58 }}>
        {node.active && (
          <motion.div
            className="absolute rounded-full"
            animate={{ scale: [1, 1.55, 1], opacity: [0.55, 0, 0.55] }}
            transition={{ duration: 1.9, repeat: Infinity }}
            style={{
              background: `radial-gradient(circle, ${conceptColor.glow} 0%, transparent 70%)`,
              inset: "-10px",
            }}
          />
        )}
        <div
          className="relative z-10 grid h-11 w-11 place-items-center rounded-2xl text-xl shadow-md"
          style={{
            background: node.active
              ? `linear-gradient(135deg, ${conceptColor.from}22, ${conceptColor.to}44)`
              : "rgba(255,255,255,0.08)",
            border: `2px solid ${node.active ? conceptColor.from : "rgba(255,255,255,0.15)"}`,
            boxShadow: node.active
              ? `0 0 18px ${conceptColor.glow}, 0 4px 14px rgba(0,0,0,0.22)`
              : "0 2px 6px rgba(0,0,0,0.18)",
          }}
        >
          {node.icon}
        </div>
        <span
          className="relative z-10 whitespace-nowrap rounded-lg px-1.5 py-0.5 text-center text-[9px] font-bold leading-tight"
          style={{
            background: node.active ? `${conceptColor.from}28` : "rgba(255,255,255,0.08)",
            color: node.active ? "white" : "rgba(255,255,255,0.45)",
            maxWidth: 78,
          }}
        >
          {node.label}
        </span>
      </div>
    </motion.div>
  );
}

/* ================================================================
   SUB-KOMPONEN: Packet Particle
   ================================================================ */
function PacketParticle({ packet, nodes }) {
  const from = nodes.find((n) => n.id === packet.fromNode);
  const to   = nodes.find((n) => n.id === packet.toNode);
  if (!from || !to) return null;

  const dx = to.x - from.x;
  const dy = to.y - from.y;

  return (
    <motion.div
      key={packet.id}
      className="absolute z-20 -translate-x-1/2 -translate-y-1/2"
      style={{ left: `${from.x}%`, top: `${from.y}%` }}
      animate={{
        left:    [`${from.x}%`, `${from.x + dx * 0.5}%`, `${to.x}%`],
        top:     [`${from.y}%`, `${from.y + dy * 0.5 - 7}%`, `${to.y}%`],
        opacity: [0, 1, 1, 0.85, 0],
        scale:   [0.5, 1.1, 1, 0.9, 0.5],
      }}
      transition={{
        duration: 1.9,
        ease: "easeInOut",
        repeat: Infinity,
        repeatDelay: 0.5,
      }}
    >
      <div
        className="flex items-center gap-1 whitespace-nowrap rounded-full px-2 py-0.5 text-[9px] font-bold shadow-lg"
        style={{
          background: `linear-gradient(90deg, ${packet.color}ee, ${packet.color}aa)`,
          color: "white",
          boxShadow: `0 0 10px ${packet.color}77, 0 2px 6px rgba(0,0,0,0.28)`,
          border: `1px solid ${packet.color}`,
        }}
      >
        <motion.span
          animate={{ x: dx > 0 ? [0, 2, 0] : [0, -2, 0] }}
          transition={{ duration: 0.45, repeat: Infinity }}
        >
          {dx > 0 ? "→" : "←"}
        </motion.span>
        {packet.label}
      </div>
    </motion.div>
  );
}

/* ================================================================
   SUB-KOMPONEN: AnimationCanvas
   ================================================================ */
function AnimationCanvas({ step, conceptColor }) {
  // Beri jarak dari tepi kanan/kiri supaya node paling pinggir tidak terpotong,
  // terutama di layar HP yang kanvasnya sempit.
  const X_INSET = 9;
  const displayNodes = step.nodes.map((node) => ({
    ...node,
    x: X_INSET + (Number(node.x) / 100) * (100 - X_INSET * 2),
  }));

  return (
    <div
      className="relative h-44 w-full overflow-hidden rounded-2xl"
      style={{
        background: "linear-gradient(135deg, rgba(8,4,18,0.92), rgba(14,6,26,0.96))",
        border: `1px solid ${conceptColor.from}40`,
        boxShadow: `inset 0 0 36px rgba(0,0,0,0.45)`,
      }}
    >
      {/* Grid latar */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.055]"
        style={{
          backgroundImage: `linear-gradient(${conceptColor.from} 1px, transparent 1px), linear-gradient(90deg, ${conceptColor.from} 1px, transparent 1px)`,
          backgroundSize: "30px 30px",
        }}
      />

      {/* Konektor antar node */}
      <svg className="absolute inset-0 h-full w-full" style={{ pointerEvents: "none" }}>
        {displayNodes.map((a, i) =>
          displayNodes.slice(i + 1).map((b) => (
            <line
              key={`${a.id}-${b.id}`}
              x1={`${a.x}%`} y1={`${a.y}%`}
              x2={`${b.x}%`} y2={`${b.y}%`}
              stroke={`${conceptColor.from}1a`}
              strokeWidth="1"
              strokeDasharray="4 7"
            />
          ))
        )}
      </svg>

      {/* Node badges */}
      {displayNodes.map((node) => (
        <NodeBadge key={node.id} node={node} conceptColor={conceptColor} />
      ))}

      {/* Packet particles */}
      <AnimatePresence>
        {step.packets.map((p) => (
          <PacketParticle key={p.id} packet={p} nodes={displayNodes} />
        ))}
      </AnimatePresence>
    </div>
  );
}

/* ================================================================
   SUB-KOMPONEN: Step Indicator
   ================================================================ */
function StepIndicator({ steps, currentIndex, conceptColor }) {
  return (
    <div className="flex items-center justify-center gap-1.5">
      {steps.map((step, i) => (
        <motion.div
          key={step.id}
          animate={{ scale: i === currentIndex ? 1 : 0.72, opacity: i === currentIndex ? 1 : i < currentIndex ? 0.6 : 0.28 }}
          style={{
            width: i === currentIndex ? 20 : 8,
            height: 8,
            borderRadius: 4,
            background: i <= currentIndex
              ? `linear-gradient(90deg, ${conceptColor.from}, ${conceptColor.to})`
              : "rgba(255,255,255,0.18)",
            transition: "width 0.3s ease, background 0.3s ease",
          }}
        />
      ))}
    </div>
  );
}

/* ================================================================
   SUB-KOMPONEN: AnimationControls
   ================================================================ */
function AnimationControls({ isPlaying, onPlay, onPause, onPrev, onNext, onReplay, currentIndex, totalSteps, conceptColor }) {
  const base = "flex h-10 w-10 items-center justify-center rounded-xl font-bold transition-all focus:outline-none";
  return (
    <div className="flex items-center justify-center gap-2">
      <button type="button" onClick={onReplay} title="Ulangi" className={`${base} bg-white/10 text-white/60 hover:bg-white/18 hover:text-white`}>↩</button>
      <button type="button" onClick={onPrev} disabled={currentIndex === 0} title="Sebelumnya"
        className={`${base} bg-white/10 text-white/60 hover:bg-white/18 hover:text-white disabled:opacity-25 disabled:cursor-not-allowed`}>‹‹</button>

      <motion.button type="button" onClick={isPlaying ? onPause : onPlay}
        whileHover={{ scale: 1.08 }} whileTap={{ scale: 0.92 }} title={isPlaying ? "Jeda" : "Mainkan"}
        className={`${base} h-12 w-12 rounded-2xl text-white shadow-lg`}
        style={{ background: `linear-gradient(135deg, ${conceptColor.from}, ${conceptColor.to})`, boxShadow: `0 0 16px ${conceptColor.glow}, 0 4px 12px rgba(0,0,0,0.28)` }}>
        {isPlaying ? "⏸" : "▶"}
      </motion.button>

      <button type="button" onClick={onNext} disabled={currentIndex === totalSteps - 1} title="Berikutnya"
        className={`${base} bg-white/10 text-white/60 hover:bg-white/18 hover:text-white disabled:opacity-25 disabled:cursor-not-allowed`}>››</button>
      <div className="h-10 w-10" />
    </div>
  );
}

/* ================================================================
   KOMPONEN UTAMA: BackendAnimationModal
   ================================================================ */

/**
 * Props:
 *   concept   – "GET_REQUEST" | "POST_REQUEST" | "MIDDLEWARE" | "DATABASE_QUERY" | "AUTH_FLOW" | "ERROR_FLOW" | "DEPLOY_PIPELINE"
 *   isOpen    – boolean
 *   onClose   – function
 *   topicId   – string opsional (misal "http")
 *   sectionTitle – string opsional (misal "HTTP Method")
 *                  Keduanya dipakai untuk memilih override konten yang spesifik
 */
export default function BackendAnimationModal({ concept = "GET_REQUEST", isOpen, onClose, topicId, sectionTitle }) {
  // Resolve override jika topicId + sectionTitle tersedia
  const overrideKey = topicId && sectionTitle ? `${topicId}:${sectionTitle}` : null;
  const override = overrideKey ? SECTION_OVERRIDES[overrideKey] : null;
  const resolvedConcept = (override?.conceptKey) ?? concept;

  const conceptData = BASE_CONCEPTS[resolvedConcept] ?? BASE_CONCEPTS.GET_REQUEST;
  const { steps, color: conceptColor } = conceptData;

  const title    = override?.titleOverride    ?? conceptData.title;
  const subtitle = override?.subtitleOverride ?? conceptData.subtitle;

  const [currentStep, setCurrentStep] = useState(0);
  const [isPlaying, setIsPlaying]     = useState(false);
  const intervalRef = useRef(null);

  const stopAutoPlay = useCallback(() => {
    clearInterval(intervalRef.current);
    setIsPlaying(false);
  }, []);

  useEffect(() => {
    if (isOpen) { setCurrentStep(0); setIsPlaying(false); }
    return () => clearInterval(intervalRef.current);
  }, [isOpen, resolvedConcept]);

  const startAutoPlay = useCallback(() => {
    setIsPlaying(true);
    intervalRef.current = setInterval(() => {
      setCurrentStep((prev) => {
        if (prev >= steps.length - 1) { stopAutoPlay(); return prev; }
        return prev + 1;
      });
    }, 2300);
  }, [steps.length, stopAutoPlay]);

  const handlePlay   = () => { if (!isPlaying) startAutoPlay(); };
  const handlePause  = () => stopAutoPlay();
  const handleNext   = () => { stopAutoPlay(); setCurrentStep((p) => Math.min(p + 1, steps.length - 1)); };
  const handlePrev   = () => { stopAutoPlay(); setCurrentStep((p) => Math.max(p - 1, 0)); };
  const handleReplay = () => { stopAutoPlay(); setCurrentStep(0); };
  const handleClose  = () => { stopAutoPlay(); onClose?.(); };

  useEffect(() => {
    if (!isOpen) return undefined;
    const onKey = (e) => { if (e.key === "Escape") handleClose(); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [isOpen]);

  const step = steps[currentStep];

  // Badge warna per konsep
  const conceptBadgeLabel = {
    GET_REQUEST:     "GET Request",
    POST_REQUEST:    "POST Request",
    MIDDLEWARE:      "Middleware",
    DATABASE_QUERY:  "SQL Query",
    AUTH_FLOW:       "Auth Flow",
    ERROR_FLOW:      "Error Handling",
    DEPLOY_PIPELINE: "Deploy Pipeline",
  }[resolvedConcept] ?? resolvedConcept;

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 z-[200] flex items-center justify-center p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.22 }}
          onClick={handleClose}
          style={{ background: "rgba(4,0,12,0.80)", backdropFilter: "blur(7px)" }}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.87, y: 30 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 16 }}
            transition={{ type: "spring", stiffness: 310, damping: 28 }}
            onClick={(e) => e.stopPropagation()}
            className="relative w-full max-w-2xl overflow-hidden rounded-3xl shadow-2xl"
            style={{
              background: "linear-gradient(160deg, rgba(16,6,28,0.98), rgba(8,4,20,0.99))",
              border: `1.5px solid ${conceptColor.from}50`,
              boxShadow: `0 0 55px ${conceptColor.glow}, 0 24px 80px rgba(0,0,0,0.65)`,
            }}
          >
            {/* Header */}
            <div
              className="relative overflow-hidden px-6 pb-4 pt-5"
              style={{
                background: `linear-gradient(135deg, ${conceptColor.from}1e 0%, ${conceptColor.to}0c 100%)`,
                borderBottom: `1px solid ${conceptColor.from}28`,
              }}
            >
              <div
                className="pointer-events-none absolute inset-0 opacity-[0.08]"
                style={{
                  backgroundImage: `radial-gradient(circle at 15% 50%, ${conceptColor.from} 0%, transparent 50%), radial-gradient(circle at 85% 50%, ${conceptColor.to} 0%, transparent 50%)`,
                }}
              />
              <div className="relative flex items-start justify-between gap-3">
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <span
                      className="rounded-lg px-2 py-0.5 text-[9px] font-black uppercase tracking-widest"
                      style={{ background: `${conceptColor.from}28`, color: conceptColor.from }}
                    >
                      Visualisasi
                    </span>
                    <span className="rounded-lg px-2 py-0.5 text-[9px] font-bold text-white/35"
                      style={{ background: "rgba(255,255,255,0.06)" }}>
                      {conceptBadgeLabel}
                    </span>
                    {sectionTitle && (
                      <span className="hidden text-[9px] text-white/28 sm:block">
                        · {sectionTitle}
                      </span>
                    )}
                  </div>
                  <h2 className="mt-1.5 text-xl font-black text-white">{title}</h2>
                  <p className="mt-0.5 text-[11px] leading-relaxed text-white/50">{subtitle}</p>
                </div>
                <button type="button" onClick={handleClose}
                  className="shrink-0 rounded-xl p-2 text-white/45 transition-all hover:bg-white/10 hover:text-white">
                  ✕
                </button>
              </div>
            </div>

            {/* Body */}
            <div className="space-y-3.5 p-5">
              <AnimationCanvas step={step} conceptColor={conceptColor} />

              {/* Deskripsi step */}
              <AnimatePresence mode="wait">
                <motion.div
                  key={`${resolvedConcept}-${currentStep}`}
                  initial={{ opacity: 0, y: 7 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -7 }}
                  transition={{ duration: 0.2 }}
                  className="rounded-2xl px-4 py-3"
                  style={{
                    background: `linear-gradient(135deg, ${conceptColor.from}12, ${conceptColor.to}07)`,
                    border: `1px solid ${conceptColor.from}20`,
                  }}
                >
                  <div className="flex items-start gap-2.5">
                    <span
                      className="mt-0.5 grid h-6 w-6 shrink-0 place-items-center rounded-lg text-[11px] font-black text-white"
                      style={{ background: `linear-gradient(135deg, ${conceptColor.from}, ${conceptColor.to})` }}
                    >
                      {currentStep + 1}
                    </span>
                    <div>
                      <p className="text-sm font-bold text-white">{step.label}</p>
                      <p className="mt-0.5 text-[11px] leading-relaxed text-white/60">{step.description}</p>
                    </div>
                  </div>
                </motion.div>
              </AnimatePresence>

              <StepIndicator steps={steps} currentIndex={currentStep} conceptColor={conceptColor} />

              <AnimationControls
                isPlaying={isPlaying} onPlay={handlePlay} onPause={handlePause}
                onNext={handleNext} onPrev={handlePrev} onReplay={handleReplay}
                currentIndex={currentStep} totalSteps={steps.length} conceptColor={conceptColor}
              />

              {/* Progress bar */}
              <div className="h-1 w-full overflow-hidden rounded-full bg-white/[0.08]">
                <motion.div
                  className="h-full rounded-full"
                  animate={{ width: `${((currentStep + 1) / steps.length) * 100}%` }}
                  transition={{ duration: 0.32, ease: "easeOut" }}
                  style={{
                    background: `linear-gradient(90deg, ${conceptColor.from}, ${conceptColor.to})`,
                    boxShadow: `0 0 8px ${conceptColor.glow}`,
                  }}
                />
              </div>

              <p className="text-center text-[10px] text-white/28">
                Langkah {currentStep + 1} dari {steps.length} — tekan Escape untuk menutup
              </p>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
