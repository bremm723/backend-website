const module = {
  id: "rest",
  title: "REST API & Routing",
  shortTitle: "REST API",
  emoji: "🛠️",
  badge: "Inti",
  levelId: 2,
  intro:
    "REST adalah cara menata API supaya mudah ditebak dan konsisten. URL menyebut benda (resource), method menyebut aksi, dan response selalu punya bentuk yang jelas. Kalau kamu bisa mendesain endpoint yang rapi, rekan frontend akan jauh lebih bahagia — dan bug akan lebih mudah dilacak.",
  goals: [
    "Menamai endpoint dengan pola resource, bukan kata kerja.",
    "Membedakan path param dan query param.",
    "Memetakan CRUD ke method dan status code.",
    "Mendesain response sukses dan error yang konsisten.",
    "Mengenali struktur routing di Next.js App Router.",
  ],
  sections: [
    {
      title: "API adalah kontrak, bukan sekadar URL",
      body: [
        "API (Application Programming Interface) adalah kesepakatan antara client dan server. Client mengirim request dengan bentuk tertentu; server berjanji membalas dengan bentuk tertentu pula. Selama kontraknya jelas, keduanya bisa dikembangkan terpisah.",
        "Kontrak API mencakup: endpoint apa saja yang ada, method apa yang dipakai, field apa yang dikirim, status code apa yang mungkin muncul, dan bentuk error-nya. Dokumentasi yang baik membuat orang lain bisa memakai API tanpa membaca kode server.",
        "API bukan hanya untuk frontend. Mobile app, layanan lain, dan tim data juga bisa memakainya. Karena itu, perubahan besar sebaiknya diberi versi (/api/v1) supaya klien lama tidak langsung rusak.",
        "Semakin jelas kontraknya, semakin mudah menguji dan merawat API. Endpoint yang namanya berubah-ubah atau response-nya tidak konsisten akan membuat semua orang menebak-nebak.",
      ],
      examples: [
        {
          title: "Kontrak sederhana untuk API Hati",
          code: `GET /api/hearts
→ 200 { data: [...], meta: { count } }

GET /api/hearts/:id
→ 200 { data: heart } | 404 { error }

POST /api/hearts
← { "to": "Ratih", "note": "Halo" }
→ 201 { data: heart } | 400 { error }

PATCH /api/hearts/:id
← { "note": "Baru" }
→ 200 { data: heart } | 404 { error }

DELETE /api/hearts/:id
→ 204 tanpa body | 404 { error }`,
          note: "Perhatikan bahwa setiap endpoint punya input, output, dan kemungkinan error yang bisa diprediksi.",
        },
      ],
      tip: "Sebelum menulis kode, tulis dulu tabel endpoint di catatan. Ini menghemat banyak refactor di kemudian hari.",
      practice: {
        prompt: "Lihat kontraknya langsung di lab. Perhatikan bentuk data dan meta yang dikembalikan.",
        commands: [{ label: "GET daftar", command: "GET /api/hearts" }],
        hint: "Response `{ data, meta }` adalah pola yang umum agar mudah ditambah pagination nanti.",
      },
    },
    {
      title: "Prinsip REST yang perlu kamu pegang",
      body: [
        "Resource-oriented: URL menyebut benda, bukan aksi. Gunakan /api/hearts, bukan /api/getHearts. Aksi sudah diwakili oleh method GET, POST, PATCH, DELETE.",
        "Stateless: setiap request membawa semua informasi yang dibutuhkan. Server tidak boleh bergantung pada request sebelumnya, kecuali state yang memang disimpan lewat session/token.",
        "Representation: resource dikirim dalam bentuk representasi, biasanya JSON. Resource yang sama bisa punya representasi berbeda (JSON untuk API, HTML untuk halaman).",
        "Uniform interface: semua resource mengikuti aturan yang sama. Client tidak perlu menghafal pola berbeda untuk setiap endpoint. Inilah yang membuat API terasa 'RESTful'.",
      ],
      table: {
        head: ["Prinsip", "Artinya", "Contoh"],
        rows: [
          ["Resource-oriented", "URL = benda", "/api/hearts"],
          ["Method = aksi", "Aksi lewat HTTP method", "POST /api/hearts"],
          ["Stateless", "Tiap request mandiri", "Token dikirim tiap request"],
          ["Representation", "Data dikirim dalam format", "JSON"],
          ["Uniform", "Pola konsisten", "Semua error punya bentuk sama"],
        ],
      },
      examples: [
        {
          title: "RESTful vs tidak RESTful",
          code: `❌ Kurang rapi
GET  /api/getAllHearts
POST /api/createHeart
POST /api/deleteHeart?id=3

✅ Lebih RESTful
GET    /api/hearts
POST   /api/hearts
DELETE /api/hearts/3`,
          output: `URL menyebut resource, method menyebut aksi.
Client bisa menebak endpoint berikutnya tanpa hafal nama fungsi.`,
          note: "REST bukan agama yang harus sempurna. Yang penting konsisten dan mudah dipahami.",
        },
      ],
      warning: "REST bukan satu-satunya gaya API. GraphQL, gRPC, dan RPC juga valid. Yang salah adalah mencampur banyak gaya tanpa alasan jelas.",
      practice: {
        prompt: "Bandingkan endpoint daftar dan detail. Keduanya memakai noun yang sama, hanya beda path.",
        commands: [
          { label: "Daftar", command: "GET /api/hearts" },
          { label: "Detail", command: "GET /api/hearts/1" },
        ],
        hint: "`/api/hearts` adalah koleksi. `/api/hearts/1` adalah satu anggota koleksi.",
      },
    },
    {
      title: "Menamai endpoint dengan benar",
      body: [
        "Gunakan kata benda jamak untuk koleksi: /api/hearts, /api/users, /api/orders. Jangan memakai kata kerja seperti /api/getHearts atau /api/createHeart.",
        "Untuk relasi, gunakan nested path secukupnya: /api/users/9/hearts berarti hati milik user 9. Jangan membuat nesting terlalu dalam karena URL menjadi panjang dan sulit dirawat.",
        "Gunakan huruf kecil dan tanda hubung (-) untuk path multi-kata, bukan spasi atau huruf besar. Contoh: /api/heart-notes. Konsistensi lebih penting daripada selera pribadi.",
        "Versi API diletakkan di depan: /api/v1/hearts. Ini memberi ruang untuk perubahan besar tanpa memutus klien lama. Perubahan kecil yang kompatibel tidak perlu versi baru.",
      ],
      table: {
        head: ["Kurang baik", "Lebih baik", "Alasan"],
        rows: [
          ["/api/getHearts", "/api/hearts", "Noun, bukan verb"],
          ["/api/heart", "/api/hearts", "Koleksi memakai plural"],
          ["/api/deleteHeart/3", "DELETE /api/hearts/3", "Aksi dari method"],
          ["/api/HeartNotes", "/api/heart-notes", "Huruf kecil & tanda hubung"],
          ["/api/users/9/hearts/4/comments/2", "/api/hearts/4/comments", "Nesting terlalu dalam"],
        ],
      },
      examples: [
        {
          title: "Peta endpoint yang mudah ditebak",
          code: `GET    /api/v1/hearts
POST   /api/v1/hearts
GET    /api/v1/hearts/42
PATCH  /api/v1/hearts/42
DELETE /api/v1/hearts/42

GET    /api/v1/users/9/hearts`,
          output: `Semua endpoint memakai noun yang sama.
Aksi ditentukan oleh method.
Relasi ditunjukkan lewat nested path.`,
          note: "Kalau kamu bisa menebak endpoint berikutnya tanpa membuka dokumentasi, berarti penamaannya sudah baik.",
        },
      ],
      tip: "Tulis endpoint di tabel sebelum coding. Kalau namanya terasa aneh diucapkan, kemungkinan desainnya perlu diubah.",
      practice: {
        prompt: "Coba akses satu resource lewat path param. Ini pola yang akan sering kamu pakai.",
        commands: [
          { label: "Hati #1", command: "GET /api/hearts/1" },
          { label: "Hati #999", command: "GET /api/hearts/999" },
        ],
        hint: "Path param adalah bagian dari identitas resource. Tanpa id, endpoint detail tidak bermakna.",
      },
    },
    {
      title: "Path param vs query param",
      body: [
        "Path param adalah bagian dari path yang menunjuk identitas resource. Contoh: /api/hearts/17. Kalau id dihapus, resource-nya berubah makna. Path param biasanya wajib.",
        "Query param adalah pasangan kunci=nilai setelah tanda tanya. Contoh: /api/hearts?sort=newest&page=2. Query biasanya opsional dan dipakai untuk filter, pencarian, pengurutan, atau pagination.",
        "Jangan memakai query untuk identitas utama. /api/hearts?id=17 secara teknis bisa, tetapi kurang RESTful dibanding /api/hearts/17. Sebaliknya, jangan memakai path untuk filter yang bisa berlapis-lapis.",
        "Di Next.js App Router, path param tersedia lewat params, sedangkan query dibaca dari searchParams. Keduanya punya tempat berbeda di kode.",
      ],
      table: {
        head: ["Jenis", "Bentuk", "Fungsi", "Wajib?"],
        rows: [
          ["Path param", "/api/hearts/17", "Identitas resource", "Ya"],
          ["Query param", "/api/hearts?page=2&sort=newest", "Filter, sort, pagination", "Tidak"],
        ],
      },
      examples: [
        {
          title: "Membaca keduanya di Next.js",
          code: `// src/app/api/hearts/[id]/route.js
export async function GET(request, { params }) {
  const id = params.id;

  const { searchParams } = new URL(request.url);
  const sort = searchParams.get("sort");
  const page = Number(searchParams.get("page") || 1);

  return Response.json({ data: { id, sort, page } });
}`,
          output: `GET /api/hearts/17?sort=newest&page=2
→ { "data": { "id": "17", "sort": "newest", "page": 2 } }`,
          note: "params.id berasal dari folder [id]. Query dibaca dari URL request.",
        },
      ],
      warning: "Selalu ubah query param menjadi tipe yang benar dan batasi nilainya. `page=-1` atau `limit=999999` bisa membebani database kalau tidak divalidasi.",
      practice: {
        prompt: "Coba path param dan query param dalam satu sesi. Perhatikan bentuk response-nya.",
        commands: [
          { label: "Path param", command: "GET /api/hearts/1" },
          { label: "Query filter", command: "GET /api/hearts?sort=newest&limit=2" },
          { label: "Query search", command: "GET /api/hearts?search=istirahat" },
        ],
        hint: "Query tidak mengubah resource; ia hanya mengubah cara daftar ditampilkan.",
      },
    },
    {
      title: "CRUD lengkap dengan REST",
      body: [
        "CRUD adalah empat operasi dasar: Create, Read, Update, Delete. Di REST, keempatnya dipetakan ke method dan status code yang konsisten.",
        "Create memakai POST dan biasanya membalas 201 Created. Read memakai GET dan membalas 200 OK (atau 404 kalau tidak ada). Update memakai PUT/PATCH dan membalas 200. Delete memakai DELETE dan membalas 204 No Content.",
        "PUT mengganti seluruh representasi resource. Kalau field tidak dikirim, field itu bisa hilang. PATCH hanya mengubah field yang dikirim. Untuk aplikasi sehari-hari, PATCH lebih sering dipakai karena lebih aman untuk perubahan kecil.",
        "DELETE yang sukses tidak perlu mengembalikan body. Status 204 sudah cukup. Kalau resource tidak ditemukan, balas 404; kalau sudah dihapus sebelumnya, bisa juga 204 tergantung kebijakan idempotensi.",
      ],
      table: {
        head: ["Aksi", "Method", "Contoh", "Status sukses"],
        rows: [
          ["Create", "POST", "POST /api/hearts", "201 Created"],
          ["Read semua", "GET", "GET /api/hearts", "200 OK"],
          ["Read satu", "GET", "GET /api/hearts/1", "200 OK"],
          ["Replace", "PUT", "PUT /api/hearts/1", "200 OK"],
          ["Update sebagian", "PATCH", "PATCH /api/hearts/1", "200 OK"],
          ["Delete", "DELETE", "DELETE /api/hearts/1", "204 No Content"],
        ],
      },
      examples: [
        {
          title: "Satu siklus CRUD",
          code: `POST   /api/hearts        { "to": "Ratih", "note": "Baru" }
GET    /api/hearts
PATCH  /api/hearts/4      { "note": "Sudah diubah" }
DELETE /api/hearts/4`,
          output: `201 Created   → { data: { id: 4, ... } }
200 OK        → { data: [ ... ], meta: { count: ... } }
200 OK        → { data: { id: 4, note: "Sudah diubah" } }
204 No Content → (tanpa body)`,
          note: "Setiap langkah punya status yang berbeda karena artinya memang berbeda.",
        },
      ],
      warning: "Jangan mengembalikan 200 untuk semua hal. Frontend dan monitoring bergantung pada status code untuk membedakan sukses, gagal validasi, dan error server.",
      practice: {
        prompt: "Lakukan satu siklus CRUD lengkap. Buat, baca, ubah, lalu hapus hati baru.",
        commands: [
          { label: "1. Buat", command: 'POST /api/hearts {"to":"Ratih","note":"Hati untuk CRUD"}' },
          { label: "2. Baca", command: "GET /api/hearts/4" },
          { label: "3. Ubah", command: 'PATCH /api/hearts/4 {"note":"Sudah diubah"}' },
          { label: "4. Hapus", command: "DELETE /api/hearts/4" },
        ],
        hint: "Id 4 muncul karena data awal lab berisi 3 hati. Setelah POST, hati baru mendapat id 4.",
      },
    },
    {
      title: "Response yang konsisten: data, meta, dan error",
      body: [
        "Response yang konsisten membuat frontend lebih mudah dibuat. Untuk data tunggal, bungkus dengan { data: {...} }. Untuk daftar, gunakan { data: [...], meta: {...} }. Dengan begitu, pagination dan informasi tambahan bisa ditambahkan tanpa mengubah struktur utama.",
        "Error juga harus konsisten. Gunakan { error: { code, message, details } }. code berguna untuk mesin, message untuk manusia, details untuk field yang gagal validasi. Jangan mengirim HTML error atau stack trace ke client.",
        "Gunakan camelCase atau snake_case secara konsisten, jangan dicampur. Tanggal gunakan format ISO 8601 agar mudah di-parse semua bahasa. Angka dan boolean jangan dikirim sebagai string kalau memang bukan string.",
        "Untuk daftar besar, tambahkan pagination: page, limit, total, dan mungkin nextCursor. Jangan mengembalikan seluruh isi tabel tanpa batas; suatu hari datanya akan tumbuh.",
      ],
      examples: [
        {
          title: "Bentuk sukses dan error",
          code: `200 OK
{
  "data": [
    { "id": 1, "to": "Ratih", "createdAt": "2026-10-30T10:00:00Z" }
  ],
  "meta": { "page": 1, "limit": 20, "total": 128 }
}

400 Bad Request
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Data hati belum valid.",
    "details": [{ "field": "to", "issue": "wajib diisi" }]
  }
}`,
          output: `Frontend bisa membedakan sukses dan gagal dari status + bentuk body.
Tidak perlu menebak field error.`,
          note: "Konsistensi lebih penting daripada selera. Pilih satu pola, lalu pakai di semua endpoint.",
        },
      ],
      tip: "Kalau ragu, lihat response API besar seperti Stripe atau GitHub. Mereka punya pola error yang sangat konsisten.",
      practice: {
        prompt: "Coba kirim body yang tidak valid, lalu perhatikan bentuk error 400 dan details-nya.",
        commands: [
          { label: "Tanpa field to", command: "POST /api/hearts {}" },
          { label: "Field to kosong", command: 'POST /api/hearts {"to":""}' },
        ],
        hint: "Error yang baik memberi tahu field mana yang salah dan kenapa.",
      },
    },
    {
      title: "Routing di Next.js App Router",
      body: [
        "Di Next.js App Router, setiap endpoint adalah file route.js di dalam folder yang menentukan path. Misalnya src/app/api/hearts/route.js menangani /api/hearts.",
        "Folder dinamis memakai tanda kurung siku: src/app/api/hearts/[id]/route.js. Nilai id tersedia di params. Ini setara dengan path param di pembahasan sebelumnya.",
        "Setiap method diekspor sebagai fungsi: export async function GET, POST, PATCH, DELETE. Kalau method tidak diekspor, Next.js akan membalas 405 secara otomatis.",
        "Karena proyek ini memakai output: \"export\" (static export), API route tidak ikut menjadi server sungguhan. Lab terminal mensimulasikan API-nya. Untuk API production, kamu butuh runtime server seperti Cloud Functions, Cloud Run, Vercel, atau VPS.",
      ],
      examples: [
        {
          title: "Struktur folder API",
          code: `src/app/api/hearts/route.js
  → GET    /api/hearts
  → POST   /api/hearts

src/app/api/hearts/[id]/route.js
  → GET    /api/hearts/1
  → PATCH  /api/hearts/1
  → DELETE /api/hearts/1

export async function GET(request, { params }) {
  return Response.json({ id: params.id });
}`,
          output: `Setiap folder = segmen URL.
[ ] = nilai dinamis.
route.js = kode handler-nya.`,
          note: "Routing berbasis file membuat struktur API terlihat langsung dari folder proyek.",
        },
      ],
      warning: "Jangan taruh logika database langsung di komponen UI. Pisahkan handler API dan lapisan data supaya mudah diuji dan tidak bocor ke client.",
      practice: {
        prompt: "Uji endpoint detail yang meniru folder [id]. Coba id yang ada dan yang tidak ada.",
        commands: [
          { label: "Ada", command: "GET /api/hearts/2" },
          { label: "Tidak ada", command: "GET /api/hearts/999" },
        ],
        hint: "Handler yang baik selalu memeriksa apakah resource ditemukan sebelum membalas 200.",
      },
    },
  ],
  summary: [
    "REST memakai URL untuk resource dan method untuk aksi.",
    "Gunakan noun jamak, bukan verb, dan konsisten.",
    "Path param = identitas; query param = filter/pagination.",
    "CRUD punya pasangan method dan status code yang khas.",
    "Response sukses dan error harus punya bentuk konsisten.",
    "Next.js memetakan folder route.js menjadi endpoint.",
  ],
};

export default module;
