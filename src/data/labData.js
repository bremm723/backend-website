/**
 * Konfigurasi Lab Terminal per modul materi.
 * `engine` menentukan mesin simulasi yang dipakai (lihat src/lib/labEngine).
 * `event` pada missions dicocokkan dengan event yang dikirim mesin setelah perintah berhasil.
 */

export const LABS = {
  http: {
    id: "http",
    engine: "http",
    title: "Lab HTTP",
    subtitle: "Kirim request, baca response.",
    welcome: [
      "Halo Tuan Putri Ratih! Ini lab HTTP simulasi.",
      "Ketik `help` untuk daftar perintah, atau klik tombol contoh di materi.",
    ],
    quickCommands: [
      { label: "GET daftar", command: "GET /api/hearts" },
      { label: "POST hati", command: 'POST /api/hearts {"to":"Ratih","note":"Halo dari lab!"}' },
      { label: "Cari 404", command: "GET /api/hearts/999" },
      { label: "Coba 401", command: "GET /api/private" },
      { label: "Login", command: "login ratih@nduttt.be rahasia" },
    ],
    missions: [
      { id: "get-list", label: "Ambil daftar hati dengan GET", event: "http:list" },
      { id: "get-detail", label: "Ambil satu hati dengan /api/hearts/1", event: "http:detail" },
      { id: "create", label: "Buat hati baru dengan POST", event: "http:create" },
      { id: "not-found", label: "Temukan response 404", event: "http:404" },
      { id: "login-me", label: "Login lalu buka /api/me", event: "http:me-success" },
    ],
  },

  node: {
    id: "node",
    engine: "node",
    title: "Lab JavaScript",
    subtitle: "Coba JS & Node tanpa install apa pun.",
    welcome: [
      "Ini sandbox JavaScript mini. Semua berjalan di browser.",
      "Coba `console.log(\"Halo Ratih\")` atau `await api.get(\"/api/hearts\")`.",
    ],
    quickCommands: [
      { label: "Halo", command: 'console.log("Halo Ratih")' },
      { label: "Variabel", command: 'const nama = "Tuan Putri Ratih"' },
      { label: "Array", command: 'const hati = [{ to: "Ratih" }, { to: "Sahabat" }]' },
      { label: "Async API", command: 'const data = await api.get("/api/hearts")' },
      { label: "Server Node", command: "node server.js" },
      { label: "Curl", command: "curl localhost:3000/api/hearts" },
    ],
    missions: [
      { id: "console", label: "Cetak sesuatu dengan console.log", event: "js:console" },
      { id: "variable", label: "Buat variabel dengan const/let", event: "js:variable" },
      { id: "function", label: "Buat satu fungsi", event: "js:function" },
      { id: "array", label: "Olah array dengan map/filter", event: "js:array" },
      { id: "await", label: "Ambil data dengan await api.get()", event: "js:await" },
      { id: "server", label: "Jalankan node server.js", event: "node:server" },
    ],
  },

  rest: {
    id: "rest",
    engine: "http",
    title: "Lab REST",
    subtitle: "Latihan CRUD lewat endpoint.",
    welcome: [
      "Di sini kamu bisa mencoba endpoint REST seperti di API sungguhan.",
      "Coba `GET /api/hearts/1`, lalu `POST /api/hearts {...}`.",
    ],
    quickCommands: [
      { label: "GET list", command: "GET /api/hearts" },
      { label: "GET detail", command: "GET /api/hearts/1" },
      { label: "Filter", command: "GET /api/hearts?sort=newest&limit=2" },
      { label: "POST", command: 'POST /api/hearts {"to":"Ratih","note":"Hati baru"}' },
      { label: "PATCH", command: 'PATCH /api/hearts/1 {"note":"Sudah diubah"}' },
      { label: "DELETE", command: "DELETE /api/hearts/3" },
    ],
    missions: [
      { id: "list", label: "Ambil daftar resource", event: "http:list" },
      { id: "detail", label: "Ambil satu resource dengan path param", event: "http:detail" },
      { id: "query", label: "Pakai query param sort/limit", event: "http:query-sort" },
      { id: "create", label: "Buat resource dengan POST (201)", event: "http:create" },
      { id: "update", label: "Ubah resource dengan PATCH", event: "http:update" },
      { id: "delete", label: "Hapus resource dengan DELETE (204)", event: "http:delete" },
      { id: "validation", label: "Lihat error validasi 400", event: "http:400" },
    ],
  },

  db: {
    id: "db",
    engine: "sql",
    title: "Lab SQL",
    subtitle: "Query database tanpa takut rusak.",
    welcome: [
      "Ini database mini dengan tabel users, hearts, dan progress.",
      "Coba `SHOW TABLES;` lalu `SELECT * FROM users;`.",
    ],
    quickCommands: [
      { label: "Tabel", command: "SHOW TABLES;" },
      { label: "Users", command: "SELECT * FROM users;" },
      { label: "Hati", command: "SELECT * FROM hearts;" },
      { label: "Insert", command: "INSERT INTO hearts (owner_uid, note) VALUES ('u_ratih', 'Halo dari SQL!');" },
      { label: "Update", command: "UPDATE hearts SET note = 'Catatan baru' WHERE id = 2;" },
      { label: "JOIN", command: "SELECT users.display_name, progress.hearts_total FROM progress JOIN users ON progress.user_uid = users.uid;" },
      { label: "EXPLAIN", command: "EXPLAIN SELECT * FROM hearts WHERE id = 1;" },
    ],
    missions: [
      { id: "tables", label: "Lihat daftar tabel", event: "sql:list-tables" },
      { id: "select", label: "Ambil data dengan SELECT", event: "sql:select" },
      { id: "insert", label: "Tambahkan baris dengan INSERT", event: "sql:insert" },
      { id: "update", label: "Ubah baris dengan UPDATE + WHERE", event: "sql:update" },
      { id: "delete", label: "Hapus baris dengan DELETE + WHERE", event: "sql:delete" },
      { id: "join", label: "Gabungkan dua tabel dengan JOIN", event: "sql:join" },
      { id: "explain", label: "Baca rencana query dengan EXPLAIN", event: "sql:explain" },
    ],
  },

  auth: {
    id: "auth",
    engine: "auth",
    title: "Lab Auth",
    subtitle: "Login, hash, JWT, dan role.",
    welcome: [
      "Di sini kamu bisa mencoba login, hashing, dan JWT (simulasi).",
      "Akun demo: ratih@nduttt.be / rahasia · admin@nduttt.be / admin123",
    ],
    quickCommands: [
      { label: "Hash", command: "hash rahasia" },
      { label: "Login Ratih", command: "login ratih@nduttt.be rahasia" },
      { label: "Profil", command: "GET /api/me" },
      { label: "Admin 403", command: "GET /api/admin" },
      { label: "Login admin", command: "login admin@nduttt.be admin123" },
      { label: "JWT encode", command: 'jwt encode {"sub":"u_ratih","role":"princess","exp":1893456000}' },
    ],
    missions: [
      { id: "hash", label: "Hash sebuah password", event: "auth:hash" },
      { id: "login", label: "Login sebagai Ratih", event: "auth:login" },
      { id: "me", label: "Buka /api/me setelah login", event: "http:me-success" },
      { id: "forbidden", label: "Coba /api/admin dan dapatkan 403", event: "http:403" },
      { id: "admin", label: "Login admin lalu buka /api/admin", event: "http:admin-success" },
      { id: "jwt", label: "Buat JWT dengan payload", event: "auth:jwt-encode" },
    ],
  },

  quality: {
    id: "quality",
    engine: "quality",
    title: "Lab Testing",
    subtitle: "Uji error & jalankan test suite.",
    welcome: [
      "Lab ini fokus ke error handling, validasi, dan testing.",
      "Mulai dari `POST /api/hearts {}` untuk melihat 400.",
    ],
    quickCommands: [
      { label: "Validasi 400", command: "POST /api/hearts {}" },
      { label: "Not found 404", command: "GET /api/hearts/999" },
      { label: "Unauthorized 401", command: "GET /api/private" },
      { label: "Server error 500", command: "GET /api/crash" },
      { label: "Rate limit 429", command: "GET /api/limited" },
      { label: "Jalankan test", command: "test" },
    ],
    missions: [
      { id: "bad-request", label: "Picu error validasi 400", event: "http:400" },
      { id: "not-found", label: "Picu 404", event: "http:404" },
      { id: "unauthorized", label: "Picu 401", event: "http:401" },
      { id: "server-error", label: "Picu 500", event: "http:500" },
      { id: "test", label: "Jalankan test suite", event: "test:run" },
    ],
  },

  ops: {
    id: "ops",
    engine: "shell",
    title: "Lab Deploy",
    subtitle: "Build, deploy, dan cek kesehatan.",
    welcome: [
      "Ini terminal deployment simulasi. Tidak ada server yang benar-benar diubah.",
      "Urutan sehat: `npm ci` → `npm run build` → `npm test` → `firebase deploy` → `curl`.",
    ],
    quickCommands: [
      { label: "Install", command: "npm ci" },
      { label: "Build", command: "npm run build" },
      { label: "Test", command: "npm test" },
      { label: "Deploy", command: "firebase deploy" },
      { label: "Health", command: "curl https://tuanputri-cde07.web.app/api/health" },
      { label: "Env", command: "env" },
    ],
    missions: [
      { id: "install", label: "Install dependency", event: "ops:install" },
      { id: "build", label: "Build produksi", event: "ops:build" },
      { id: "test", label: "Jalankan test", event: "ops:test" },
      { id: "env", label: "Periksa environment variables", event: "ops:env" },
      { id: "deploy", label: "Deploy ke Firebase Hosting", event: "ops:deploy" },
      { id: "health", label: "Cek health endpoint", event: "ops:health" },
    ],
  },

  capstone: {
    id: "capstone",
    engine: "capstone",
    title: "Lab Capstone",
    subtitle: "Uji API Hati dari awal sampai akhir.",
    welcome: [
      "Ini ujian akhir yang santai: jalankan seluruh alur API Hati.",
      "Login, buat hati, baca, ubah, hapus, dan cek error.",
    ],
    quickCommands: [
      { label: "Login", command: "login ratih@nduttt.be rahasia" },
      { label: "Buat", command: 'POST /api/hearts {"to":"Ratih","note":"Hati dari capstone"}' },
      { label: "Baca", command: "GET /api/hearts" },
      { label: "Ubah", command: 'PATCH /api/hearts/4 {"note":"Sudah diubah"}' },
      { label: "Hapus", command: "DELETE /api/hearts/4" },
      { label: "Test", command: "test" },
    ],
    missions: [
      { id: "login", label: "Login ke API", event: "auth:login" },
      { id: "create", label: "Buat hati baru", event: "http:create" },
      { id: "read", label: "Baca daftar hati", event: "http:list" },
      { id: "update", label: "Ubah hati", event: "http:update" },
      { id: "delete", label: "Hapus hati", event: "http:delete" },
      { id: "not-found", label: "Tangani 404", event: "http:404" },
      { id: "test", label: "Jalankan test suite", event: "test:run" },
    ],
  },
};

export const getLab = (topicId) => LABS[topicId] || LABS.http;
