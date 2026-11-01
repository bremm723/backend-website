const module = {
  id: "auth",
  title: "Authentication & Security",
  shortTitle: "Auth & Security",
  emoji: "🔐",
  badge: "Inti",
  levelId: 4,
  intro:
    "Keamanan bukan fitur tambahan di akhir proyek. Ia adalah cara berpikir: jangan percaya input, jangan simpan rahasia sembarangan, dan selalu periksa izin di server. Di modul ini kamu belajar membedakan identitas dan izin, menyimpan password dengan aman, memilih session atau JWT, serta mengenali serangan yang paling sering terjadi.",
  goals: [
    "Membedakan authentication dan authorization.",
    "Menjelaskan kenapa password harus di-hash, bukan dienkripsi.",
    "Membandingkan session cookie dan JWT.",
    "Membaca struktur JWT dan tahu apa yang boleh disimpan di dalamnya.",
    "Memasang middleware dan menghindari celah umum.",
  ],
  sections: [
    {
      title: "Authentication vs authorization",
      body: [
        "Authentication (authn) menjawab: siapa kamu? Prosesnya login, verifikasi password, verifikasi token, atau verifikasi kode OTP. Hasilnya adalah identitas yang dikenali server.",
        "Authorization (authz) menjawab: apa yang boleh kamu lakukan? Setelah identitas diketahui, server memeriksa role, kepemilikan data, atau izin khusus. Contoh: user biasa boleh membaca profilnya sendiri, admin boleh melihat semua profil.",
        "Status 401 dan 403 sering tertukar. 401 Unauthorized berarti belum terautentikasi (belum login / token tidak valid). 403 Forbidden berarti sudah terautentikasi tetapi tidak punya izin.",
        "Keduanya harus diperiksa di server. Menyembunyikan tombol admin di frontend hanya menyembunyikan tampilan, bukan akses. Penyerang bisa memanggil endpoint langsung dengan curl.",
      ],
      table: {
        head: ["Pertanyaan", "Konsep", "Contoh gagal"],
        rows: [
          ["Siapa kamu?", "Authentication", "401 Unauthorized"],
          ["Apa yang boleh kamu lakukan?", "Authorization", "403 Forbidden"],
          ["Apakah token valid?", "Authentication", "401"],
          ["Apakah kamu pemilik data ini?", "Authorization", "403 atau 404"],
        ],
      },
      examples: [
        {
          title: "Dua user, dua hasil berbeda",
          code: `login ratih@nduttt.be rahasia
GET /api/me
→ 200 { "name": "Tuan Putri Ratih", "role": "princess" }

GET /api/admin
→ 403 { "error": "Role princess bukan owner" }

login admin@nduttt.be admin123
GET /api/admin
→ 200 { "message": "Selamat datang, Admin" }`,
          output: `Ratih dikenali (authn sukses),
tetapi tidak berhak masuk admin (authz gagal).
Admin dikenali dan berhak.`,
          note: "401 = belum tahu siapa. 403 = sudah tahu, tetapi tidak boleh.",
        },
      ],
      warning: "Jangan menganggap user yang sudah login otomatis boleh mengakses semua data. Periksa kepemilikan: apakah hati ini benar milik user yang sedang login?",
      practice: {
        prompt: "Login sebagai Ratih, buka profil, lalu coba masuk area admin. Perhatikan 403.",
        commands: [
          { label: "Login Ratih", command: "login ratih@nduttt.be rahasia" },
          { label: "Profil", command: "GET /api/me" },
          { label: "Admin", command: "GET /api/admin" },
        ],
        hint: "Login berhasil ≠ punya semua izin. Role tetap diperiksa di server.",
      },
    },
    {
      title: "Password: hash, salt, dan bcrypt",
      body: [
        "Password tidak boleh disimpan sebagai teks biasa. Kalau database bocor, semua password langsung terbaca. Password juga tidak boleh dienkripsi dengan kunci yang disimpan di server, karena kunci itu bisa bocor juga.",
        "Solusinya hashing satu arah. Hash mengubah password menjadi deretan karakter yang tidak bisa dikembalikan. Saat login, server menghitung hash dari password yang dikirim, lalu membandingkannya dengan hash tersimpan.",
        "Salt adalah nilai acak unik yang ditambahkan sebelum hashing. Dengan salt, dua user dengan password sama tetap punya hash berbeda. Ini menggagalkan rainbow table. bcrypt dan argon2 adalah algoritma hash yang sengaja lambat dan menambahkan salt otomatis.",
        "Cost factor membuat hashing makin lambat seiring bertambahnya nilai. Lambat untuk penyerang yang mencoba jutaan kombinasi, tetapi masih nyaman untuk satu user yang login. Gunakan cost 10–12 dan sesuaikan dengan hardware.",
      ],
      examples: [
        {
          title: "Alur daftar dan login",
          code: `// saat daftar
const hash = await bcrypt.hash(password, 12);
await db.users.create({ email, passwordHash: hash });

// saat login
const user = await db.users.findByEmail(email);
const cocok = await bcrypt.compare(password, user.passwordHash);
if (!cocok) return res.status(401).json({ error: "Email atau password salah" });`,
          output: `password "rahasia"
→ hash $2b$12$... (berbeda setiap kali karena salt)

bcrypt.compare("rahasia", hash) → true
bcrypt.compare("salah", hash)   → false`,
          note: "Hash tidak bisa di-decrypt. Kalau user lupa password, lakukan reset, bukan mengirim password lama.",
        },
      ],
      warning: "Jangan memakai MD5 atau SHA-1 untuk password. Keduanya terlalu cepat dan sudah lama dianggap tidak aman untuk tujuan ini.",
      practice: {
        prompt: "Hash sebuah password di lab, lalu coba verifikasi dengan password yang benar dan salah.",
        commands: [
          { label: "Hash", command: "hash rahasia" },
          { label: "Verifikasi benar", command: "verify rahasia" },
          { label: "Verifikasi salah", command: "verify salah" },
        ],
        hint: "`verify` tanpa hash memakai hasil `hash` terakhir. Perhatikan bahwa password benar cocok, password salah tidak.",
      },
    },
    {
      title: "Session vs JWT",
      body: [
        "Session cookie menyimpan state di server. Browser hanya membawa session id acak. Server mencocokkan id itu dengan data sesi di memory/Redis. Kelebihannya: logout bisa instan karena server cukup menghapus sesi.",
        "JWT (JSON Web Token) menyimpan claims di token itu sendiri. Server tidak perlu menyimpan state; cukup memverifikasi signature. Kelebihannya: cocok untuk API, mobile, dan banyak server. Kekurangannya: mencabut token sebelum expired butuh deny-list atau refresh token.",
        "Cookie sesi harus diberi atribut HttpOnly (tidak bisa dibaca JavaScript), Secure (hanya lewat HTTPS), dan SameSite (membatasi pengiriman lintas situs). Ini mengurangi risiko XSS dan CSRF.",
        "Pilihan umum di production: access token berumur pendek (5–15 menit) + refresh token yang disimpan aman dan bisa dicabut. Jangan membuat access token berlaku berbulan-bulan.",
      ],
      table: {
        head: ["Aspek", "Session cookie", "JWT"],
        rows: [
          ["State", "Di server", "Di token (stateless)"],
          ["Isi", "Session id acak", "Claims: sub, role, exp"],
          ["Logout instan", "Mudah", "Butuh deny-list / refresh"],
          ["Multi-server", "Butuh shared store", "Cukup verifikasi signature"],
          ["Cocok untuk", "Web app klasik", "API, mobile, microservice"],
        ],
      },
      examples: [
        {
          title: "Session cookie yang aman",
          code: `Set-Cookie: session=abc123;
  HttpOnly;
  Secure;
  SameSite=Lax;
  Path=/;
  Max-Age=3600`,
          output: `HttpOnly → JavaScript tidak bisa mencuri cookie
Secure   → hanya dikirim lewat HTTPS
SameSite → mengurangi CSRF
Max-Age  → cookie kedaluwarsa otomatis`,
          note: "Session id harus acak dan cukup panjang. Jangan memakai id yang bisa ditebak.",
        },
      ],
      tip: "Untuk aplikasi web sederhana, session cookie sering lebih mudah diamankan. Untuk API yang dipakai mobile dan banyak service, JWT lebih praktis.",
      practice: {
        prompt: "Login, cek identitasmu, lalu logout. Perhatikan bahwa server tidak lagi mengenali request berikutnya.",
        commands: [
          { label: "Login", command: "login ratih@nduttt.be rahasia" },
          { label: "Siapa aku", command: "whoami" },
          { label: "Logout", command: "logout" },
          { label: "Cek lagi", command: "GET /api/me" },
        ],
        hint: "Setelah logout, /api/me harus mengembalikan 401.",
      },
    },
    {
      title: "Anatomi JWT",
      body: [
        "JWT punya tiga bagian yang dipisahkan titik: header.payload.signature. Header berisi algoritma dan tipe token. Payload berisi claims seperti sub (subject/user id), role, iat (issued at), dan exp (expiration). Signature adalah tanda tangan server.",
        "Payload hanya di-encode base64url, bukan dienkripsi. Siapa pun yang punya token bisa membaca isinya. Karena itu jangan simpan password, nomor kartu, atau rahasia lain di payload.",
        "Signature dibuat dengan secret milik server. Kalau payload diubah, signature tidak lagi cocok. Verifikasi signature memastikan token tidak dipalsukan, tetapi tidak menyembunyikan isinya.",
        "Klaim exp harus diperiksa. Token yang sudah kedaluwarsa harus ditolak. Jangan hanya mengandalkan frontend untuk menghapus token dari localStorage.",
      ],
      examples: [
        {
          title: "Tiga bagian JWT",
          code: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9
.
eyJzdWIiOiJ1X3JhdGloIiwicm9sZSI6InByaW5jZXNzIiwiZXhwIjoxODkzNDU2MDAwfQ
.
cS9K1f0Gm7pQ...`,
          output: `Header  : { "alg": "HS256", "typ": "JWT" }
Payload : { "sub": "u_ratih", "role": "princess", "exp": 1893456000 }
Signature: dibuat server dengan JWT_SECRET`,
          note: "Base64 bukan enkripsi. Siapa pun bisa decode payload; hanya signature yang tidak bisa dipalsukan tanpa secret.",
        },
      ],
      warning: "Jangan memakai secret yang lemah atau sama dengan nama proyek. JWT_SECRET harus panjang, acak, disimpan di environment, dan dirotasi kalau bocor.",
      practice: {
        prompt: "Buat JWT dengan payload sederhana, lalu decode untuk melihat isinya.",
        commands: [
          { label: "Encode", command: 'jwt encode {"sub":"u_ratih","role":"princess","exp":1893456000}' },
          { label: "Decode", command: "jwt decode" },
        ],
        hint: "`jwt decode` tanpa token memakai token dari perintah Encode terakhir. Perhatikan bahwa payload bisa dibaca siapa pun.",
      },
    },
    {
      title: "Middleware: satpam di pintu masuk",
      body: [
        "Middleware adalah fungsi yang berjalan sebelum handler utama. Tugasnya bisa memeriksa token, menempelkan data user ke request, mencatat log, atau menolak request lebih awal.",
        "Alur auth middleware: ambil token dari header Authorization → verifikasi signature dan exp → jika valid, tempel req.user → lanjut ke handler. Jika tidak valid, kirim 401 dan hentikan rantai.",
        "Setelah authentication, lakukan authorization. Contoh: hanya role owner yang boleh POST/PATCH/DELETE, atau hanya pemilik hati yang boleh mengubah hatinya. Cek ini di handler atau middleware khusus.",
        "Urutan penting. Kalau handler bisnis jalan sebelum middleware, data bisa sudah terlanjur diubah. Pasang auth di depan, bukan di belakang.",
      ],
      examples: [
        {
          title: "Middleware Express",
          code: `export function requireAuth(req, res, next) {
  const token = req.headers.authorization?.replace("Bearer ", "");
  if (!token) return res.status(401).json({ error: "Butuh token" });

  try {
    req.user = jwt.verify(token, process.env.JWT_SECRET);
    next();
  } catch {
    return res.status(401).json({ error: "Token tidak valid" });
  }
}

app.get("/api/me", requireAuth, (req, res) => {
  res.json({ data: req.user });
});`,
          output: `Tanpa token  → 401
Token palsu  → 401
Token valid  → handler jalan, req.user tersedia`,
          note: "Middleware memusatkan pemeriksaan agar tidak diulang di setiap handler.",
        },
      ],
      warning: "Jangan memercayai role yang dikirim client di body request. Role harus berasal dari token/session yang sudah diverifikasi server.",
      practice: {
        prompt: "Coba akses admin sebagai Ratih (403), lalu login admin dan akses lagi (200).",
        commands: [
          { label: "Login Ratih", command: "login ratih@nduttt.be rahasia" },
          { label: "Coba admin", command: "GET /api/admin" },
          { label: "Login admin", command: "login admin@nduttt.be admin123" },
          { label: "Admin lagi", command: "GET /api/admin" },
        ],
        hint: "Perhatikan bahwa endpoint yang sama memberi hasil berbeda setelah role berubah.",
      },
    },
    {
      title: "Serangan umum dan cara mencegahnya",
      body: [
        "SQL injection terjadi saat input user disusun langsung menjadi query. Contoh: ' OR '1'='1. Solusinya parameterized query / prepared statement, bukan menambal dengan regex.",
        "XSS terjadi saat input user ditampilkan sebagai HTML tanpa escape. Penyerang bisa menyisipkan script. Solusinya escape output, gunakan framework yang aman, dan pasang Content-Security-Policy. Cookie HttpOnly juga mengurangi dampak pencurian sesi.",
        "CSRF terjadi saat situs lain membuat browser mengirim request atas nama user yang sedang login. Solusinya SameSite cookie, CSRF token, dan memeriksa Origin/Referer untuk operasi sensitif.",
        "IDOR (Insecure Direct Object Reference) terjadi saat user bisa mengganti id di URL dan mengakses data orang lain. Solusinya selalu cek kepemilikan: `WHERE id = ? AND owner_uid = ?`. Jangan hanya mengandalkan id yang sulit ditebak.",
      ],
      table: {
        head: ["Serangan", "Inti masalah", "Pencegahan"],
        rows: [
          ["SQL Injection", "Input jadi query", "Parameterized query"],
          ["XSS", "Input jadi HTML/script", "Escape output, CSP"],
          ["CSRF", "Request atas nama user", "SameSite, CSRF token"],
          ["IDOR", "Ganti id untuk akses data", "Cek kepemilikan"],
          ["Brute force", "Coba password terus", "Rate limit, lockout, MFA"],
          ["Secret leak", "Secret masuk repo/log", "Env, .gitignore, rotasi"],
        ],
      },
      examples: [
        {
          title: "Cara aman mengambil data milik user",
          code: `// ❌ rentan IDOR
SELECT * FROM hearts WHERE id = 5;

// ✅ cek kepemilikan
SELECT * FROM hearts
WHERE id = 5 AND owner_uid = 'u_ratih';`,
          output: `Request hati id 5 milik orang lain:
→ 404 / 403, bukan data orang lain.`,
          note: "Jangan beri tahu apakah data itu ada tetapi bukan milikmu. 404 sering lebih aman daripada 403 yang membocorkan keberadaan data.",
        },
      ],
      warning: "Jangan menampilkan pesan login yang membedakan 'email tidak ditemukan' dan 'password salah'. Gunakan pesan generik agar penyerang tidak bisa menebak email terdaftar.",
      practice: {
        prompt: "Lihat bagaimana server membedakan belum login (401) dan tidak berhak (403).",
        commands: [
          { label: "Tanpa login", command: "GET /api/admin" },
          { label: "Login Ratih", command: "login ratih@nduttt.be rahasia" },
          { label: "Masih 403", command: "GET /api/admin" },
        ],
        hint: "401 = identitas belum dikenal. 403 = identitas dikenal, izin tidak cukup.",
      },
    },
    {
      title: "Checklist keamanan sebelum rilis",
      body: [
        "Gunakan HTTPS di semua environment production. Cookie sesi wajib HttpOnly, Secure, dan SameSite. Jangan pernah mengirim token lewat URL.",
        "Validasi semua input di server, bukan hanya di frontend. Batasi ukuran body, panjang string, dan tipe data. Tolak input yang tidak dikenal dengan jelas.",
        "Terapkan rate limit pada login, register, dan endpoint yang mahal. Log aktivitas penting tanpa mencatat password/token. Siapkan monitoring untuk percobaan login gagal yang mencurigakan.",
        "Simpan secret di environment variable, bukan di repo. Rotasi secret kalau bocor. Terapkan least privilege: user dan service hanya mendapat akses yang benar-benar dibutuhkan.",
        "Uji ulang setelah perubahan. Keamanan bukan status 'sudah selesai', tetapi proses yang terus diperiksa.",
      ],
      examples: [
        {
          title: "Checklist singkat",
          code: `[x] HTTPS aktif
[x] Password di-hash bcrypt/argon2
[x] Cookie HttpOnly + Secure + SameSite
[x] Validasi input di server
[x] Cek kepemilikan data (IDOR)
[x] Rate limit login
[x] Secret di environment
[x] Error tidak membocorkan stack trace
[x] Firestore/DB rules tidak terbuka`,
          output: `Rilis tanpa checklist ini = utang keamanan yang menunggu jatuh tempo.`,
          note: "Cetak checklist ini dan tempel di dekat meja. Serius, ini membantu.",
        },
      ],
      tip: "Kalau kamu menemukan secret di repo publik, jangan hanya menghapus commit. Rotasi secret-nya, karena mungkin sudah disalin orang lain.",
      practice: {
        prompt: "Tantangan terakhir modul: login admin lalu buka area admin. Kamu sudah menguasai authn + authz dasar.",
        commands: [
          { label: "Login admin", command: "login admin@nduttt.be admin123" },
          { label: "Area admin", command: "GET /api/admin" },
        ],
        hint: "Role owner hanya dimiliki akun admin di lab ini.",
      },
    },
  ],
  summary: [
    "Authentication mengenali identitas; authorization menentukan izin.",
    "Password harus di-hash dengan salt (bcrypt/argon2), bukan disimpan atau dienkripsi.",
    "Session menyimpan state di server; JWT stateless tetapi sulit dicabut.",
    "Payload JWT bisa dibaca siapa pun; jangan simpan rahasia di sana.",
    "Middleware memeriksa auth sebelum handler bisnis berjalan.",
    "Cek kepemilikan data untuk mencegah IDOR.",
  ],
};

export default module;
