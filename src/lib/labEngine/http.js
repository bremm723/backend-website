import {
  L,
  STATUS_TEXT,
  STATUS_NOTES,
  DEMO_ACCOUNTS,
  errBody,
  parseBody,
  publicHeart,
  demoHash,
  verifyDemoHash,
  makeDemoJwt,
  decodeDemoJwt,
} from "./shared";

const JSON_HEADERS = [["Content-Type", "application/json; charset=utf-8"]];

export function createHttpState() {
  return {
    hearts: [
      {
        id: 1,
        to: "Tuan Putri Ratih",
        note: "Semangat belajar backend! Kamu pasti bisa.",
        from: "Admin Nduttt",
        createdAt: "2026-10-20T09:00:00.000Z",
      },
      {
        id: 2,
        to: "Tuan Putri Ratih",
        note: "Jangan lupa istirahat dan minum air putih.",
        from: "Sahabat",
        createdAt: "2026-10-24T14:30:00.000Z",
      },
      {
        id: 3,
        to: "Tuan Putri Ratih",
        note: "Satu level lagi, sedikit lagi tuntas!",
        from: "Admin Nduttt",
        createdAt: "2026-10-27T07:15:00.000Z",
      },
    ],
    nextId: 4,
    session: null,
    token: null,
    lastHash: null,
    lastJwt: null,
  };
}

function makeResponse(status, body, headers = JSON_HEADERS, extra = {}) {
  return {
    status,
    statusText: STATUS_TEXT[status] || "Unknown",
    body,
    headers,
    ms: 8 + (Math.abs(status * 7 + (extra.seed || 0)) % 41),
  };
}

function splitPath(rawPath) {
  const [pathPart, queryPart = ""] = rawPath.split("?");
  let path = pathPart.replace(/^https?:\/\/[^/]+/i, "");
  path = path.replace(/^\/api\/v\d+/i, "/api");
  if (path.length > 1 && path.endsWith("/")) path = path.slice(0, -1);
  return { path, params: new URLSearchParams(queryPart) };
}

function validateHeartInput(body, { partial = false } = {}) {
  const details = [];
  if (!partial || Object.prototype.hasOwnProperty.call(body, "to")) {
    if (typeof body.to !== "string" || !body.to.trim()) {
      details.push({ field: "to", issue: "wajib diisi dan harus berupa teks" });
    } else if (body.to.trim().length > 80) {
      details.push({ field: "to", issue: "maksimal 80 karakter" });
    }
  }
  if (body.note !== undefined) {
    if (typeof body.note !== "string") {
      details.push({ field: "note", issue: "harus berupa teks" });
    } else if (body.note.length > 280) {
      details.push({ field: "note", issue: "maksimal 280 karakter" });
    }
  }
  return details;
}

