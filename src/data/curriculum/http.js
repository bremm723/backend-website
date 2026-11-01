const module = {
  id: "http",
  title: "Cara Kerja Web & HTTP",
  shortTitle: "Web & HTTP",
  emoji: "🌐",
  badge: "Inti",
  levelId: 1,
  intro:
    "Semua yang kamu lihat di internet adalah hasil percakapan antara client dan server. Modul ini membedah percakapan itu dari awal: kamu mengetik alamat, browser mengirim request, server menyiapkan jawaban, lalu browser menampilkannya. Setelah paham alurnya, istilah seperti method, status code, header, dan body tidak akan terasa acak lagi.",
  goals: [
    "Menjelaskan alur request-response dengan bahasa sendiri.",
    "Membaca URL, method, status code, header, dan body.",
    "Membedakan 401 vs 403 vs 404 vs 500.",
    "Memahami kenapa HTTP butuh session atau token.",
  ],
  sections: [
    {
      title: "Dari mengetik URL sampai server menjawab",
      body: [
        "Browser adalah client: dia yang meminta. Server adalah komputer yang menunggu permintaan, memprosesnya, lalu membalas. Backend developer bekerja di sisi server: menyiapkan data, aturan, validasi, dan response.",
        "Saat kamu mengetik https://nduttt.be/overview, browser tidak langsung tahu server mana yang harus dihubungi. Domain harus diterjemahkan dulu menjadi alamat IP lewat DNS. Setelah itu browser membuka koneksi (TCP), mengamankannya dengan TLS/HTTPS, lalu mengirim HTTP request.",
        "Server menerima request, menjalankan logika (misalnya mengambil data dari database), lalu mengirim HTTP response. Browser membaca response itu dan merender HTML/CSS/JavaScript menjadi halaman yang kamu lihat.",
        "Istilah frontend dan backend bukan tembok pemisah yang mistis. Frontend adalah bagian yang berjalan di browser; backend adalah bagian yang berjalan di server. Mereka berkomunikasi lewat kontrak bernama API.",
      ],
      steps: [
        "Kamu mengetik URL atau menekan tombol di halaman.",
        "DNS menerjemahkan domain menjadi IP server.",
        "Browser membuka koneksi TCP dan TLS (kalau HTTPS).",
        "Browser mengirim request: method, path, header, mungkin body.",
        "Server memproses: validasi, database, logika bisnis.",
        "Server mengirim response: status, header, body.",
        "Browser merender hasilnya atau menjalankan JavaScript lanjutan.",
      ],
      analogy:
        "Bayangkan restoran. Kamu (client) memesan makanan, dapur (server) memasak, pelayan (network) mengantar. Kamu tidak perlu tahu isi dapur; kamu hanya perlu tahu cara memesan dan membaca jawaban pelayan.",
      examples: [
        {
          title: "Request dan response paling sederhana",
          code: `GET /api/hearts HTTP/1.1
Host: nduttt.be
Accept: application/json`,
          output: `HTTP/1.1 200 OK
Content-Type: application/json

{
  "data": [
    { "id": 1, "to": "Tuan Putri Ratih", "note": "Semangat belajar!" }
  ]
}`,
          note: "Baris pertama adalah 'pesanan'. Baris-baris setelahnya adalah header. Bagian setelah baris kosong adalah body.",
        },
      ],
      tip: "Jangan buru-buru menghafal semua istilah. Fokus dulu pada alurnya: client minta → server proses → server balas.",
      practice: {
        prompt: "Coba kirim request GET pertama kamu ke lab. Perhatikan method, path, status, dan body yang muncul.",
        commands: [{ label: "GET daftar hati", command: "GET /api/hearts" }],
        hint: "Di terminal, tulis persis: GET /api/hearts lalu tekan Enter.",
      },
    },
    {
      title: "Anatomi URL: alamat yang menyimpan banyak informasi",
      body: [
        "URL bukan sekadar alamat. Di dalamnya ada protokol, domain, port, path, query, dan fragment. Masing-masing punya peran berbeda.",
        "Path menunjukkan resource yang kamu tuju, misalnya /api/hearts/1. Query string setelah tanda tanya dipakai untuk filter, pencarian, pengurutan, atau pagination. Query bersifat opsional dan tidak mengubah identitas resource.",
        "Fragment setelah tanda # hanya dipakai browser untuk menunjuk bagian halaman. Fragment tidak dikirim ke server. Jadi jangan taruh data penting di sana.",
        "Karakter khusus di URL harus di-encode. Spasi menjadi %20, dan karakter seperti & di dalam nilai query harus ditulis %26 supaya tidak dianggap pemisah parameter.",
      ],
      table: {
        head: ["Bagian", "Contoh", "Fungsi"],
        rows: [
          ["Scheme", "https://", "Protokol dan keamanan koneksi"],
          ["Host", "nduttt.be", "Nama server yang dituju"],
          ["Port", ":443", "Pintu koneksi (HTTPS default 443)"],
          ["Path", "/api/hearts/1", "Resource yang diminta"],
          ["Query", "?sort=newest&limit=3", "Filter / pengurutan / pagination"],
          ["Fragment", "#komentar", "Posisi di halaman, tidak dikirim ke server"],
        ],
      },
      examples: [
        {
          title: "Membaca URL dengan teliti",
          code: `https://nduttt.be:443/api/hearts?sort=newest&limit=3#hasil`,
          output: `scheme   : https
host     : nduttt.be
port     : 443
path     : /api/hearts
query    : sort=newest & limit=3
fragment : hasil`,
          note: "Kalau hanya ingin satu hati, identitasnya ada di path (/api/hearts/1). Kalau ingin mengatur daftar, gunakan query.",
        },
      ],
      warning: "Jangan pernah menaruh password, token, atau data rahasia di URL. URL bisa tersimpan di riwayat browser, log server, dan Referer header.",
      practice: {
        prompt: "Coba dua request ini. Perhatikan bedanya: satu memakai path param, satu memakai query param.",
        commands: [
          { label: "Satu hati", command: "GET /api/hearts/1" },
          { label: "Daftar + query", command: "GET /api/hearts?sort=newest&limit=2" },
        ],
        hint: "Path param menunjuk identitas resource. Query param mengatur tampilan daftar.",
      },
    },
    {
      title: "HTTP Method: kata kerja di balik request",
      body: [
        "Method menjelaskan aksi yang ingin dilakukan. URL menyebut benda/resource, method menyebut aksinya. Inilah inti gaya REST yang akan kita dalami di modul berikutnya.",
        "GET dipakai untuk mengambil data dan tidak boleh mengubah apa pun. POST dipakai untuk membuat resource baru. PUT mengganti seluruh resource. PATCH mengubah sebagian field. DELETE menghapus resource.",
        "Ada istilah safe dan idempotent. Safe berarti tidak mengubah data (GET, HEAD, OPTIONS). Idempotent berarti memanggil berkali-kali menghasilkan keadaan akhir yang sama (GET, PUT, DELETE). POST tidak idempotent: klik dua kali bisa membuat dua data.",
        "Method bukan sekadar formalitas. Server, cache, browser, dan alat monitoring memakai method untuk menentukan perilaku yang aman. Jangan memakai GET untuk menghapus data hanya karena lebih mudah diklik.",
      ],
      table: {
        head: ["Method", "Aksi", "Body?", "Idempotent", "Contoh"],
        rows: [
          ["GET", "Ambil data", "Tidak", "Ya", "GET /api/hearts"],
          ["POST", "Buat data baru", "Ya", "Tidak", "POST /api/hearts"],
          ["PUT", "Ganti seluruh data", "Ya", "Ya", "PUT /api/hearts/1"],
          ["PATCH", "Ubah sebagian", "Ya", "Tidak selalu", "PATCH /api/hearts/1"],
          ["DELETE", "Hapus data", "Biasanya tidak", "Ya", "DELETE /api/hearts/1"],
          ["HEAD", "Ambil header saja", "Tidak", "Ya", "HEAD /api/hearts"],
        ],
      },
      examples: [
        {
          title: "Membuat lalu mengubah hati",
          code: `POST /api/hearts
Content-Type: application/json

{ "to": "Tuan Putri Ratih", "note": "Hati pertama dari lab!" }

PATCH /api/hearts/1
Content-Type: application/json

{ "note": "Catatan yang sudah diperbarui" }`,
          output: `201 Created
{ "data": { "id": 4, "to": "Tuan Putri Ratih", "note": "Hati pertama dari lab!" } }

200 OK
{ "data": { "id": 1, "to": "Tuan Putri Ratih", "note": "Catatan yang sudah diperbarui" } }`,
          note: "POST mengembalikan 201 karena resource baru dibuat. PATCH mengembalikan 200 karena resource lama berhasil diubah.",
        },
      ],
      warning: "Jangan kirim body JSON ke GET. GET seharusnya hanya membaca. Kalau butuh mengirim data kompleks untuk pencarian, gunakan query param atau ubah desain endpoint.",
      practice: {
        prompt: "Sekarang giliranmu. Buat satu hati baru, lalu ubah catatannya. Perhatikan status code yang berbeda.",
        commands: [
          { label: "Buat hati", command: 'POST /api/hearts {"to":"Tuan Putri Ratih","note":"Halo dari lab!"}' },
          { label: "Ubah catatan", command: 'PATCH /api/hearts/1 {"note":"Catatan baru dari Ratih"}' },
        ],
        hint: "JSON harus memakai tanda kutip ganda. Kalau muncul 400, cek tanda kutip dan koma.",
      },
    },
    {
      title: "Status Code: bahasa singkat server",
      body: [
        "Status code adalah angka tiga digit yang langsung memberi tahu hasil request. Kamu tidak perlu membaca seluruh body untuk tahu apakah request berhasil.",
        "Keluarga 2xx berarti sukses. 200 OK adalah sukses umum, 201 Created berarti data baru dibuat, 204 No Content berarti sukses tanpa body. Keluarga 3xx berarti redirect. Keluarga 4xx berarti ada masalah di sisi client: request salah, belum login, tidak punya izin, atau resource tidak ada. Keluarga 5xx berarti server yang gagal memproses.",
        "401 Unauthorized sering disalahartikan. Artinya server belum mengenali identitasmu (belum login atau token tidak valid). 403 Forbidden berarti identitasmu sudah dikenali, tetapi kamu tidak punya hak akses. 404 berarti resource tidak ditemukan. 500 berarti ada bug atau exception di server.",
        "API yang baik tidak mengembalikan 200 untuk error. Kalau gagal, gunakan status yang sesuai dan body error yang konsisten. Ini membantu frontend, monitoring, dan pengguna.",
      ],
      table: {
        head: ["Kode", "Nama", "Kapan muncul"],
        rows: [
          ["200", "OK", "Permintaan sukses dan ada body"],
          ["201", "Created", "Resource baru berhasil dibuat (POST)"],
          ["204", "No Content", "Sukses tanpa body (DELETE)"],
          ["400", "Bad Request", "Input tidak valid / JSON rusak"],
          ["401", "Unauthorized", "Belum login / token tidak valid"],
          ["403", "Forbidden", "Sudah login tapi tidak boleh"],
          ["404", "Not Found", "Resource tidak ada"],
          ["409", "Conflict", "Bentrok data, misal email sudah dipakai"],
          ["429", "Too Many Requests", "Kena rate limit"],
          ["500", "Internal Server Error", "Bug di server"],
          ["502/503", "Bad Gateway / Unavailable", "Proxy gagal / server down"],
        ],
      },
      examples: [
        {
          title: "Tiga response yang berbeda arti",
          code: `GET /api/hearts/999
GET /api/private
GET /api/crash`,
          output: `404 Not Found
{ "error": { "code": "HEART_NOT_FOUND", "message": "Hati dengan id 999 tidak ditemukan." } }

401 Unauthorized
{ "error": { "code": "UNAUTHENTICATED", "message": "Endpoint ini butuh token login." } }

500 Internal Server Error
{ "error": { "code": "INTERNAL_SERVER_ERROR", "message": "Terjadi kesalahan di server." } }`,
          note: "Perhatikan: status code dan body saling mendukung. Jangan hanya melihat angka 200.",
        },
      ],
      tip: "Cara cepat mengingat: 4xx = permintaanmu bermasalah, 5xx = server yang bermasalah. 401 = 'siapa kamu?', 403 = 'aku tahu kamu, tapi tidak boleh'.",
      practice: {
        prompt: "Coba picu 404, 401, dan 500. Perhatikan bahwa setiap status punya arti yang berbeda.",
        commands: [
          { label: "404", command: "GET /api/hearts/999" },
          { label: "401", command: "GET /api/private" },
          { label: "500", command: "GET /api/crash" },
        ],
        hint: "Jangan panik saat melihat 4xx/5xx. Di lab ini justru itu yang sedang kita pelajari.",
      },
    },
    {
      title: "Header & Body: amplop dan isi surat",
      body: [
        "Header adalah metadata tentang request atau response. Isinya bukan data utama, tetapi informasi yang membantu server dan client memproses data tersebut. Contohnya Content-Type, Accept, Authorization, User-Agent, dan Set-Cookie.",
        "Body adalah isi datanya. Pada POST/PATCH/PUT, body biasanya berisi JSON. Pada GET, body umumnya kosong karena data yang dibutuhkan ada di URL.",
        "Content-Type memberi tahu format body. Kalau kamu mengirim JSON, tulis application/json. Tanpa header ini, server bisa salah menafsirkan body. Accept memberi tahu format response yang diinginkan client. Authorization membawa token login.",
        "Response juga punya header. Set-Cookie dipakai server untuk menitipkan cookie sesi ke browser. Cache-Control mengatur apakah response boleh disimpan di cache. Header keamanan seperti CSP dan HSTS melindungi halaman dari serangan.",
      ],
      table: {
        head: ["Header", "Arah", "Fungsi"],
        rows: [
          ["Content-Type", "Request/Response", "Format body, misal application/json"],
          ["Accept", "Request", "Format response yang diinginkan client"],
          ["Authorization", "Request", "Membawa token, misal Bearer <jwt>"],
          ["User-Agent", "Request", "Info browser / aplikasi pengirim"],
          ["Set-Cookie", "Response", "Menitipkan cookie sesi ke browser"],
          ["Cache-Control", "Response", "Aturan cache"],
        ],
      },
      examples: [
        {
          title: "Request JSON yang lengkap",
          code: `POST /api/hearts HTTP/1.1
Host: nduttt.be
Content-Type: application/json
Accept: application/json
Authorization: Bearer eyJhbGciOi...

{
  "to": "Tuan Putri Ratih",
  "note": "Semangat belajarnya!"
}`,
          output: `HTTP/1.1 201 Created
Content-Type: application/json
Location: /api/hearts/4

{
  "data": {
    "id": 4,
    "to": "Tuan Putri Ratih",
    "note": "Semangat belajarnya!"
  }
}`,
          note: "Header adalah 'amplop'. Body adalah 'surat'. Keduanya punya tugas berbeda.",
        },
      ],
      tip: "Kalau API-mu mengembalikan JSON tetapi frontend gagal membacanya, periksa Content-Type terlebih dahulu. Sering kali masalahnya bukan datanya, tetapi label formatnya.",
      practice: {
        prompt: "Buat satu hati dengan body JSON. Lalu jalankan HEAD untuk melihat response tanpa body.",
        commands: [
          { label: "POST JSON", command: 'POST /api/hearts {"to":"Ratih","note":"Belajar header & body"}' },
          { label: "HEAD", command: "HEAD /api/hearts" },
        ],
        hint: "HEAD mirip GET, tetapi server hanya mengembalikan header tanpa body.",
      },
    },
    {
      title: "Stateless & kenapa login butuh session",
      body: [
        "HTTP bersifat stateless: setiap request berdiri sendiri. Server tidak otomatis ingat bahwa request kedua berasal dari orang yang sama dengan request pertama. Ini bukan bug; ini desain yang membuat HTTP sederhana dan mudah diskalakan.",
        "Karena stateless, login membutuhkan mekanisme tambahan. Ada dua pendekatan besar: session cookie (server menyimpan state, browser membawa session id) dan token seperti JWT (server cukup memverifikasi tanda tangan token).",
        "Cookie dikirim otomatis oleh browser pada setiap request ke domain yang sama. Itulah kenapa cookie cocok untuk session web. Token biasanya dikirim manual lewat header Authorization, sehingga lebih fleksibel untuk API dan aplikasi mobile.",
        "Analogi sederhana: server adalah pelayan yang amnesia. Setiap kali kamu datang, dia tidak ingat kamu. Supaya dia ingat, kamu harus membawa kartu identitas (cookie/token) di setiap pesanan.",
      ],
      steps: [
        "Client mengirim email dan password ke endpoint login.",
        "Server memverifikasi kredensial.",
        "Server membuat session id atau token.",
        "Server mengirim Set-Cookie atau token di body response.",
        "Request berikutnya membawa cookie/token tersebut.",
        "Server memeriksa identitas sebelum memproses request.",
      ],
      examples: [
        {
          title: "Alur login lalu mengakses profil",
          code: `POST /api/login
{ "email": "ratih@nduttt.be", "password": "rahasia" }

GET /api/me
Authorization: Bearer <token>`,
          output: `200 OK
{ "data": { "name": "Tuan Putri Ratih", "role": "princess" } }

200 OK
{ "data": { "name": "Tuan Putri Ratih", "email": "ratih@nduttt.be" } }

Tanpa token:
401 Unauthorized
{ "error": { "code": "UNAUTHENTICATED", "message": "Login dulu." } }`,
          note: "Setelah login, identitas tidak ajaib muncul sendiri. Client harus membawa bukti identity di request berikutnya.",
        },
      ],
      warning: "Menyembunyikan tombol di frontend bukan keamanan. Penyerang bisa memanggil API langsung. Pemeriksaan identitas dan izin wajib dilakukan di server.",
      practice: {
        prompt: "Login, buka profilmu, lalu logout dan coba buka profil lagi. Perhatikan perubahan statusnya.",
        commands: [
          { label: "Login", command: "login ratih@nduttt.be rahasia" },
          { label: "Profil", command: "GET /api/me" },
          { label: "Logout", command: "logout" },
        ],
        hint: "Akun demo: ratih@nduttt.be / rahasia. Setelah logout, /api/me akan mengembalikan 401.",
      },
    },
  ],
  summary: [
    "Internet adalah percakapan request-response antara client dan server.",
    "URL punya path (identitas) dan query (filter/pagination).",
    "Method menyatakan aksi; status code menyatakan hasil.",
    "Header adalah metadata, body adalah data.",
    "HTTP stateless, jadi login membutuhkan cookie atau token.",
  ],
};

export default module;
