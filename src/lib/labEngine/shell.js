import { L } from "./shared";

export function createShellState() {
  return {
    built: false,
    started: false,
    deployed: false,
    committed: false,
    pushed: false,
    deps: false,
    committedMessage: "",
    deployUrl: "https://tuanputri-cde07.web.app",
  };
}

function httpLine(method, path, status, body, headers = [["Content-Type", "application/json"]]) {
  return L.http({
    method,
    path,
    status,
    statusText: status === 200 ? "OK" : status === 404 ? "Not Found" : "Error",
    headers,
    body,
    ms: 9 + (path.length % 23),
  });
}

function helpLines() {
  return [
    L.info("Terminal deployment (simulasi)"),
    L.text("  npm ci · npm run build · npm start · npm test"),
    L.text("  env · cat .env · cat package.json · cat firebase.json"),
    L.text("  firebase deploy · firebase hosting:rollback"),
    L.text("  curl http://localhost:3000/api/health · curl https://tuanputri-cde07.web.app"),
    L.text("  git status · git add . · git commit -m \"pesan\" · git push"),
    L.muted("Urutan yang sehat: build → test → deploy → cek health → monitor."),
  ];
}

export function runShellCommand(rawInput, state) {
  const raw = rawInput.trim();
  if (!raw) return { lines: [], events: [] };
  if (/^help$/i.test(raw)) return { lines: helpLines(), events: [] };
  if (/^(clear|cls)$/i.test(raw)) return { lines: [], events: [], clear: true };

  if (/^ls$/i.test(raw)) {
    return {
      events: [],
      lines: [L.text(".env  .github/  firebase.json  next.config.mjs  out/  package.json  src/")],
    };
  }
  if (/^pwd$/i.test(raw)) return { events: [], lines: [L.text("/home/ratih/nduttt-be")] };

  if (/^node\s+--version$/i.test(raw)) return { events: [], lines: [L.text("v20.11.1")] };
  if (/^npm\s+--version$/i.test(raw)) return { events: [], lines: [L.text("10.2.4")] };

  if (/^npm\s+(ci|install)$/i.test(raw)) {
    state.deps = true;
    return {
      events: ["ops:install"],
      lines: [
        L.info("npm ci"),
        L.success("added 248 packages in 12s"),
        L.muted("Dependency dipasang dari package-lock.json supaya versinya konsisten."),
      ],
    };
  }

  if (/^npm\s+run\s+build$/i.test(raw)) {
    if (!state.deps) {
      return {
        events: ["ops:build-fail"],
        lines: [L.error("Build gagal: node_modules belum ada. Jalankan `npm ci` dulu.")],
      };
    }
    state.built = true;
    return {
      events: ["ops:build"],
      lines: [
        L.info("> next build"),
        L.text("  ▲ Next.js 14.2.3"),
        L.text("  Creating an optimized production build ..."),
        L.success("  ✓ Compiled successfully"),
        L.success("  ✓ Generating static pages (9/9)"),
        L.text("  Route (app)                    Size     First Load JS"),
        L.text("  ○ /                           1.2 kB   89 kB"),
        L.text("  ○ /overview                   8.4 kB   120 kB"),
        L.success("\nExport complete. Hasil statis ada di folder out/."),
        L.muted("Sekarang bisa deploy ke Firebase Hosting (public: \"out\")."),
      ],
    };
  }

  if (/^npm\s+(test|run\s+lint)$/i.test(raw)) {
    return {
      events: ["ops:test"],
      lines: [
        L.info("Menjalankan pemeriksaan..."),
        L.success("  ✓ lint bersih"),
        L.success("  ✓ 12 test lulus"),
        L.success("\nSemua hijau. Aman untuk lanjut deploy."),
      ],
    };
  }

  if (/^npm\s+start$/i.test(raw)) {
    state.started = true;
    return {
      events: ["ops:start"],
      lines: [
        L.success("> next start"),
        L.success("  ▲ Next.js 14.2.3"),
        L.success("  - Local: http://localhost:3000"),
        L.success("  - Ready in 1.2s"),
        L.muted("Server produksi berjalan. Coba curl http://localhost:3000/api/health"),
      ],
    };
  }

  if (/^env$/i.test(raw)) {
    return {
      events: ["ops:env"],
      lines: [
        L.info("Environment variables yang terbaca (disamarkan):"),
        L.table(
          [
            "VARIABLE                             NILAI",
            "NEXT_PUBLIC_FIREBASE_PROJECT_ID      tuanputri-cde07",
            "NEXT_PUBLIC_FIREBASE_API_KEY         AIza••••••••••••••••",
            "JWT_SECRET                           ••••••••••••••••",
            "DATABASE_URL                         postgres://••••:••••@host/db",
          ].join("\n")
        ),
        L.muted("Variabel NEXT_PUBLIC_* ikut ke browser. Jangan taruh secret di sana."),
      ],
    };
  }

  if (/^cat\s+\.env$/i.test(raw)) {
    return {
      events: ["ops:env"],
      lines: [
        L.warn(".env berisi rahasia. File ini TIDAK boleh masuk Git."),
        L.code(
          [
            "NEXT_PUBLIC_FIREBASE_PROJECT_ID=tuanputri-cde07",
            "NEXT_PUBLIC_FIREBASE_API_KEY=AIza...",
            "JWT_SECRET=rahasia-super-panjang",
            "DATABASE_URL=postgres://user:pass@host:5432/nduttt",
          ].join("\n")
        ),
        L.info("Pastikan .env ada di .gitignore, dan pakai .env.example untuk dokumentasi."),
      ],
    };
  }

  if (/^cat\s+package\.json$/i.test(raw)) {
    return {
      events: [],
      lines: [
        L.code(`{
  "name": "nduttt-be",
  "version": "0.1.0",
  "private": true,
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start"
  },
  "dependencies": {
    "firebase": "^10.12.0",
    "framer-motion": "^11.2.0",
    "next": "14.2.3",
    "react": "^18.2.0"
  }
}`),
      ],
    };
  }

  if (/^cat\s+firebase\.json$/i.test(raw)) {
    return {
      events: [],
      lines: [
        L.code(`{
  "hosting": {
    "public": "out",
    "ignore": ["firebase.json", "**/.*", "**/node_modules/**"],
    "cleanUrls": true
  }
}`),
        L.muted("public: \"out\" berarti file hasil next build yang di-upload ke CDN Firebase."),
      ],
    };
  }

  if (/^cat\s+next\.config\.mjs$/i.test(raw)) {
    return {
      events: [],
      lines: [
        L.code(`const nextConfig = {
  output: "export",
  images: { unoptimized: true },
};
export default nextConfig;`),
        L.muted("output: \"export\" membuat HTML/CSS/JS statis, tanpa server Node 24 jam."),
      ],
    };
  }

  if (/^firebase\s+deploy$/i.test(raw)) {
    if (!state.built) {
      return {
        events: ["ops:deploy-fail"],
        lines: [L.error("Deploy dibatalkan: belum ada folder out/. Jalankan `npm run build` dulu.")],
      };
    }
    state.deployed = true;
    return {
      events: ["ops:deploy"],
      lines: [
        L.info("=== Deploying to 'tuanputri-cde07'..."),
        L.text("i  deploying hosting"),
        L.success("✔  hosting[tuanputri-cde07]: beginning deploy..."),
        L.success("✔  hosting[tuanputri-cde07]: found 9 files in out"),
        L.success("✔  hosting[tuanputri-cde07]: file upload complete"),
        L.success("✔  hosting[tuanputri-cde07]: finalizing version..."),
        L.success("✔  Deploy complete!"),
        L.info(`Hosting URL: ${state.deployUrl}`),
        L.muted("Sekarang coba curl https://tuanputri-cde07.web.app"),
      ],
    };
  }

  if (/^firebase\s+hosting:rollback$/i.test(raw)) {
    return {
      events: ["ops:rollback"],
      lines: [
        L.warn("Mengembalikan ke versi hosting sebelumnya..."),
        L.success("✔ Rollback selesai. Pengguna kembali ke build yang stabil."),
        L.muted("Rollback cepat adalah alasan kita deploy versi kecil dan sering."),
      ],
    };
  }

  if (/^curl\s+(.+)$/i.test(raw)) {
    const url = raw.replace(/^curl\s+/i, "").trim().replace(/^['"]|['"]$/g, "");
    if (/localhost:3000\/api\/health$/i.test(url)) {
      if (!state.started) {
        return {
          events: ["ops:health-fail"],
          lines: [L.error("curl: (7) Failed to connect to localhost port 3000"), L.warn("Jalankan `npm start` dulu.")],
        };
      }
      return {
        events: ["ops:health"],
        lines: [httpLine("GET", "/api/health", 200, { status: "ok", uptime: "18s", version: "1.0.0" })],
      };
    }
    if (/localhost:3000\/api\/hearts$/i.test(url)) {
      if (!state.started) {
        return { events: ["ops:health-fail"], lines: [L.error("curl: (7) Failed to connect to localhost port 3000")] };
      }
      return {
        events: ["ops:health"],
        lines: [httpLine("GET", "/api/hearts", 200, {
          data: [
            { id: 1, to: "Tuan Putri Ratih", note: "Semangat belajar backend!" },
            { id: 2, to: "Tuan Putri Ratih", note: "Jangan lupa istirahat." },
          ],
          meta: { count: 2 },
        })],
      };
    }
    if (/tuanputri-cde07\.web\.app\/?$/i.test(url)) {
      if (!state.deployed) {
        return { events: ["ops:health-fail"], lines: [L.error("curl: (6) Could not resolve host / website belum dideploy.")] };
      }
      return {
        events: ["ops:health"],
        lines: [httpLine("GET", "/", 200, "<!doctype html> ... halaman nduttt.be berhasil dimuat", [["Content-Type", "text/html; charset=utf-8"]])],
      };
    }
    if (/tuanputri-cde07\.web\.app\/api\/health$/i.test(url)) {
      if (!state.deployed) {
        return { events: ["ops:health-fail"], lines: [L.error("curl: (6) website belum dideploy.")] };
      }
      return {
        events: ["ops:health"],
        lines: [httpLine("GET", "/api/health", 200, { status: "ok", service: "nduttt-api" })],
      };
    }
    if (/https:\/\//i.test(url)) {
      return { events: [], lines: [L.error("Domain belum dikenal di lab. Coba URL tuanputri-cde07.web.app.")] };
    }
    return { events: [], lines: [L.error(`curl: ${url} tidak dikenali di lab.`)] };
  }

  if (/^git\s+status$/i.test(raw)) {
    return {
      events: [],
      lines: [
        L.text("On branch main"),
        L.text("Changes not staged for commit:"),
        L.text("  modified:   src/app/overview/page.jsx"),
        L.text("  modified:   src/data/quizData.js"),
        L.muted("Tidak ada secret yang ikut? Cek .gitignore sebelum commit."),
      ],
    };
  }
  if (/^git\s+add\s+\.$/i.test(raw)) {
    return { events: [], lines: [L.success("Perubahan dimasukkan ke staging area.")] };
  }
  if (/^git\s+commit\s+-m\s+(.+)$/i.test(raw)) {
    state.committed = true;
    state.committedMessage = raw.replace(/^git\s+commit\s+-m\s+/i, "").replace(/^['"]|['"]$/g, "");
    return {
      events: ["ops:commit"],
      lines: [L.success(`[main 8f3c1a2] ${state.committedMessage}`), L.text(" 3 files changed, 128 insertions(+)")],
    };
  }
  if (/^git\s+push$/i.test(raw)) {
    if (!state.committed) {
      return { events: ["ops:push-fail"], lines: [L.error("Tidak ada commit untuk di-push. Commit dulu.")] };
    }
    state.pushed = true;
    return {
      events: ["ops:push"],
      lines: [
        L.success("Enumerating objects: 12, done."),
        L.success("To github.com:tuanputri-cde07/nduttt-be.git"),
        L.success("   a1b2c3d..8f3c1a2  main -> main"),
        L.muted("Push memicu CI/CD: install → lint/test → build → deploy."),
      ],
    };
  }

  return {
    events: [],
    lines: [
      L.error("Perintah tidak dikenali di terminal deployment."),
      L.muted("Ketik help untuk daftar perintah. Contoh: npm run build"),
    ],
  };
}