function requestHttp(state, method, rawPath, rawBody) {
  const events = [];
  const { path, params } = splitPath(rawPath);
  let body;
  if (rawBody !== undefined) {
    const parsed = parseBody(rawBody);
    if (parsed.error) {
      events.push("http:400");
      return {
        events,
        request: { method, path: rawPath, body: rawBody },
        response: makeResponse(400, parsed.error),
      };
    }
    body = parsed.body;
  }

  const send = (status, responseBody, headers = JSON_HEADERS, extra = {}) => {
    events.push(`http:${method}`);
    events.push(`http:status:${status}`);
    if (status >= 200 && status < 300) events.push(`http:${method.toLowerCase()}-success`);
    if ([400, 401, 403, 404, 405, 429, 500].includes(status)) events.push(`http:${status}`);
    if (extra.event) events.push(extra.event);
    return {
      events,
      request: { method, path: rawPath, body },
      response: makeResponse(status, responseBody, headers, extra),
    };
  };

  if (path === "/api/hearts") {
    if (method === "GET") {
      let list = [...state.hearts];
      const sort = params.get("sort");
      const search = params.get("search");
      const limit = Number(params.get("limit"));
      if (sort === "oldest") list.sort((a, b) => a.id - b.id);
      else if (sort === "newest") list.sort((a, b) => b.id - a.id);
      if (search) {
        const needle = search.toLowerCase();
        list = list.filter(
          (heart) =>
            heart.to.toLowerCase().includes(needle) ||
            heart.note.toLowerCase().includes(needle)
        );
      }
      if (Number.isFinite(limit) && limit > 0) list = list.slice(0, limit);
      if (sort) events.push("http:query-sort");
      if (limit) events.push("http:query-limit");
      return send(
        200,
        {
          data: list.map(publicHeart),
          meta: { count: list.length, total: state.hearts.length, page: 1 },
        },
        JSON_HEADERS,
        { event: "http:list" }
      );
    }

    if (method === "POST") {
      if (!body || typeof body !== "object" || Array.isArray(body)) {
        return send(400, errBody("INVALID_BODY", "Kirim object JSON, misalnya {\"to\":\"Ratih\"}."));
      }
      const details = validateHeartInput(body);
      if (details.length) {
        return send(400, errBody("VALIDATION_ERROR", "Data hati belum valid.", details));
      }
      const heart = {
        id: state.nextId,
        to: body.to.trim(),
        note: typeof body.note === "string" ? body.note.trim() : "",
        from: state.session?.name || "Anonim",
        createdAt: new Date().toISOString(),
      };
      state.nextId += 1;
      state.hearts.push(heart);
      return send(
        201,
        { data: publicHeart(heart) },
        [...JSON_HEADERS, ["Location", `/api/hearts/${heart.id}`]],
        { event: "http:create" }
      );
    }

    return send(
      405,
      errBody("METHOD_NOT_ALLOWED", `Method ${method} tidak didukung di /api/hearts.`),
      [...JSON_HEADERS, ["Allow", "GET, POST"]]
    );
  }

  const heartMatch = path.match(/^\/api\/hearts\/(\d+)$/);
  if (heartMatch) {
    const id = Number(heartMatch[1]);
    const heart = state.hearts.find((item) => item.id === id);

    if (method === "GET") {
      if (!heart) {
        return send(
          404,
          errBody("HEART_NOT_FOUND", `Hati dengan id ${id} tidak ditemukan.`)
        );
      }
      return send(200, { data: publicHeart(heart) }, JSON_HEADERS, { event: "http:detail" });
    }

    if (method === "PATCH" || method === "PUT") {
      if (!heart) {
        return send(
          404,
          errBody("HEART_NOT_FOUND", `Hati dengan id ${id} tidak ditemukan.`)
        );
      }
      if (!body || typeof body !== "object" || Array.isArray(body)) {
        return send(400, errBody("INVALID_BODY", "Kirim object JSON untuk mengubah hati."));
      }
      const details = validateHeartInput(body, { partial: method === "PATCH" });
      if (details.length) {
        return send(400, errBody("VALIDATION_ERROR", "Data perubahan belum valid.", details));
      }
      if (method === "PUT") {
        heart.to = body.to.trim();
        heart.note = typeof body.note === "string" ? body.note.trim() : "";
      } else {
        if (body.to !== undefined) heart.to = body.to.trim();
        if (body.note !== undefined) heart.note = body.note.trim();
      }
      return send(200, { data: publicHeart(heart) }, JSON_HEADERS, { event: "http:update" });
    }

    if (method === "DELETE") {
      if (!heart) {
        return send(
          404,
          errBody("HEART_NOT_FOUND", `Hati dengan id ${id} tidak ditemukan.`)
        );
      }
      state.hearts = state.hearts.filter((item) => item.id !== id);
      return send(204, null, [], { event: "http:delete" });
    }

    return send(
      405,
      errBody("METHOD_NOT_ALLOWED", `Method ${method} tidak didukung di endpoint ini.`),
      [...JSON_HEADERS, ["Allow", "GET, PATCH, PUT, DELETE"]]
    );
  }

  if (path === "/api/me") {
    if (!state.session) {
      return send(401, errBody("UNAUTHENTICATED", "Login dulu untuk membuka /api/me."));
    }
    return send(
      200,
      {
        data: {
          uid: state.session.uid,
          name: state.session.name,
          email: state.session.email,
          role: state.session.role,
        },
      },
      JSON_HEADERS,
      { event: "http:me-success" }
    );
  }

  if (path === "/api/admin") {
    if (!state.session) {
      return send(401, errBody("UNAUTHENTICATED", "Endpoint admin butuh login."));
    }
    if (state.session.role !== "owner") {
      return send(
        403,
        errBody("FORBIDDEN", "Kamu sudah login, tapi role-mu bukan owner.")
      );
    }
    return send(
      200,
      { data: { message: "Selamat datang, Admin. Ini area khusus owner." } },
      JSON_HEADERS,
      { event: "http:admin-success" }
    );
  }

  if (path === "/api/private") {
    return send(401, errBody("UNAUTHENTICATED", "Endpoint ini butuh token login."));
  }

  if (path === "/api/crash") {
    return send(
      500,
      errBody(
        "INTERNAL_SERVER_ERROR",
        "Terjadi kesalahan di server. Coba lagi atau hubungi admin."
      )
    );
  }

  if (path === "/api/limited") {
    return send(
      429,
      errBody("RATE_LIMITED", "Terlalu banyak request. Tunggu beberapa detik lalu coba lagi."),
      [...JSON_HEADERS, ["Retry-After", "10"]]
    );
  }

  if (path === "/api/health") {
    return send(
      200,
      { status: "ok", service: "nduttt-api", uptime: "42s", version: "1.0.0" },
      JSON_HEADERS,
      { event: "http:health" }
    );
  }

  return send(
    404,
    errBody("ROUTE_NOT_FOUND", `Endpoint ${method} ${path} tidak ada. Cek kembali path-nya.`)
  );
}

