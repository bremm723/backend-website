const module = {
  id: "capstone",
  title: "Studi Kasus: API Hati End-to-End",
  shortTitle: "Studi Kasus",
  emoji: "💖",
  badge: "Pendalaman",
  levelId: null,
  intro:
    "Sekarang saatnya menyatukan semuanya. Kita akan merancang, membangun, menguji, dan men-deploy API Hati — fitur sederhana yang memakai HTTP, REST, database, auth, validasi, dan deployment. Tidak ada kode baru yang ajaib di sini; yang ada adalah alur berpikir seorang backend developer dari ide sampai production.",
  goals: [
    "Menerjemahkan cerita user menjadi kontrak API.",
    "Menggabungkan route, validasi, database, dan auth.",
    "Menguji seluruh alur CRUD dari sisi client.",
    "Memahami apa yang harus diperiksa sebelum deploy.",
  ],
  sections: [
    {
      title: "Rancang fitur & kontrak API",
      body: [
        "Mulai dari cerita user: Tuan Putri Ratih ingin mengirim hati kepada dirinya sendiri, melihat daftar hati, mengubah catatan, dan menghapus hati. Dari cerita ini kita turunkan resource, field, dan aksi.",
        "Resource-nya adalah heart. Field minimal: id, to, note, from, createdAt. Aksi: list, detail, create, update, delete. Setiap aksi punya method, path, input, output, dan error yang mungkin.",
        "Tulis kontrak sebelum coding. Kontrak menjadi acuan frontend, backend, dan test. Kalau kontrak berubah, semua pihak tahu dan bisa menyesuaikan.",
        "Untuk versi pertama, jangan menambah fitur yang belum dibutuhkan. API yang kecil tetapi jelas lebih baik daripada API besar yang setengah jadi.",
      ],
      table: {
        head: ["Aksi", "Endpoint", "Sukses", "Error"],
        rows: [
          ["List", "GET /api/hearts", "200", "500"],
          ["Detail", "GET /api/hearts/:id", "200", "404"],
          ["Create", "POST /api/hearts", "201", "400"],
          ["Update", "PATCH /api/hearts/:id", "200", "400/404"],
          ["Delete", "DELETE /api/hearts/:id", "204", "404"],
          ["Profile", "GET /api/me", "200", "401"],
          ["Admin", "GET /api/admin", "200", "401/403"],
        ],
      },
      examples: [
        {
          title: "Kontrak API Hati v1",
          code: `GET /api/hearts
→ 200 { data: Heart[], meta: { count, total, page } }

POST /api/hearts
← { "to": string, "note"?: string }
→ 201 { data: Heart } | 400 { error }

PATCH /api/hearts/:id
← { "to"?: string, "note"?: string }
→ 200 { data: Heart } | 400 | 404

DELETE /api/hearts/:id
→ 204 (tanpa body) | 404 { error }`,
          output: `Heart = {
  id: number,
  to: string,
  note: string,
  from: string,
  createdAt: ISO date
}`,
          note: "Kontrak ini yang akan kita uji satu per satu di lab.",
        },
      ],
      tip: "Kalau kontraknya jelas, menulis test menjadi mudah: setiap baris tabel bisa menjadi satu test case.",
      practice: {
        prompt: "Lihat dulu data yang sudah ada. Ini titik awal API Hati.",
        commands: [{ label: "Daftar hati", command: "GET /api/hearts" }],
        hint: "Perhatikan bentuk Heart di response. Field inilah yang dijanjikan kontrak.",
      },
    },
    {
      title: "Alur request end-to-end",
      body: [
        "Saat user membuka halaman dan menekan tombol, browser mengirim request ke API. Request melewati network, CDN/hosting, lalu mencapai server atau fungsi API.",
        "Di server, request melewati middleware (logging, auth, rate limit), lalu masuk ke handler. Handler memvalidasi input, mengakses database, membentuk response, dan mengirim status yang sesuai.",
        "Kalau ada error, handler atau centralized error handler mengubahnya menjadi response error yang konsisten. Log mencatat detail internal tanpa membocorkan ke client.",
        "Di sisi client, frontend membaca status code dan body. Kalau 401, arahkan ke login. Kalau 400, tampilkan error field. Kalau 200/201, perbarui tampilan. Inilah kontrak yang bekerja dua arah.",
      ],
      steps: [
        "User menekan tombol kirim hati.",
        "Frontend mengirim POST /api/hearts dengan JSON.",
        "Middleware mencatat request dan memeriksa auth jika perlu.",
        "Handler memvalidasi body.",
        "Handler menyimpan ke database.",
        "Server membalas 201 dengan data hati.",
        "Frontend menampilkan hati baru tanpa reload halaman.",
      ],
      examples: [
        {
          title: "Perjalanan satu request",
          code: `Browser
  → POST /api/hearts { "to": "Ratih" }
  → CDN / Hosting
  → API handler
  → validasi
  → database INSERT
  → 201 Created
  → browser memperbarui UI`,
          output: `Setiap panah adalah tempat yang bisa gagal.
Debugging menjadi mudah kalau kamu tahu panah mana yang bermasalah.`,
          note: "Jangan hanya melihat frontend. Error bisa terjadi di network, validasi, database, atau response.",
        },
      ],
      warning: "Jangan menaruh logika bisnis di komponen UI. Frontend boleh mengatur tampilan; keputusan izin dan validasi tetap di server.",
      practice: {
        prompt: "Buat satu hati baru, lalu baca kembali daftarnya. Perhatikan id yang bertambah.",
        commands: [
          { label: "Buat", command: 'POST /api/hearts {"to":"Ratih","note":"Hati dari capstone"}' },
          { label: "Baca", command: "GET /api/hearts" },
        ],
        hint: "Data awal berisi 3 hati, jadi hati baru biasanya mendapat id 4.",
      },
    },
    {
      title: "Bangun fitur create & read",
      body: [
        "Create adalah operasi paling sering diserang karena menerima input user. Validasi field wajib, tipe, panjang, dan isi. Jangan menyimpan data sebelum validasi lolos.",
        "Setelah validasi, buat resource dengan id baru dan timestamp. Simpan ke database. Balas 201 dengan data yang baru dibuat dan header Location.",
        "Read daftar sebaiknya mendukung pagination dan filter. Read detail harus memeriksa apakah resource ada. Kalau tidak ada, balas 404 dengan pesan yang aman.",
        "Jangan mengembalikan field internal yang tidak perlu (misalnya password hash, token, atau catatan admin). Response adalah bagian dari kontrak publik.",
      ],
      examples: [
        {
          title: "Handler create yang rapi",
          code: `export async function POST(request) {
  const body = await request.json();
  const details = validateHeart(body);

  if (details.length) {
    return Response.json(
      { error: { code: "VALIDATION_ERROR", message: "Data belum valid.", details } },
      { status: 400 }
    );
  }

  const heart = await db.hearts.create({
    to: body.to.trim(),
    note: (body.note || "").trim(),
    createdAt: new Date().toISOString(),
  });

  return Response.json({ data: heart }, { status: 201 });
}`,
          output: `Body valid   → 201 + data
Body invalid → 400 + details
Database err → 500 + pesan generik`,
          note: "Handler tetap pendek karena validasi dan akses database dipisahkan.",
        },
      ],
      tip: "Balas dengan data yang benar-benar tersimpan, bukan data yang kamu kira tersimpan. Frontend perlu id dan timestamp asli.",
      practice: {
        prompt: "Uji create dengan input valid dan tidak valid. Perhatikan perbedaan statusnya.",
        commands: [
          { label: "Valid", command: 'POST /api/hearts {"to":"Ratih","note":"Hati valid"}' },
          { label: "Invalid", command: "POST /api/hearts {}" },
        ],
        hint: "Input valid → 201. Input tidak valid → 400.",
      },
    },
    {
      title: "Bangun fitur update & delete",
      body: [
        "Update menerima hanya field yang boleh diubah. Jangan biarkan client mengubah id, owner, createdAt, atau role. Gunakan whitelist field.",
        "PATCH mengubah sebagian field. PUT mengganti seluruh representasi. Untuk update, periksa dulu resource ada, lalu validasi field baru, lalu simpan. Balas 200 dengan data terbaru.",
        "Delete harus memeriksa kepemilikan. User hanya boleh menghapus datanya sendiri. Kalau bukan pemilik, balas 404/403 tanpa membocorkan data.",
        "Setelah delete, balas 204 tanpa body. Kalau resource tidak ditemukan, balas 404. Jangan mengembalikan 200 dengan body kosong karena itu membingungkan client.",
      ],
      examples: [
        {
          title: "PATCH dan DELETE yang aman",
          code: `PATCH /api/hearts/4
{ "note": "Catatan baru" }
→ 200 { data: { id: 4, note: "Catatan baru", ... } }

DELETE /api/hearts/4
→ 204 (tanpa body)

GET /api/hearts/4
→ 404 { error: { code: "HEART_NOT_FOUND" } }`,
          output: `Update hanya mengubah field yang diizinkan.
Delete menghapus satu resource, bukan seluruh koleksi.`,
          note: "Perhatikan bahwa setelah delete, detail resource mengembalikan 404.",
        },
      ],
      warning: "Jangan menerima field `id` atau `owner` dari body update. Itu celah yang memungkinkan user memindahkan data ke akun lain.",
      practice: {
        prompt: "Ubah hati id 4, lalu hapus. Setelah dihapus, coba akses lagi untuk melihat 404.",
        commands: [
          { label: "Ubah", command: 'PATCH /api/hearts/4 {"note":"Sudah diubah di capstone"}' },
          { label: "Hapus", command: "DELETE /api/hearts/4" },
          { label: "Cek 404", command: "GET /api/hearts/4" },
        ],
        hint: "Pastikan hati id 4 sudah ada dari latihan sebelumnya. Kalau belum, jalankan POST dulu.",
      },
    },
    {
      title: "Auth & proteksi endpoint",
      body: [
        "Tidak semua endpoint harus publik. Profil dan area admin butuh login. Operasi create/update/delete bisa dibuat publik untuk demo, tetapi di aplikasi nyata biasanya butuh identitas.",
        "Alur auth: login → server memverifikasi kredensial → server mengirim token/session → client membawa token di request berikutnya → middleware memverifikasi → handler menerima req.user.",
        "Authorization dilakukan setelah authentication. Periksa role untuk endpoint admin, dan periksa kepemilikan untuk resource user. Jangan hanya memeriksa apakah user sudah login.",
        "Untuk API yang dipakai browser, simpan token di cookie HttpOnly, bukan localStorage. localStorage mudah dibaca script jika terjadi XSS.",
      ],
      examples: [
        {
          title: "Tiga level akses",
          code: `GET /api/hearts      → publik (200)
GET /api/me          → butuh login (401 tanpa token)
GET /api/admin       → butuh login + role owner
                        (401 tanpa login, 403 role salah)`,
          output: `Publik   : 200
Login    : 200
Tanpa login: 401
Role salah : 403`,
          note: "Status yang berbeda membantu frontend memberi respons yang tepat.",
        },
      ],
      warning: "Jangan pernah menaruh secret JWT di frontend. Signature dibuat dan diverifikasi di server. Frontend hanya membawa token.",
      practice: {
        prompt: "Login sebagai Ratih, coba admin (403), lalu login admin dan coba lagi (200).",
        commands: [
          { label: "Login Ratih", command: "login ratih@nduttt.be rahasia" },
          { label: "Profil", command: "GET /api/me" },
          { label: "Admin 403", command: "GET /api/admin" },
          { label: "Login admin", command: "login admin@nduttt.be admin123" },
          { label: "Admin 200", command: "GET /api/admin" },
        ],
        hint: "Perhatikan perbedaan 401 (belum login) dan 403 (sudah login, role salah).",
      },
    },
    {
      title: "Uji, deploy, dan rawat",
      body: [
        "Sebelum deploy, jalankan test untuk semua jalur: list, detail, create valid, create invalid, update, delete, 401, 403, 404, dan 500. Test yang hanya menguji happy path tidak cukup.",
        "Build production, deploy, lalu cek health endpoint dan halaman utama. Buka di mode incognito untuk memastikan tidak ada state lokal yang menutupi masalah.",
        "Pantau log dan error setelah deploy. Kalau ada masalah, rollback. Setelah stabil, dokumentasikan perubahan dan update kontrak API jika ada.",
        "Perawatan berkelanjutan: backup database, rotasi secret, perbarui dependency, tinjau rules, dan uji ulang alur auth. API yang baik dirawat, bukan hanya dibangun.",
      ],
      steps: [
        "Jalankan test suite lengkap.",
        "Build production.",
        "Deploy ke hosting.",
        "Cek halaman utama + health endpoint.",
        "Pantau error dan latency.",
        "Dokumentasikan perubahan.",
        "Siapkan rollback dan backup.",
      ],
      examples: [
        {
          title: "Definition of done",
          code: `[x] Semua endpoint punya test
[x] Input divalidasi di server
[x] Auth & authorization diuji
[x] Error konsisten
[x] Log aman (tanpa token/password)
[x] Build & deploy sukses
[x] Health check 200
[x] Rollback tersedia`,
          output: `Fitur selesai bukan saat kode ditulis,
tetapi saat ia aman dipakai dan bisa dirawat.`,
          note: "Ini checklist yang membedakan proyek latihan dari proyek yang siap dipakai.",
        },
      ],
      tip: "Rayakan setiap level yang selesai. Backend itu maraton, bukan sprint. Konsistensi kecil setiap hari mengalahkan semangat besar yang hanya sehari.",
      practice: {
        prompt: "Tantangan akhir: jalankan test suite untuk memastikan seluruh alur API tetap sehat. Latihan deploy ada di modul Deployment.",
        commands: [
          { label: "Test suite", command: "test" },
          { label: "Cek profil", command: "GET /api/me" },
        ],
        hint: "Login dulu kalau ingin /api/me membalas 200. Setelah itu buka Modul 7 untuk latihan build & deploy.",
      },
    },
  ],
  summary: [
    "Kontrak API diturunkan dari cerita user, bukan dari tabel database.",
    "Create/read/update/delete masing-masing punya validasi dan status yang tepat.",
    "Auth memeriksa identitas; authorization memeriksa izin dan kepemilikan.",
    "Test harus mencakup jalur sukses dan jalur gagal.",
    "Deploy bukan akhir; monitoring, backup, dan rollback adalah bagian dari pekerjaan.",
  ],
};

export default module;
