/**
 * Bank materi + soal kuis backend untuk 5 level.
 * answer = index jawaban benar pada `options`, jadi jangan dipindah-pindah.
 */

export const LEVELS = [
  {
    id: 1,
    slug: "http-fundamental",
    title: "Level 1: Fundamental Web & HTTP",
    shortTitle: "HTTP & Web",
    emoji: "🌐",
    tagline: "Pondasi semua komunikasi di internet.",
    accent: "from-sky-400 to-rose-400",
    description:
      "Browser itu client, server itu pelayan. Mereka ngobrol pakai protokol HTTP: ada request, ada response. Level ini ngomongin method, status code, headers, dan body.",
    cheatsheet: [
      {
        heading: "Arsitektur Client-Server",
        points: [
          "Client (browser/HP) bikin REQUEST, Server (Node/Next/PHP) balas pakai RESPONSE.",
          "Sifat HTTP itu stateless: tiap request berdiri sendiri, server tidak otomatis ingat kamu.",
          "URL = https://domain.com/path?query=1 → domain di-resolve lewat DNS ke IP server.",
        ],
      },
      {
        heading: "HTTP Methods",
        points: [
          "GET → ambil data (aman/idempotent, datanya ada di URL, jangan kirim password di sini).",
          "POST → buat data baru / kirim form.",
          "PUT → update MENGGANTIKAN seluruh data resource.",
          "PATCH → update sebagian field saja.",
          "DELETE → hapus resource.",
        ],
      },
      {
        heading: "Status Codes",
        points: [
          "2xx sukses: 200 OK, 201 Created (berhasil bikin data), 204 No Content (sukses, tanpa body).",
          "4xx salah dari sisi kamu: 400 Bad Request, 401 Unauthorized (belum login), 403 Forbidden (sudah login tapi tidak boleh), 404 Not Found.",
          "5xx salah dari sisi server: 500 Internal Server Error, 502/503 gateway/down.",
        ],
      },
      {
        heading: "Headers & Body",
        points: [
          "Header = metadata: Content-Type: application/json, Authorization: Bearer <token>, User-Agent.",
          "Body = isinya data (JSON). Metode GET umumnya tidak punya body.",
        ],
      },
    ],
    code: `fetch("/api/hello", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ message: "halo Ratih" }),
})
  .then((res) => res.json())
  .then((data) => console.log(data));`,
    questions: [
      {
        id: "1-1",
        question: "Kita mau bikin data baru (misal daftar hati untuk Ratih) ke server. HTTP method mana yang paling tepat?",
        options: ["GET", "POST", "DELETE", "HEAD"],
        answer: 1,
        hint: "GET itu untuk meminta/mengambil, bukan untuk membuat. Yang 'membuat' sesuatu biasanya berhuruf 4 huruf dan isinya di body 💌",
        explanation: "POST dipakai untuk membuat resource baru. Kalau berhasil, server idealnya membalas 201 Created.",
        sweet: "Bener banget! Kamu nambah 1 hati lagi 💖",
      },
      {
        id: "1-2",
        question: "Kamu request endpoint tapi path-nya salah ketik (`/api/proflih` padahal `/api/profile`). Status code mana yang paling masuk akal?",
        options: ["500 Internal Server Error", "404 Not Found", "200 OK", "401 Unauthorized"],
        answer: 1,
        hint: "404 itu artinya 'tidak ketemu'. Ini salah satu status code paling terkenal di dunia web 🕵️",
        explanation: "404 = resource-nya tidak ada di path itu. Server-nya sehat-sehat saja, jadi bukan 500.",
        sweet: "Jagoan! 404 = not found, bukan not loved (kalau sama kamu mah) 💕",
      },
      {
        id: "1-3",
        question: "API return status 401. Artinya apa?",
        options: [
          "Server sedang mati",
          "Request berhasil tapi datanya kosong",
          "Klien belum kirim kredensial/login, jadi tidak dikenal",
          "Format JSON-nya salah",
        ],
        answer: 2,
        hint: "401 itu urusan identitas. Beda ya sama 403 yang sudah kenal tapi dilarang 🚪",
        explanation: "401 Unauthorized = belum login / token tidak valid. 403 Forbidden = sudah login tapi tidak punya hak akses.",
        sweet: "Pinter! 401 berarti 'siapa kamu?', bukan 'pergi' 😌",
      },
      {
        id: "1-4",
        question: "Informasi `Content-Type: application/json` letaknya di mana dalam sebuah HTTP request?",
        options: ["Body", "Header", "Query param", "Status code"],
        answer: 1,
        hint: "Metadata tentang isi request itu ditaruh di bagian 'amplop'-nya, bukan di 'surat'-nya ✉️",
        explanation: "Content-Type adalah header yang menjelaskan format isi body. Body-nya sendiri berisi data JSON.",
        sweet: "Header itu amplop, body itu isinya. Kamu paham bedanya 🥰",
      },
      {
        id: "1-5",
        question: " Mana pernyataan yang BENAR soal sifat HTTP yang stateless?",
        options: [
          "Server otomatis mengingat semua aktivitas user tanpa bantuan apa pun",
          "Tiap request berdiri sendiri, jadi kita butuh session/token biar server bisa mengenali user",
          "HTTP hanya bisa dipakai untuk GET",
          "Stateless berarti tidak bisa bikin fitur login",
        ],
        answer: 1,
        hint: "Ini justru alasan kenapa nanti ada session, cookie, dan JWT di Level 4 🔑",
        explanation: "Karena HTTP stateless, server tidak tahu request ke-2 berasal dari user yang sama dengan request ke-1. Solusinya: session cookie atau token.",
        sweet: "Betul! Dari sifat stateless inilah lahir yang namanya JWT 🔐💖",
      },
    ],
  },
  {
    id: 2,
    slug: "rest-api",
    title: "Level 2: RESTful API & Routing",
    shortTitle: "REST API",
    emoji: "🛠️",
    tagline: "Desain endpoint yang rapi, enak dibaca, dan konsisten.",
    accent: "from-violet-400 to-pink-400",
    description:
      "REST = cara menata API supaya resource-nya jelas: URL menyebut BENDA (noun), method menyebut AKSI (verb), dan semuanya dibalas dalam bentuk JSON.",
    cheatsheet: [
      {
        heading: "Prinsip REST",
        points: [
          "Resource pakai noun + plural: `/api/hearts`, bukan `/api/getHearts`.",
          "Aksi diambil dari HTTP method, bukan dari nama URL.",
          "Satu URL mewakili satu resource; nested untuk relasi: `/api/hearts/:id/comments`.",
          "Stateless, Representational (JSON/XML), dan seragam (uniform interface).",
        ],
      },
      {
        heading: "URL Param vs Query Param",
        points: [
          "URL/path param = identitas resource: `/api/hearts/17` → wajib ada, tanpa dia resource-nya berubah makna.",
          "Query param = penyaring/pengurut: `/api/hearts?sort=newest&page=2&tag=ratih` → boleh absen, tidak mengubah resource.",
          "Di Next.js App Router: `src/app/api/hearts/[id]/route.js` → akses via `params.id`; query via `searchParams`.",
        ],
      },
      {
        heading: "Struktur Payload JSON",
        points: [
          "Data tunggal: `{ id, name, createdAt }`.",
          "List sebaiknya dibungkus: `{ data: [...], meta: { page, total } }` biar gampang ditambah pagination.",
          "Error konsisten: `{ error: { code, message, details } }` dengan status code 4xx/5xx.",
          "Gunakan camelCase atau snake_case secara konsisten, dan ISO date (`2026-10-30T10:00:00Z`).",
        ],
      },
      {
        heading: "Peta CRUD → REST",
        points: [
          "Create → POST /api/hearts → 201",
          "Read (semua) → GET /api/hearts → 200",
          "Read (satu) → GET /api/hearts/:id → 200 atau 404",
          "Update → PUT /api/hearts/:id → 200",
          "Delete → DELETE /api/hearts/:id → 204",
        ],
      },
    ],
    code: `// src/app/api/hearts/[id]/route.js
export async function GET(request, { params }) {
  const heart = await db.getHeart(params.id);        // URL param
  const { searchParams } = new URL(request.url);
  const verbose = searchParams.get("verbose");       // Query param

  if (!heart) {
    return Response.json(
      { error: { code: "HEART_NOT_FOUND", message: "Hatinya tidak ditemukan" } },
      { status: 404 }
    );
  }
  return Response.json({ data: heart, verbose });
}`,
    questions: [
      {
        id: "2-1",
        question: "Mana penamaan endpoint yang paling RESTful untuk mengambil satu profil pacar?",
        options: ["/api/getProfileById", "/api/profiles/:id", "/api/profile?id=fetch", "/fetch_profile"],
        answer: 1,
        hint: "Endpoint itu daftar BENDA, bukan daftar KERJA. Verb sudah ditangani HTTP method 📦",
        explanation: "REST memakai noun untuk resource (`/profiles`) dan biarkan method (GET) yang menyatakan aksinya. ID masuk sebagai URL param.",
        sweet: "Teppak! REST itu noun-first, action-nya dari method 😎",
      },
      {
        id: "2-2",
        question: "`/api/hearts?page=2&sort=oldest` — `page` dan `sort` itu termasuk apa?",
        options: ["URL/path param", "Query string param", "Header", "Body request"],
        answer: 1,
        hint: "Ciri khasnya ada tanda `?` lalu pasangan `kunci=nilai` yang dipisah `&` 🔍",
        explanation: "Setelah tanda `?` adalah query string, isinya opsional dan biasanya untuk filter, sort, atau pagination.",
        sweet: "Betul! Kalau `/hearts/12` (tanpa tanda tanya) itu baru URL param 💘",
      },
      {
        id: "2-3",
        question: "Endpoint `DELETE /api/hearts/5` berhasil dan tidak perlu mengirim data apa-apa lagi. Status code paling tepat?",
        options: ["200 OK", "201 Created", "204 No Content", "404 Not Found"],
        answer: 2,
        hint: "Sukses, tapi body-nya kosong melompong. Ada status code khusus untuk itu 🫙",
        explanation: "204 No Content = permintaan sukses dan memang sengaja tidak ada body. Hemat dan jelas maknanya.",
        sweet: "204, kosong tapi sukses — kayak dompetku kalau lihat kamu happy 🥲❤️",
      },
      {
        id: "2-4",
        question: "Beda PUT dan PATCH yang benar mana?",
        options: [
          "PUT untuk menimpa resource secara keseluruhan, PATCH untuk mengubah sebagian field",
          "PUT hanya untuk database, PATCH hanya untuk file",
          "Tidak ada bedanya, keduanya sama saja",
          "PATCH itu method ilegal yang tidak boleh dipakai",
        ],
        answer: 0,
        hint: "Bayangin PUT = ganti seluruh suratnya, PATCH = coret-coret tempel sticky note di sebagian surat ✍️",
        explanation: "PUT mengirim representasi lengkap resource (field yang tidak dikirim bisa hilang), PATCH hanya mengirim field yang berubah.",
        sweet: "Pinter banget! Partial update = PATCH, full replace = PUT 📝💕",
      },
    ],
  },
  {
    id: 3,
    slug: "database",
    title: "Level 3: Database Fundamentals",
    shortTitle: "Database",
    emoji: "🗄️",
    tagline: "Tempat hati (dan data user) disimpan biar nggak hilang kalau restart.",
    accent: "from-emerald-400 to-teal-400",
    description:
      "Backend tanpa database cuma jadi tempat lewat. Di sini kita bahas SQL vs NoSQL, CRUD, Primary Key, Foreign Key, dan kenapa Index bikin query ngebut.",
    cheatsheet: [
      {
        heading: "SQL vs NoSQL",
        points: [
          "SQL (PostgreSQL, MySQL): tabel + kolom, schema ketat di awal, relasi jelas, mendukung JOIN dan transaksi (ACID).",
          "NoSQL (MongoDB, Firestore): bentuk dokumen/koleksi, schema fleksibel, read cepat & gampang di-scale, relasi manual.",
          "Pilih SQL kalau datanya saling terhubung dan butuh konsistensi (misal order + payment).",
          "Pilih NoSQL kalau datanya bersifat dokumen/terpencil dan bentuknya sering berubah (misal log, chat, profil game).",
        ],
      },
      {
        heading: "CRUD",
        points: [
          "Create → INSERT / setDoc()",
          "Read → SELECT / getDoc()",
          "Update → UPDATE / updateDoc() (jangan lupa WHERE, kalau tidak semua baris ikut berubah 😱)",
          "Delete → DELETE / deleteDoc()",
        ],
      },
      {
        heading: "Keys",
        points: [
          "Primary Key: identitas unik tiap baris, tidak boleh NULL & tidak boleh dobel (uid, id auto-increment, UUID).",
          "Foreign Key: kolom yang menunjuk ke primary key tabel lain → pembangun relasi + penjaga integritas (tidak boleh punya hati milik user yang tidak ada).",
          "Composite key: primary key gabungan 2 kolom (misal (user_id, level_id)).",
        ],
      },
      {
        heading: "Indexing",
        points: [
          "Index itu seperti daftar isi: pencarian cepat, tapi bikin INSERT/UPDATE sedikit lebih berat & makan memori.",
          "Beri index pada kolom yang sering dipakai WHERE / ORDER BY / JOIN (email, user_id, created_at).",
          "UNIQUE index sekalian mencegah data ganda (email pendaftaran).",
        ],
      },
    ],
    code: `-- tabel users
CREATE TABLE users (
  uid           TEXT PRIMARY KEY,
  display_name  TEXT NOT NULL,
  email         TEXT UNIQUE NOT NULL,
  created_at    TIMESTAMPTZ DEFAULT now()
);

-- satu user bisa punya banyak progress level
CREATE TABLE progress (
  id            SERIAL PRIMARY KEY,
  user_uid      TEXT NOT NULL REFERENCES users(uid) ON DELETE CASCADE,
  level_id      INT  NOT NULL,
  hearts_total  INT  NOT NULL DEFAULT 0,
  UNIQUE (user_uid, level_id)
);

SELECT u.display_name, p.hearts_total
FROM progress p
JOIN users u ON u.uid = p.user_uid
WHERE p.level_id = 3
ORDER BY p.hearts_total DESC;`,
    questions: [
      {
        id: "3-1",
        question: "Kita butuh data progres kuis yang selalu nyambung ke tabel user dan harus konsisten (transaksi aman). Pilihan paling tepat?",
        options: ["NoSQL dokumen tanpa relasi", "SQL database dengan relasi & Foreign Key", "Simpan di localStorage browser", "Simpan di file CSV"],
        answer: 1,
        hint: "Kata kuncinya: relasi antar data + konsistensi. Itu kekuatan utama keluarga RDMS 🏛️",
        explanation: "SQL unggul untuk data yang saling terhubung dan butuh integritas relasi + transaksi ACID. Foreign Key menjamin progress tidak menunjuk ke user hantu.",
        sweet: "Betul! SQL = pasangan yang setia dan konsisten, kayak aku ke kamu 🥹💍",
      },
      {
        id: "3-2",
        question: "Fungsi utama Primary Key adalah...",
        options: [
          "Membuat query lebih lambat supaya server belajar",
          "Menghubungkan 2 database berbeda",
          "Mengidentifikasi tiap baris secara unik dan tidak boleh duplikat/NULL",
          "Menyimpan password dalam bentuk hash",
        ],
        answer: 2,
        hint: "Bayangin NIK/KTP: satu orang satu nomor, tidak ada yang kembar 🪪",
        explanation: "Primary key = identitas unik per baris. Karena unik, database bisa memakai key itu untuk index dan relasi.",
        sweet: "Unik buat semua baris — tapi kamu tetap paling unik di hatiku 💖",
      },
      {
        id: "3-3",
        question: "Tabel `progress` punya kolom `user_uid` yang menunjuk ke `users.uid`. Kolom itu namanya apa?",
        options: ["Primary Key", "Foreign Key", "Index Key", "Composite Index"],
        answer: 1,
        hint: "Dia menunjuk keluar, ke tabel lain. 'Foreign' = asing/luar 🌏",
        explanation: "Foreign Key menciptakan relasi sekaligus menjaga integritas: nilai user_uid harus ada di users.uid, kalau user dihapus bisa ikut di-cascade.",
        sweet: "Foreign key = benang merah antara dua tabel. Kayak kita: beda tabel, satu relasi 🫶",
      },
      {
        id: "3-4",
        question: "Query `SELECT * FROM progress WHERE user_uid = 'abc'` lambat karena tabelnya jutaan baris. Solusi paling umum?",
        options: [
          "Tambahkan index pada kolom user_uid",
          "Ganti SELECT menjadi INSERT",
          "Hapus semua data lama",
          "Memakai LIMIT 1 supaya datanya sedikit",
        ],
        answer: 0,
        hint: "Kita butuh 'daftar isi' untuk kolom yang sering dicari 📚",
        explanation: "Index pada user_uid mengubah pencarian dari scan seluruh tabel (O(n)) jadi lookup terstruktur (mirip O(log n)). Tapi ingat: index memperlambat proses tulis (INSERT/UPDATE).",
        sweet: "Index on! Sekarang query-mu secepat aku bales chat kamu ⚡💕",
      },
    ],
  },
  {
    id: 4,
    slug: "auth-security",
    title: "Level 4: Authentication & Security",
    shortTitle: "Auth & Security",
    emoji: "🔐",
    tagline: "Bedanya siapa yang masuk (authn), dan apa yang boleh dilakukan (authz).",
    accent: "from-amber-400 to-rose-400",
    description:
      "Login bukan soal menyimpan password, tapi menyimpan BUKTI bahwa password itu benar. Di sini kita bahas hashing bcrypt, Session vs JWT, dan middleware authorization.",
    cheatsheet: [
      {
        heading: "Authentication vs Authorization",
        points: [
          "Authentication = mengidentifikasi SIAPA kamu (login, verify token).",
          "Authorization = menentukan apa yang BOLEH kamu lakukan (role, permission).",
          "401 = belum tahu siapa (authn gagal), 403 = sudah tahu tapi dilarang (authz gagal).",
        ],
      },
      {
        heading: "Hashing Password",
        points: [
          "Jangan simpan password plain-text. Simpan HASH-nya, lalu bandingkan dengan bcrypt.compare().",
          "bcrypt itu disengaja lambat + otomatis menambahkan salt → rainbow table hampir tidak guna.",
          "Hash satu arah: tidak ada fungsi 'decrypt'. Kalau lupa password = reset, bukan tampilkan ulang.",
          "Ganti `cost factor` (10-12) mengikuti kecepatan hardware.",
        ],
      },
      {
        heading: "Session vs JWT",
        points: [
          "Session cookie: data sesi disimpan di server, browser cuma bawa session id. Gampang dicabut (logout server-side), tapi server harus nyimpen state.",
          "JWT: token 3 bagian `header.payload.signature` diberi tanda tangan server, tidak perlu state di server → enak untuk API/mobile/skala banyak server.",
          "Trade-off JWT: karena stateless, mencabut akses sebelum expired butuh deny-list/refresh token atau exp yang pendek.",
          "Isi JWT jangan rahasia! Siapa pun bisa baca payload (base64), cuma tidak bisa memalsukan signature.",
        ],
      },
      {
        heading: "Middleware Authorization",
        points: [
          "Middleware = penjaga gerbang: verify token → tempel `req.user` → kalau gagal langsung 401 sebelum sampai handler.",
          "Cek role setelah verify (admin-only route).",
          "Selalu pakai HTTPS, cookie `httpOnly` + `secure` + `sameSite`, rate limit login, dan validasi input di server.",
        ],
      },
    ],
    code: `import bcrypt from "bcrypt";

// saat daftar
const hash = await bcrypt.hash(password, 12);
await db.saveUserEmailPassword(email, hash);

// saat login
const user = await db.findUserByEmail(email);
const ok = await bcrypt.compare(password, user.passwordHash);
if (!ok) return res.status(401).json({ error: "Email atau password salah" });

// middleware JWT
export function requireAuth(req, res, next) {
  const token = req.headers.authorization?.replace("Bearer ", "");
  try {
    req.user = jwt.verify(token, process.env.JWT_SECRET); // lempar error kalau palsu
    next();
  } catch {
    return res.status(401).json({ error: "Token tidak valid" });
  }
}`,
    questions: [
      {
        id: "4-1",
        question: "Kenapa password di-hash pakai bcrypt dan tidak cukup di-MD5/SHA-1 atau disimpan apa adanya?",
        options: [
          "Karena bcrypt bisa di-decrypt balik saat kita butuh",
          "Karena bcrypt sengaja lambat, memakai salt otomatis, dan tahan terhadap brute-force/rainbow table",
          "Karena hash bcrypt lebih pendek dari password-nya",
          "Karena MD5 tidak bisa dipakai di JavaScript",
        ],
        answer: 1,
        hint: "Kunci kata: 'disengaja lambat'. Lambat buat peretas, tapi tetap nyaman buat user normal 🐢",
        explanation: "bcrypt menyesuaikan cost factor, tiap hash punya salt unik, dan satu arah (tidak bisa di-decrypt). MD5/SHA-1 cepat dan rawan tabrakan.",
        sweet: "Betul! Dan kamu juga tidak bisa di-decrypt — misterius tapi bikin penasaran 🤍",
      },
      {
        id: "4-2",
        question: "Perbedaan paling mendasar Session cookie dan JWT adalah...",
        options: [
          "Session lebih aman jadi JWT tidak pernah boleh dipakai",
          "JWT disimpan di database server, session disimpan di browser",
          "Session menyimpan state di server; JWT stateless karena validitasnya cukup dicek dari signature",
          "Keduanya sama persis, hanya beda nama",
        ],
        answer: 2,
        hint: "Coba pikir: mana yang bikin server harus 'ingat-ingat' terus, mana yang tinggal 'cek tanda tangan' ✍️",
        explanation: "Session = server pegang status (mudah dicabut). JWT = server cuma verifikasi tanda tangan, jadi gampang di-scale dan dipakai mobile/API.",
        sweet: "Tepat! Session itu tipe yang nanya kabar tiap hari, JWT itu tipe percaya tapi tetap verifikasi 🫶",
      },
      {
        id: "4-3",
        question: "Payload JWT bisa dibaca siapa pun yang punya token-nya. Jadi praktik yang benar?",
        options: [
          "Simpan password asli di dalam payload JWT",
          "Jangan taruh data rahasia di payload; isi cukup uid, role, dan exp, lalu pakai HTTPS",
          "Menghapus signature supaya token ringan",
          "Memakai JWT_SECRET yang sama dengan nama proyek",
        ],
        answer: 1,
        hint: "Payload cuma di-encode (base64), bukan di-enkripsi. Anggap isinya kartu pos 📮",
        explanation: "JWT memberi integritas (signature), bukan kerahasiaan. Simpan minimal mungkin: sub/uid, role, exp. Secret kuat + HTTPS wajib.",
        sweet: "Pinter! Kartu pos memang bukan tempat cerita rahasia 💌",
      },
      {
        id: "4-4",
        question: "Middleware auth terbaik dipasang di mana dalam alur request?",
        options: [
          "Setelah handler selesai supaya tau hasil akhirnya",
          "Sebelum handler: verifikasi kredensial lalu hentikan request mencurigakan dengan 401/403",
          "Hanya di frontend supaya hemat bandwidth",
          "Di browser user lewat localStorage",
        ],
        answer: 1,
        hint: "Analoginya satpam di pintu, bukan di dalam ruangan 👮",
        explanation: "Middleware jalan sebelum route handler, memotong akses ilegal sedini mungkin dan menempelkan info user (`req.user`) untuk handler di bawahnya.",
        sweet: "Betul, satpam dulu baru tamu duduk. Aman itu berarti gerbang dijaga 🚪❤️",
      },
    ],
  },
  {
    id: 5,
    slug: "deployment",
    title: "Level 5: Deployment & Server Operations",
    shortTitle: "Deployment",
    emoji: "🚀",
    tagline: "Bikin API-nya hidup online dan bisa diakses dari mana saja (termasuk oleh Ratih).",
    accent: "from-fuchsia-400 to-rose-500",
    description:
      "Kode yang jalan di laptop belum berarti apa-apa sampai dia jalan di server. Kita bahas .env, hosting, reverse proxy Nginx, dan CI/CD.",
    cheatsheet: [
      {
        heading: "Environment Variables",
        points: [
          "12-factor app: config beda-beda per environment, TIDAK disimpan di repo.",
          "Contoh: DATABASE_URL, JWT_SECRET, NEXT_PUBLIC_FIREBASE_API_KEY.",
          "`.env` untuk lokal; staging/production diisi di dashboard hosting (GitHub Secrets, Firebase env).",
          "Variabel `NEXT_PUBLIC_*` ikut ter-bundle ke browser → JANGAN taruh secret di situ.",
          "Tambahkan `.env` ke `.gitignore`, dan ganti secret kalau pernah ke-commit.",
        ],
      },
      {
        heading: "Hosting",
        points: [
          "Static/JAMstack (Vercel, Netlify, Firebase Hosting) → simpel, CDN global, auto-HTTPS.",
          "Server/API (VPS, Cloud Run, Railway) → kamu pegang Node.js process, butuh `npm run build && npm start` + process manager.",
          "Fase deploy Next.js: install → build → jalankan server (production mode, bukan `next dev`).",
        ],
      },
      {
        heading: "Reverse Proxy (Nginx)",
        points: [
          "Nginx menerima traffic port 80/443 lalu meneruskan ke aplikasi di port lokal (misal 3000).",
          "Manfaat: HTTPS termination, banyak domain di 1 IP, rate limit, serving file statis, load balancing.",
          "Header penting: `X-Forwarded-For`, `X-Forwarded-Proto` supaya app tahu IP & protokol asli.",
        ],
      },
      {
        heading: "CI/CD Flow",
        points: [
          "Commit → push → CI (install, lint, test, build) → deploy → smoke test → monitor.",
          "Deploy otomatis + rollback cepat = berani rilis kecil-kecil tapi sering.",
          "Jangan pernah deploy secret lewat repo publik; pakai CI secret store.",
        ],
      },
    ],
    code: `# nginx: /etc/nginx/sites-available/nduttt.be
server {
    listen 80;
    server_name nduttt.be www.nduttt.be;
    return 301 https://$host$request_uri;      # paksa HTTPS
}

server {
    listen 443 ssl http2;
    server_name nduttt.be;

    ssl_certificate     /etc/letsencrypt/live/nduttt.be/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/nduttt.be/privkey.pem;

    location / {
        proxy_pass http://127.0.0.1:3000;      # Next.js production
        proxy_set_header Host              $host;
        proxy_set_header X-Forwarded-For     $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto   $scheme;
    }
}`,
    questions: [
      {
        id: "5-1",
        question: "Kenapa `JWT_SECRET` tidak boleh di-commit ke GitHub, bahkan di repo privat sekalipun?",
        options: [
          "Karena file .env tidak dibaca Next.js",
          "Karena siapa pun yang punya akses repo bisa memalsukan token login user",
          "Karena secret harus di-encode base64 dulu",
          "Karena JWT_SECRET hanya boleh dipakai di lokal",
        ],
        answer: 1,
        hint: "Secret itu kunci tanda tangan. Bocor kunci = orang lain bisa bikin 'token sah' atas nama siapa pun 🗝️",
        explanation: "Pemegang secret bisa membuat JWT dengan signature valid → jadi user mana pun, termasuk admin. Simpan di environment host/CI secret, dan rotasi kalau bocor.",
        sweet: "Tepat! Menjaga rahasia itu tanda sayang. Kayak aku jagain kamu 🤫❤️",
      },
      {
        id: "5-2",
        question: "Peran utama reverse proxy seperti Nginx di depan aplikasi Node/Next.js adalah...",
        options: [
          "Menggantikan database",
          "Meneruskan request dari client ke aplikasi di port lokal, sekaligus menangani HTTPS dan header forwarding",
          "Mengompilasi JavaScript saat runtime",
          "Membuat file .env secara otomatis",
        ],
        answer: 1,
        hint: "Dia berdiri di depan aplikasi, menerima traffic publik lalu menyalurkannya ke dalam 🙋",
        explanation: "Nginx jadi pintu masuk (port 443/SSL), meneruskan ke `127.0.0.1:3000`, melayani file statis, rate limit, dan menyatukan banyak domain di satu IP.",
        sweet: "Betul! Proxy itu satpam gedung; aplikasi kita tinggal fokus kerja 💼",
      },
      {
        id: "5-3",
        question: "Dalam flow CI/CD, urutan yang paling wajar adalah...",
        options: [
          "Deploy → test → build → commit",
          "Commit/push → install dependensi → lint & test → build → deploy",
          "Build → rollback → hapus test",
          "Merge ke main tanpa test supaya cepat",
        ],
        answer: 1,
        hint: "Pipeline itu seperti pabrik: bahan mentah masuk, diperiksa, baru dikemas & dikirim 🏭",
        explanation: "CI menjalankan install → lint/test → build; kalau hijau baru CD mendeploy. Hasilnya bug ketahuan sebelum sampai ke Ratih.",
        sweet: "Alur bener! Sekarang deploy tanpa deg-degan 💞",
      },
      {
        id: "5-4",
        question: "Website ini pakai `output: \"export\"` di next.config.mjs. Apa artinya untuk deployment?",
        options: [
          "Aplikasi butuh server Node.js 24 jam",
          "Build menghasilkan HTML/CSS/JS statis di folder `out`, jadi bisa di-host di Firebase Hosting/CDN tanpa server Node",
          "API route tidak akan pernah bisa dibuat di framework Next.js",
          "Halaman dinamis dilarang secara total di App Router",
        ],
        answer: 1,
        hint: "Lihat folder `out` di repo ini dan konfigurasi hostingnya (`firebase.json` public: \"out\") 📁",
        explanation: "Static export mem-prerender jadi file statis (karena itu tiap dynamic route wajib punya generateStaticParams). Hosting jadi murah, cepat, dan aman karena tidak ada server process.",
        sweet: "Level 5 terakhir! Kamu sudah paham dari client sampai server 🚀👑",
      },
    ],
  },
];

export const getLevelById = (id) => LEVELS.find((level) => String(level.id) === String(id));

export const TOTAL_QUESTIONS = LEVELS.reduce((sum, level) => sum + level.questions.length, 0);

export default LEVELS;