function handleLogin(state, raw) {
  const parts = raw.trim().split(/\s+/).slice(1);
  const email = (parts[0] || "").toLowerCase();
  const password = parts[1] || "";
  const account = DEMO_ACCOUNTS.find((item) => item.email === email);
  if (!account || account.password !== password) {
    return {
      events: ["auth:login-fail"],
      lines: [
        L.error("401 Unauthorized — email atau password salah."),
        L.muted("Akun demo: ratih@nduttt.be / rahasia  ·  admin@nduttt.be / admin123"),
      ],
    };
  }
  state.session = {
    uid: account.uid,
    email: account.email,
    name: account.name,
    role: account.role,
  };
  state.token = makeDemoJwt({
    sub: account.uid,
    name: account.name,
    role: account.role,
    exp: 1893456000,
  });
  return {
    events: ["auth:login", "http:login-success"],
    lines: [
      L.success(`Login berhasil sebagai ${account.name} (${account.role}).`),
      L.muted(`Token disimpan di memori lab: ${state.token.slice(0, 46)}...`),
      L.info("Sekarang coba: GET /api/me"),
    ],
  };
}

function handleAuthUtility(state, raw, options) {
  if (/^login\b/i.test(raw)) return handleLogin(state, raw);

  if (/^whoami$/i.test(raw)) {
    if (!state.session) {
      return {
        events: ["http:401"],
        lines: [L.error("Belum login. Server tidak tahu siapa kamu (401).")],
      };
    }
    return {
      events: [],
      lines: [
        L.success(
          `Kamu: ${state.session.name} · ${state.session.email} · role=${state.session.role}`
        ),
      ],
    };
  }

  if (/^logout$/i.test(raw)) {
    state.session = null;
    state.token = null;
    return {
      events: ["auth:logout"],
      lines: [L.success("Logout. Session dihapus dan token tidak dipakai lagi.")],
    };
  }

  if (/^hash\s+/i.test(raw)) {
    if (!options.auth) return null;
    const password = raw.replace(/^hash\s+/i, "");
    const hash = demoHash(password);
    state.lastHash = hash;
    return {
      events: ["auth:hash"],
      lines: [
        L.success("Password di-hash (simulasi bcrypt):"),
        L.code(hash),
        L.warn(
          "Ini simulasi untuk belajar. Di server asli, gunakan bcrypt/argon2 dengan cost factor 10-12."
        ),
      ],
    };
  }

  if (/^verify\b/i.test(raw)) {
    if (!options.auth) return null;
    const rest = raw.replace(/^verify\s*/i, "").trim();
    const firstSpace = rest.indexOf(" ");
    const password = firstSpace === -1 ? rest : rest.slice(0, firstSpace);
    const explicitHash = firstSpace === -1 ? "" : rest.slice(firstSpace + 1).trim();
    const hash = explicitHash || state.lastHash || "";
    if (!hash) {
      return {
        events: ["auth:verify-fail"],
        lines: [
          L.error("Belum ada hash untuk diverifikasi."),
          L.muted("Jalankan `hash rahasia` dulu, lalu `verify rahasia`."),
        ],
      };
    }
    const ok = verifyDemoHash(password, hash);
    return {
      events: [ok ? "auth:verify-ok" : "auth:verify-fail"],
      lines: [
        ok
          ? L.success("Cocok! Password dan hash memang berpasangan.")
          : L.error("Tidak cocok. Password berbeda, atau format hash-nya salah."),
        L.muted(explicitHash ? "Kamu memakai hash yang disalin sendiri." : "Hash yang dipakai adalah hasil `hash` terakhir."),
      ],
    };
  }

  if (/^jwt\s+encode\s+/i.test(raw)) {
    if (!options.auth) return null;
    const json = raw.replace(/^jwt\s+encode\s+/i, "");
    try {
      const payload = JSON.parse(json);
      const token = makeDemoJwt(payload);
      state.lastJwt = token;
      return {
        events: ["auth:jwt-encode"],
        lines: [
          L.success("JWT berhasil dibuat (signature simulasi):"),
          L.code(token),
          L.muted("Payload JWT hanya di-encode base64, bukan dienkripsi. Jangan simpan rahasia di sini."),
        ],
      };
    } catch {
      return {
        events: ["auth:jwt-encode-fail"],
        lines: [L.error("Payload harus JSON valid, misalnya {\"sub\":\"u_ratih\",\"role\":\"princess\"}.")],
      };
    }
  }

  const jwtDecodeMatch = raw.match(/^jwt\s+decode(?:\s+([\s\S]+))?$/i);
  if (jwtDecodeMatch) {
    if (!options.auth) return null;
    const token = (jwtDecodeMatch[1] || "").trim() || state.lastJwt || state.token || "";
    if (!token) {
      return {
        events: ["auth:jwt-decode-fail"],
        lines: [
          L.error("Belum ada token untuk di-decode."),
          L.muted("Buat token dulu dengan `jwt encode {...}`, lalu ketik `jwt decode`."),
        ],
      };
    }
    const decoded = decodeDemoJwt(token);
    if (decoded.error) {
      return { events: ["auth:jwt-decode-fail"], lines: [L.error(decoded.error)] };
    }
    return {
      events: ["auth:jwt-decode"],
      lines: [
        L.info("Header:"),
        L.code(JSON.stringify(decoded.header, null, 2)),
        L.info("Payload:"),
        L.code(JSON.stringify(decoded.payload, null, 2)),
        decoded.signatureValid
          ? L.success("Signature valid — isi token belum diubah.")
          : L.error("Signature TIDAK valid — payload diubah atau token palsu."),
        ...(jwtDecodeMatch[1]
          ? []
          : [L.muted("Token yang dipakai adalah hasil `jwt encode` terakhir (atau token login).")]),
      ],
    };
  }

  return null;
}

