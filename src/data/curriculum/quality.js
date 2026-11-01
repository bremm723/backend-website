const module = {
  id: "quality",
  title: "Error Handling, Validasi & Testing",
  shortTitle: "Error & Testing",
  emoji: "🧪",
  badge: "Pendalaman",
  levelId: null,
  intro:
    "API yang baik bukan API yang tidak pernah error, tetapi API yang errornya jelas dan bisa ditangani. Di modul ini kamu belajar memvalidasi input, memilih status code, menangani exception, mencatat log, dan menguji endpoint sebelum user menemukan bug-nya.",
  goals: [
    "Membedakan error validasi, auth, dan server.",
    "Memvalidasi input di server dengan rapi.",
    "Menangani error async tanpa membuat request menggantung.",
    "Menulis test integrasi sederhana untuk API.",
    "Membaca log dan menelusuri bug secara sistematis.",
  ],
  sections: [
    {
      title: "Error yang jelas lebih baik daripada error yang hilang",
      body: [
        "Error adalah informasi. Kalau API gagal tetapi membalas 200 dengan body kosong, frontend tidak tahu harus berbuat apa. Kalau API membalas 500 untuk input yang salah, tim backend akan mencari bug di tempat yang salah.",
        "Bedakan error yang diharapkan (validasi, tidak ditemukan, belum login) dan error tak terduga (bug, database down). Error yang diharapkan punya status 4xx dan pesan yang jelas. Error tak terduga menjadi 500 dan detail internalnya hanya masuk log.",
        "Gunakan satu bentuk error yang konsisten: { error: { code, message, details } }. code untuk mesin, message untuk manusia, details untuk field yang bermasalah.",
        "Jangan membocorkan stack trace, query SQL, atau nama tabel ke client. Informasi itu berguna untuk penyerang. Simpan di log server, tampilkan pesan aman ke user.",
      ],
      examples: [
        {
          title: "Error yang bisa ditindaklanjuti",
          code: `POST /api/hearts
{ "to": "" }

400 Bad Request
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Data hati belum valid.",
    "details": [
      { "field": "to", "issue": "wajib diisi" }
    ]
  }
}`,
          output: `Frontend bisa menandai field "to" dan menampilkan pesan.
User tahu apa yang harus diperbaiki.`,
          note: "Pesan generik seperti 'Terjadi kesalahan' tidak membantu saat masalahnya ada di input.",
        },
      ],
      tip: "Tulis pesan error seolah kamu sedang menjelaskan ke temanmu: apa yang salah, di field mana, dan apa yang harus dilakukan.",
      practice: {
        prompt: "Picu error validasi dan perhatikan bentuk details-nya.",
        commands: [
          { label: "Body kosong", command: "POST /api/hearts {}" },
          { label: "Field kosong", command: 'POST /api/hearts {"to":""}' },
        ],
        hint: "Perhatikan bahwa status 400 disertai code dan details yang spesifik.",
      },
    },
    {
      title: "Validasi input di server",
      body: [
        "Frontend boleh memvalidasi untuk kenyamanan, tetapi server tetap wajib memvalidasi. Penyerang tidak memakai formmu; dia bisa mengirim request langsung dengan curl.",
        "Validasi mencakup: field wajib, tipe data, panjang, format (email/URL), rentang angka, dan nilai enum. Tolak field yang tidak dikenal kalau memang tidak dipakai, supaya data tidak membengkak.",
        "Gunakan library schema seperti Zod untuk aturan yang deklaratif. Contoh: z.string().min(1).max(80). Setelah parse, data yang lolos sudah bertipe dan bersih.",
        "Sanitasi berbeda dari validasi. Validasi memastikan data memenuhi aturan; sanitasi membersihkan karakter berbahaya untuk konteks tertentu. Untuk SQL, gunakan parameterized query; untuk HTML, escape saat menampilkan.",
      ],
      examples: [
        {
          title: "Schema validasi dengan Zod",
          code: `import { z } from "zod";

const heartSchema = z.object({
  to: z.string().trim().min(1, "wajib diisi").max(80),
  note: z.string().trim().max(280).optional().default(""),
});

const parsed = heartSchema.safeParse(body);
if (!parsed.success) {
  return Response.json(
    { error: { code: "VALIDATION_ERROR", message: "Data belum valid.", details: parsed.error.issues } },
    { status: 400 }
  );
}`,
          output: `Body { "to": "" }
→ 400 dengan details field "to"

Body { "to": "Ratih", "note": "Halo" }
→ lolos, data siap dipakai`,
          note: "Validasi di satu tempat membuat handler utama lebih bersih dan mudah diuji.",
        },
      ],
      warning: "Jangan mengandalkan validasi HTML (required, maxlength). Itu hanya untuk UX. Request bisa dikirim tanpa browser.",
      practice: {
        prompt: "Coba beberapa input tidak valid dan lihat bagaimana server menolaknya.",
        commands: [
          { label: "Tanpa to", command: "POST /api/hearts {}" },
          { label: "to kosong", command: 'POST /api/hearts {"to":""}' },
          { label: "Valid", command: 'POST /api/hearts {"to":"Ratih","note":"Valid!"}' },
        ],
        hint: "Input valid harus menghasilkan 201, bukan 400.",
      },
    },
    {
      title: "try/catch dan error async",
      body: [
        "Di JavaScript, error bisa dilempar dengan throw. Kalau tidak ditangkap, error akan naik ke atas dan bisa membuat proses/request gagal. try/catch menangkap error agar kamu bisa membalas response yang aman.",
        "Error async harus di-await di dalam try/catch. Kalau kamu lupa await, catch tidak akan menangkap error yang terjadi di Promise. Ini sumber bug yang sangat umum.",
        "Pisahkan error yang bisa diprediksi dari error tak terduga. Contoh: validasi → 400, tidak ditemukan → 404, konflik → 409. Error database yang tidak dikenal → log detail, balas 500 generik.",
        "Di framework, gunakan centralized error handler agar semua handler tidak menulis try/catch berulang. Middleware error bisa mencatat log, memberi request id, dan mengirim response konsisten.",
      ],
      examples: [
        {
          title: "Pola try/catch yang benar",
          code: `try {
  const heart = await db.hearts.findById(id);

  if (!heart) {
    return Response.json(
      { error: { code: "HEART_NOT_FOUND", message: "Hati tidak ditemukan." } },
      { status: 404 }
    );
  }

  return Response.json({ data: heart });
} catch (error) {
  console.error("Gagal mengambil hati:", error);
  return Response.json(
    { error: { code: "INTERNAL_SERVER_ERROR", message: "Terjadi kesalahan." } },
    { status: 500 }
  );
}`,
          output: `Tidak ditemukan → 404 dengan pesan jelas
Database error → 500 generik, detail hanya di log`,
          note: "Jangan menelan error tanpa log. Catch yang kosong membuat bug sulit dilacak.",
        },
      ],
      warning: "Jangan menampilkan error.message mentah dari database ke client. Pesan itu bisa berisi nama tabel, query, atau informasi internal.",
      practice: {
        prompt: "Bandingkan error yang bisa diprediksi (404) dengan error server (500).",
        commands: [
          { label: "404", command: "GET /api/hearts/999" },
          { label: "500", command: "GET /api/crash" },
        ],
        hint: "404 adalah error yang wajar. 500 berarti server gagal memproses; user tidak bisa memperbaikinya sendiri.",
      },
    },
    {
      title: "Memilih status code yang tepat",
      body: [
        "Status code adalah bagian dari kontrak API. Frontend sering mengambil keputusan berdasarkan status: 401 → redirect login, 403 → tampilkan pesan izin, 404 → halaman kosong, 409 → minta konflik diselesaikan.",
        "Untuk validasi input, 400 atau 422. 400 umum untuk request yang tidak valid secara umum; 422 untuk data yang formatnya benar tetapi tidak lolos aturan bisnis. Pilih satu dan konsisten.",
        "Untuk konflik data seperti email sudah terdaftar, gunakan 409 Conflict. Untuk rate limit, 429 dengan header Retry-After. Untuk method yang tidak didukung, 405 dengan header Allow.",
        "Untuk error tak terduga, 500. Untuk layanan eksternal yang gagal, 502/503. Jangan memakai 200 dengan { success: false } karena cache, monitoring, dan HTTP client akan menganggapnya sukses.",
      ],
      table: {
        head: ["Situasi", "Status", "Contoh"],
        rows: [
          ["Body tidak valid", "400", "JSON rusak"],
          ["Belum login", "401", "Token tidak ada"],
          ["Tidak punya izin", "403", "Role bukan owner"],
          ["Resource tidak ada", "404", "id 999"],
          ["Method salah", "405", "POST ke endpoint read-only"],
          ["Konflik", "409", "Email sudah terdaftar"],
          ["Rate limit", "429", "Terlalu banyak login"],
          ["Bug server", "500", "Exception tak tertangani"],
        ],
      },
      examples: [
        {
          title: "405 dengan header Allow",
          code: `POST /api/hearts/1

405 Method Not Allowed
Allow: GET, PATCH, PUT, DELETE
{
  "error": {
    "code": "METHOD_NOT_ALLOWED",
    "message": "Method POST tidak didukung di endpoint ini."
  }
}`,
          output: `Client tahu method apa yang boleh dipakai
tanpa harus menebak.`,
          note: "Header Allow membantu dokumentasi dan alat otomatis.",
        },
      ],
      tip: "Kalau bingung antara 400 dan 422, pilih 400 untuk kesederhanaan dan tulis details yang jelas. Konsistensi lebih penting daripada perdebatan semantik.",
      practice: {
        prompt: "Picu beberapa status code dan cocokkan dengan situasinya.",
        commands: [
          { label: "400", command: "POST /api/hearts {}" },
          { label: "401", command: "GET /api/private" },
          { label: "404", command: "GET /api/hearts/999" },
          { label: "429", command: "GET /api/limited" },
          { label: "500", command: "GET /api/crash" },
        ],
        hint: "Perhatikan bahwa setiap status membawa pesan error yang sesuai.",
      },
    },
    {
      title: "Logging & observability",
      body: [
        "Log adalah jejak yang membantumu memahami apa yang terjadi di production. Tanpa log, debugging hanya tebakan. Dengan log yang buruk, kamu tenggelam dalam noise.",
        "Gunakan log terstruktur (JSON) dengan field seperti timestamp, level, requestId, method, path, status, duration, dan userId. Jangan mencatat password, token, cookie, atau data pribadi sensitif.",
        "Level log membantu menyaring: debug untuk detail lokal, info untuk kejadian normal, warn untuk sesuatu yang mencurigakan, error untuk kegagalan yang perlu ditindaklanjuti.",
        "Tambahkan health check dan metrics: uptime, latency, error rate, jumlah request. Untuk error frontend/backend, gunakan error tracking seperti Sentry. Deploy tanpa monitoring sama seperti menyetir dengan mata tertutup.",
      ],
      examples: [
        {
          title: "Satu baris log yang berguna",
          code: `{
  "level": "info",
  "requestId": "req_8f3c1a2",
  "method": "POST",
  "path": "/api/hearts",
  "status": 201,
  "durationMs": 47,
  "userId": "u_ratih"
}`,
          output: `Kamu bisa menjawab:
- request apa yang lambat?
- endpoint mana yang sering error?
- user mana yang terdampak?`,
          note: "Request id memungkinkan kamu menghubungkan log dari beberapa service.",
        },
      ],
      warning: "Jangan pernah mencatat Authorization header, password, token, atau isi cookie. Log sering disimpan lama dan diakses banyak orang.",
      practice: {
        prompt: "Jalankan test suite dan lihat bagaimana hasil uji ditampilkan.",
        commands: [{ label: "Jalankan test", command: "test" }],
        hint: "Test suite adalah jaring pengaman sebelum deploy.",
      },
    },
    {
      title: "Testing API",
      body: [
        "Unit test menguji fungsi kecil secara terisolasi. Integration test menguji beberapa bagian bersama, misalnya route + validasi + database. End-to-end test menguji alur dari sisi user. Test pyramid menyarankan banyak unit test, cukup integration test, dan sedikit e2e.",
        "Untuk API, integration test sangat berharga: kirim request, periksa status, periksa body, periksa efek ke database. Ini menangkap bug kontrak yang tidak terlihat di unit test.",
        "Gunakan pola Arrange-Act-Assert: siapkan data, jalankan aksi, periksa hasil. Setiap test harus mandiri dan tidak bergantung pada urutan test lain.",
        "Test juga harus menguji jalur gagal: input tidak valid, belum login, tidak punya izin, resource tidak ditemukan. API yang hanya diuji jalur sukses akan rapuh.",
      ],
      examples: [
        {
          title: "Test integrasi dengan Supertest",
          code: `import request from "supertest";
import { app } from "../src/app";

test("POST /api/hearts tanpa field to → 400", async () => {
  const res = await request(app)
    .post("/api/hearts")
    .send({});

  expect(res.status).toBe(400);
  expect(res.body.error.code).toBe("VALIDATION_ERROR");
});

test("GET /api/hearts → 200", async () => {
  const res = await request(app).get("/api/hearts");
  expect(res.status).toBe(200);
  expect(Array.isArray(res.body.data)).toBe(true);
});`,
          output: `✓ POST tanpa to → 400
✓ GET daftar → 200
2 passed`,
          note: "Test yang baik menguji perilaku yang terlihat oleh client, bukan detail implementasi.",
        },
      ],
      tip: "Setiap kali memperbaiki bug, tambahkan test yang mereproduksi bug itu. Dengan begitu bug yang sama tidak kembali diam-diam.",
      practice: {
        prompt: "Jalankan seluruh test suite lab. Semua harus hijau.",
        commands: [{ label: "Test suite", command: "test" }],
        hint: "Di proyek asli, perintahnya `npm test` dan hasilnya keluar di terminal.",
      },
    },
    {
      title: "Alur debugging yang tidak panik",
      body: [
        "Mulai dari reproduksi: langkah apa yang memicu bug? Catat method, path, body, dan status. Tanpa reproduksi, perbaikan hanya tebakan.",
        "Baca error dari bawah ke atas. Stack trace menunjukkan tempat error dilempar, tetapi penyebabnya bisa lebih atas. Periksa log server dan request id.",
        "Isolasi: apakah masalahnya di frontend, network, route, validasi, database, atau response? Uji dengan curl/Postman untuk memisahkan lapisan.",
        "Setelah memperbaiki, tambahkan test regresi, deploy, lalu pantau log/error tracking. Jika bug berdampak ke user, siapkan rollback.",
      ],
      steps: [
        "Reproduksi bug dengan langkah minimal.",
        "Catat request, response, dan pesan error.",
        "Tentukan lapisan yang bermasalah (client, API, DB).",
        "Perbaiki akar masalah, bukan gejalanya.",
        "Tambahkan test regresi.",
        "Deploy dan pantau.",
      ],
      examples: [
        {
          title: "Pertanyaan yang mempercepat debugging",
          code: `1. Status code-nya apa?
2. Body error-nya apa?
3. Request-nya sampai ke server atau tidak?
4. Query database-nya error atau mengembalikan kosong?
5. Apakah hanya terjadi untuk user/role tertentu?
6. Apakah baru terjadi setelah deploy terakhir?`,
          output: `Pertanyaan yang tepat memotong ruang pencarian dari "seluruh aplikasi"
menjadi "satu lapisan kecil".`,
          note: "Debugging adalah proses menyempitkan kemungkinan, bukan menebak.",
        },
      ],
      tip: "Kalau bug hanya muncul di production, bandingkan environment: versi Node, env variables, data, dan konfigurasi. Jangan langsung menuduh kode.",
      practice: {
        prompt: "Tantangan terakhir: picu error, baca pesannya, lalu jalankan test untuk memastikan API tetap sehat.",
        commands: [
          { label: "Picu 400", command: "POST /api/hearts {}" },
          { label: "Picu 500", command: "GET /api/crash" },
          { label: "Test", command: "test" },
        ],
        hint: "Error bukan musuh. Error yang jelas adalah teman debugging.",
      },
    },
  ],
  summary: [
    "Error yang jelas lebih berguna daripada error yang disembunyikan.",
    "Validasi selalu dilakukan di server, bukan hanya di frontend.",
    "Tangani error async dengan try/catch dan log yang aman.",
    "Pilih status code sesuai situasi, bukan 200 untuk semuanya.",
    "Test jalur sukses dan jalur gagal.",
    "Debugging adalah menyempitkan kemungkinan secara sistematis.",
  ],
};

export default module;
