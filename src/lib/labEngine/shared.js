/**
 * Helper bersama untuk semua mesin Lab Terminal.
 * Semua simulasi berjalan di browser, tidak menyentuh server asli.
 */

export const STATUS_TEXT = {
  200: "OK",
  201: "Created",
  204: "No Content",
  301: "Moved Permanently",
  304: "Not Modified",
  400: "Bad Request",
  401: "Unauthorized",
  403: "Forbidden",
  404: "Not Found",
  405: "Method Not Allowed",
  409: "Conflict",
  422: "Unprocessable Entity",
  429: "Too Many Requests",
  500: "Internal Server Error",
  502: "Bad Gateway",
  503: "Service Unavailable",
};

export const STATUS_NOTES = {
  200: "Sukses. Server mengembalikan data di body.",
  201: "Resource baru berhasil dibuat. Biasanya balasan dari POST.",
  204: "Sukses, tapi sengaja tanpa body. Cocok untuk DELETE.",
  301: "Resource pindah permanen ke URL lain.",
  304: "Data belum berubah, browser boleh pakai cache.",
  400: "Request tidak valid: JSON rusak, field wajib kosong, atau tipe datanya salah.",
  401: "Belum terautentikasi. Server belum tahu siapa kamu.",
  403: "Sudah dikenali, tapi tidak punya izin (role atau kepemilikan).",
  404: "Resource tidak ditemukan di path itu.",
  405: "Method-nya tidak diizinkan untuk endpoint tersebut.",
  409: "Konflik data, misalnya email yang sudah terdaftar.",
  422: "Format benar, tetapi nilainya tidak lolos validasi bisnis.",
  429: "Terlalu banyak request. Pelan-pelan dulu.",
  500: "Ada bug atau exception di sisi server. Jangan bocorkan stack trace ke user.",
  502: "Reverse proxy tidak bisa menghubungi aplikasi di belakangnya.",
  503: "Server sedang tidak tersedia atau sibuk.",
};

export const DEMO_ACCOUNTS = [
  {
    email: "ratih@nduttt.be",
    password: "rahasia",
    name: "Tuan Putri Ratih",
    role: "princess",
    uid: "u_ratih",
  },
  {
    email: "admin@nduttt.be",
    password: "admin123",
    name: "Admin Nduttt",
    role: "owner",
    uid: "u_admin",
  },
];

export const L = {
  text: (text) => ({ kind: "text", text }),
  muted: (text) => ({ kind: "muted", text }),
  success: (text) => ({ kind: "success", text }),
  error: (text) => ({ kind: "error", text }),
  warn: (text) => ({ kind: "warn", text }),
  info: (text) => ({ kind: "info", text }),
  code: (text) => ({ kind: "code", text }),
  table: (text) => ({ kind: "table", text }),
  http: (payload) => ({ kind: "http", ...payload }),
};

export const errBody = (code, message, details) => ({
  error: {
    code,
    message,
    ...(details ? { details } : {}),
  },
});

export const publicHeart = (heart) => ({
  id: heart.id,
  to: heart.to,
  note: heart.note,
  from: heart.from,
  createdAt: heart.createdAt,
});

export function parseBody(raw) {
  if (!raw || !raw.trim()) return { body: undefined };
  let value = raw.trim();
  if (
    (value.startsWith("'") && value.endsWith("'")) ||
    (value.startsWith('"') && value.endsWith('"'))
  ) {
    value = value.slice(1, -1);
  }
  try {
    return { body: JSON.parse(value) };
  } catch {
    return {
      error: errBody(
        "INVALID_JSON",
        "Body bukan JSON yang valid. Periksa tanda kutip, koma, dan kurung kurawalnya.",
        [{ field: "body", issue: "JSON.parse gagal" }]
      ),
    };
  }
}

/* ---------- Simulasi hash & JWT (bukan kriptografi produksi) ---------- */

export function fnvHash(value) {
  let hash = 2166136261;
  for (let i = 0; i < value.length; i += 1) {
    hash ^= value.charCodeAt(i);
    hash = Math.imul(hash, 16777619);
  }
  return (hash >>> 0).toString(16).padStart(8, "0");
}

export function demoHash(password) {
  const salt = Math.random().toString(36).slice(2, 12);
  return `$2b$12$${salt}$${fnvHash(`${salt}:${password}`)}`;
}

export function verifyDemoHash(password, stored) {
  const match = String(stored).match(/^\$2b\$12\$([^$]+)\$([a-f0-9]{8})$/);
  if (!match) return false;
  return fnvHash(`${match[1]}:${password}`) === match[2];
}

export function base64UrlEncode(value) {
  const json = JSON.stringify(value);
  const encoded = btoa(unescape(encodeURIComponent(json)));
  return encoded.replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "");
}

export function base64UrlDecode(value) {
  const padded = value.replace(/-/g, "+").replace(/_/g, "/");
  const json = decodeURIComponent(escape(atob(padded)));
  return JSON.parse(json);
}

export function makeDemoJwt(payload) {
  const header = { alg: "HS256", typ: "JWT" };
  const head = base64UrlEncode(header);
  const body = base64UrlEncode(payload);
  const signature = fnvHash(`${head}.${body}.nduttt-demo-secret`);
  return `${head}.${body}.${signature}`;
}

export function decodeDemoJwt(token) {
  const parts = String(token).trim().split(".");
  if (parts.length !== 3) {
    return { error: "Token harus punya 3 bagian: header.payload.signature" };
  }
  try {
    const header = base64UrlDecode(parts[0]);
    const payload = base64UrlDecode(parts[1]);
    const expected = fnvHash(`${parts[0]}.${parts[1]}.nduttt-demo-secret`);
    return { header, payload, signatureValid: expected === parts[2] };
  } catch {
    return { error: "Token tidak bisa di-decode. Pastikan formatnya benar." };
  }
}

export function randomId() {
  return Math.random().toString(36).slice(2, 9);
}