function helpLines(options) {
  return [
    L.info("Perintah HTTP"),
    L.text("  GET    /api/hearts"),
    L.text("  GET    /api/hearts/1?sort=newest"),
    L.text('  POST   /api/hearts {"to":"Ratih","note":"Halo!"}'),
    L.text('  PATCH  /api/hearts/1 {"note":"Catatan baru"}'),
    L.text("  DELETE /api/hearts/3"),
    L.info("Endpoint latihan"),
    L.text("  GET /api/me · GET /api/admin · GET /api/private · GET /api/crash · GET /api/limited"),
    L.info("Login & status"),
    L.text("  login ratih@nduttt.be rahasia"),
    L.text("  whoami · logout · status 404 · codes"),
    ...(options.auth
      ? [
          L.info("Perintah keamanan"),
          L.text("  hash rahasia"),
          L.text("  verify rahasia [hash]   · tanpa hash = pakai hash terakhir"),
          L.text('  jwt encode {"sub":"u_ratih","role":"princess"}'),
          L.text("  jwt decode [token]      · tanpa token = pakai encode terakhir"),
        ]
      : []),
    ...(options.test ? [L.info("Testing"), L.text("  test  → jalankan suite pengujian mini")] : []),
    L.muted("Method tidak peka huruf besar/kecil. Tekan ↑/↓ untuk riwayat perintah."),
  ];
}

function runTestSuite() {
  const checks = [
    ["GET /api/hearts membalas 200", true],
    ["POST dengan body valid membalas 201", true],
    ["POST tanpa field to membalas 400", true],
    ["GET /api/hearts/999 membalas 404", true],
    ["DELETE membalas 204 tanpa body", true],
  ];
  return {
    events: ["test:run"],
    lines: [
      L.info("Menjalankan test integrasi lab..."),
      ...checks.map(([label, ok]) => (ok ? L.success(`  ✓ ${label}`) : L.error(`  ✕ ${label}`))),
      L.success(`\n5 passed · 0 failed · ${checks.length} total`),
      L.muted("Ini simulasi. Di proyek asli, jalankan `npm test` dengan Vitest/Jest + Supertest."),
    ],
  };
}

export function runHttpCommand(rawInput, state, options = {}) {
  const raw = rawInput.trim();
  if (!raw) return { lines: [], events: [] };

  if (/^help$/i.test(raw)) return { lines: helpLines(options), events: [] };

  if (/^codes$/i.test(raw)) {
    return {
      events: [],
      lines: [
        L.info("Keluarga status code"),
        L.text("  2xx sukses · 3xx redirect · 4xx salah di sisi client · 5xx salah di server"),
        ...Object.keys(STATUS_NOTES).map((code) =>
          L.text(`  ${code} ${STATUS_TEXT[code]} — ${STATUS_NOTES[code]}`)
        ),
      ],
    };
  }

  const statusMatch = raw.match(/^status\s+(\d{3})$/i);
  if (statusMatch) {
    const code = Number(statusMatch[1]);
    return {
      events: [],
      lines: STATUS_NOTES[code]
        ? [L.info(`${code} ${STATUS_TEXT[code]}`), L.text(STATUS_NOTES[code])]
        : [L.error(`Status ${code} tidak ada di kamus lab. Coba 200, 201, 204, 400, 401, 403, 404, 500.`)],
    };
  }

  const authResult = handleAuthUtility(state, raw, options);
  if (authResult) return authResult;

  if (/^test$/i.test(raw) && options.test) return runTestSuite();

  const requestMatch = raw.match(/^(GET|POST|PUT|PATCH|DELETE|HEAD|OPTIONS)\s+(\S+)(?:\s+([\s\S]+))?$/i);
  if (requestMatch) {
    const method = requestMatch[1].toUpperCase();
    const path = requestMatch[2];
    const body = requestMatch[3];
    const result = requestHttp(state, method, path, body);
    return {
      events: result.events,
      lines: [
        L.http({
          method,
          path,
          status: result.response.status,
          statusText: result.response.statusText,
          headers: result.response.headers,
          body: result.response.body,
          ms: result.response.ms,
        }),
      ],
    };
  }

  return {
    events: [],
    lines: [
      L.error("Perintah tidak dikenali."),
      L.muted("Ketik help untuk melihat daftar perintah yang tersedia."),
      L.muted("Contoh: GET /api/hearts"),
    ],
  };
}

export { requestHttp };
