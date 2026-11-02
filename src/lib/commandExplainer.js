/**
 * Penjelasan singkat per perintah terminal:
 * - fungsi: perintah ini untuk apa
 * - flow: alur singkat dari client sampai response
 * - behind: apa yang terjadi di balik layar
 *
 * Sengaja pendek supaya terminal tetap jadi fokus utama.
 */

const HTTP_STATUS_NOTE = {
  200: "Status 200 berarti request berhasil dan response berisi data.",
  201: "Status 201 berarti resource baru berhasil dibuat.",
  204: "Status 204 berarti sukses tanpa body.",
  400: "Status 400 berarti input tidak valid.",
  401: "Status 401 berarti identitas belum dikenal atau token tidak valid.",
  403: "Status 403 berarti identitas sudah dikenal, tetapi tidak punya izin.",
  404: "Status 404 berarti resource yang diminta tidak ditemukan.",
  429: "Status 429 berarti terlalu banyak request dalam waktu singkat.",
  500: "Status 500 berarti terjadi error di sisi server.",
};

function httpLine(result) {
  return (result?.lines || []).find((line) => line?.kind === "http") || null;
}

function statusChip(result) {
  const http = httpLine(result);
  if (!http) return "Response";
  return `${http.status} ${http.statusText || ""}`.trim();
}

function statusNote(result) {
  const http = httpLine(result);
  return http ? HTTP_STATUS_NOTE[http.status] || "" : "";
}

function withStatus(behind, result) {
  const note = statusNote(result);
  return note ? `${behind} ${note}` : behind;
}

function shortPath(path) {
  const clean = path.split("?")[0];
  return clean.length > 26 ? `${clean.slice(0, 23)}…` : clean;
}

function explainHttp(method, path, result) {
  const cleanPath = path.split("?")[0];
  const idMatch = cleanPath.match(/\/api\/hearts\/(\d+)$/);
  const id = idMatch?.[1];
  const isList = cleanPath === "/api/hearts" || cleanPath === "/api/hearts/";
  const isDetail = Boolean(idMatch) && cleanPath !== "/api/hearts/999";
  const status = statusChip(result);

  if (cleanPath === "/api/hearts/999") {
    return {
      fungsi: "Menguji response saat resource tidak ditemukan.",
      flow: ["Browser", "GET /api/hearts/999", "Server cari id 999", status],
      behind:
        "Server mencari hati dengan id 999, tidak menemukannya, lalu membalas 404 beserta body error. Ini bukan server mati; resource yang diminta memang tidak ada.",
    };
  }

  if (cleanPath === "/api/private") {
    return {
      fungsi: "Menguji endpoint yang wajib login.",
      flow: ["Browser", "GET /api/private", "Server cek token", status],
      behind:
        "Server memeriksa header Authorization. Kalau token tidak ada atau tidak valid, identitas belum dikenal dan request ditolak dengan 401 Unauthorized.",
    };
  }

  if (cleanPath === "/api/crash") {
    return {
      fungsi: "Melihat response saat server mengalami error.",
      flow: ["Browser", "GET /api/crash", "Server exception", status],
      behind:
        "Terjadi exception di dalam server. Server menangkapnya dan membalas 500 tanpa membocorkan stack trace atau detail internal ke client.",
    };
  }

  if (cleanPath === "/api/limited") {
    return {
      fungsi: "Menguji rate limit pada endpoint.",
      flow: ["Browser", "GET /api/limited", "Server hitung request", status],
      behind:
        "Server menghitung jumlah request dalam jendela waktu tertentu. Kalau batasnya terlampaui, request ditolak sementara dengan 429 Too Many Requests.",
    };
  }

  if (cleanPath === "/api/me") {
    const rejected = httpLine(result)?.status === 401;
    return {
      fungsi: "Mengambil profil user yang sedang login.",
      flow: ["Client", "GET /api/me", "Server baca token", status],
      behind: rejected
        ? "Server tidak menemukan token yang valid, jadi belum tahu ini user siapa. Login dulu supaya request berikutnya membawa identitas."
        : "Server membaca token dari header Authorization, memverifikasi tanda tangannya, lalu mengambil profil user yang cocok.",
    };
  }

  if (cleanPath === "/api/admin") {
    const http = httpLine(result);
    const note = http?.status === 403
      ? "Identitas sudah dikenali, tetapi role-nya bukan admin. Inilah bedanya 403 (tidak boleh) dengan 401 (belum login)."
      : http?.status === 200
      ? "Role admin cocok, jadi server mengizinkan akses ke data khusus admin."
      : withStatus("Server memeriksa identitas dan role sebelum mengizinkan akses.", result);
    return {
      fungsi: "Mengecek akses ke endpoint khusus admin.",
      flow: ["Client", "GET /api/admin", "Server cek role", status],
      behind: note,
    };
  }

  if (cleanPath === "/api/health") {
    return {
      fungsi: "Mengecek apakah server masih hidup dan sehat.",
      flow: ["Client", "GET /api/health", "Cek proses", status],
      behind:
        "Endpoint health biasanya mengecek koneksi database dan proses utama. Kalau sehat, server membalas 200 dengan status singkat.",
    };
  }

  if (isList && method === "GET") {
    const hasQuery = path.includes("?");
    return {
      fungsi: hasQuery
        ? "Mengambil daftar hati dengan filter atau pagination."
        : "Mengambil daftar hati dari server.",
      flow: hasQuery
        ? ["Browser", "GET /api/hearts?…", "Server filter", status]
        : ["Browser", "GET /api/hearts", "Server baca data", status],
      behind: hasQuery
        ? "Query string setelah tanda tanya mengatur tampilan daftar: pencarian, urutan, atau jumlah data. Query tidak mengubah identitas resource."
        : withStatus(
            "Server mencocokkan method GET + path, membaca data tanpa mengubahnya, lalu mengirim JSON. GET aman dipanggil berulang kali.",
            result
          ),
    };
  }

  if (isList && method === "HEAD") {
    return {
      fungsi: "Mengambil header daftar hati tanpa body.",
      flow: ["Browser", "HEAD /api/hearts", "Server siapkan header", status],
      behind:
        "HEAD mirip GET, tetapi body tidak dikirim. Cocok untuk mengecek keberadaan, ukuran, atau tipe resource tanpa mengunduh isinya.",
    };
  }

  if (isList && method === "POST") {
    const code = httpLine(result)?.status;
    return {
      fungsi: "Membuat hati baru dari body JSON.",
      flow: ["Browser", "POST /api/hearts", "Validasi + simpan", status],
      behind:
        code === 400
          ? "Body belum memenuhi field wajib, jadi server menolak sebelum menyimpan apa pun. Status 400 berarti input tidak valid."
          : "Body JSON dibaca dan divalidasi. Kalau valid, server membuat id baru, menyimpan data, lalu membalas 201 Created.",
    };
  }

  if (isDetail) {
    if (method === "GET") {
      return {
        fungsi: `Mengambil hati dengan id ${id}.`,
        flow: ["Browser", `GET /api/hearts/${id}`, "Server cari id", status],
        behind: withStatus(
          "Angka di akhir path adalah id resource. Server mencarinya di data, lalu mengembalikan objek yang cocok.",
          result
        ),
      };
    }
    if (method === "PATCH") {
      return {
        fungsi: `Mengubah sebagian data hati id ${id}.`,
        flow: ["Browser", `PATCH /api/hearts/${id}`, "Ubah field", status],
        behind:
          "Server hanya mengganti field yang ada di body, misalnya note; field lain tetap. Ini beda dengan PUT yang mengganti seluruh resource.",
      };
    }
    if (method === "PUT") {
      return {
        fungsi: `Mengganti seluruh data hati id ${id}.`,
        flow: ["Browser", `PUT /api/hearts/${id}`, "Ganti resource", status],
        behind:
          "PUT mengirim versi lengkap resource. Field yang tidak dikirim bisa dianggap hilang atau kembali ke nilai default.",
      };
    }
    if (method === "DELETE") {
      return {
        fungsi: `Menghapus hati dengan id ${id}.`,
        flow: ["Browser", `DELETE /api/hearts/${id}`, "Server hapus data", status],
        behind:
          "Server menghapus resource berdasarkan id. Kalau berhasil, biasanya membalas 204 No Content: sukses tanpa body. Kalau id tidak ada, hasilnya 404.",
      };
    }
  }

  if (method === "OPTIONS") {
    return {
      fungsi: "Menanyakan method yang diizinkan server.",
      flow: ["Browser", `OPTIONS ${shortPath(cleanPath)}`, "Server lihat route", status],
      behind:
        "Server membalas daftar method atau aturan CORS yang diizinkan untuk endpoint itu. Browser memakainya sebelum request tertentu.",
    };
  }

  const action = {
    GET: "Mengambil data",
    POST: "Membuat data",
    PUT: "Mengganti data",
    PATCH: "Mengubah sebagian data",
    DELETE: "Menghapus data",
    HEAD: "Mengambil header",
    OPTIONS: "Mengecek opsi",
  }[method] || "Mengirim request";

  return {
    fungsi: `${action} lewat endpoint ${shortPath(cleanPath)}.`,
    flow: ["Client", `${method} ${shortPath(cleanPath)}`, "Server proses", status],
    behind: withStatus(
      "Server membaca method, path, header, dan body, menjalankan logika route, lalu mengirim status + body yang sesuai.",
      result
    ),
  };
}

function explainSql(command) {
  const upper = command.toUpperCase();

  if (upper.startsWith("SHOW TABLES")) {
    return {
      fungsi: "Melihat daftar tabel yang ada di database.",
      flow: ["Query", "Baca metadata", "Daftar tabel"],
      behind:
        "Database membaca metadata skema untuk mengetahui tabel apa saja yang tersedia. Ini tidak membaca isi barisnya.",
    };
  }

  if (upper.startsWith("DESCRIBE")) {
    return {
      fungsi: "Melihat struktur kolom sebuah tabel.",
      flow: ["Query", "Baca skema", "Kolom + tipe"],
      behind:
        "Database membaca definisi tabel: nama kolom, tipe data, apakah boleh null, key, dan nilai default.",
    };
  }

  if (upper.startsWith("SELECT")) {
    const join = upper.includes(" JOIN ");
    const where = upper.includes(" WHERE ");
    const order = upper.includes(" ORDER BY ");
    return {
      fungsi: join
        ? "Menggabungkan data dari dua tabel atau lebih."
        : "Mengambil baris data dari tabel.",
      flow: join
        ? ["Query", "Ambil 2 tabel", "Cocokkan key", "Hasil gabungan"]
        : ["Query", "Parser", where ? "Filter WHERE" : "Scan tabel", "Result set"],
      behind: join
        ? "JOIN mencocokkan kolom yang sama di dua tabel (misalnya user_uid), lalu menggabungkan kolomnya. Hasilnya bisa difilter dan diurutkan seperti tabel biasa."
        : `Database mem-parsing query, ${where ? "memilih baris yang cocok dengan WHERE, " : "membaca baris tabel, "}${
            order ? "mengurutkan hasilnya, " : ""
          }lalu mengembalikan result set. SELECT tidak mengubah data.`,
    };
  }

  if (upper.startsWith("INSERT")) {
    return {
      fungsi: "Menambah baris baru ke tabel.",
      flow: ["Query", "Cek constraint", "Tulis baris", "Sukses"],
      behind:
        "Database memeriksa tipe dan constraint kolom, lalu menulis baris baru. Kalau ada kolom wajib yang kosong atau nilai bentrok, query gagal.",
    };
  }

  if (upper.startsWith("UPDATE")) {
    const where = upper.includes(" WHERE ");
    return {
      fungsi: "Mengubah nilai baris yang cocok.",
      flow: ["Query", where ? "Cari WHERE" : "Scan tabel", "Tulis perubahan", "Sukses"],
      behind: where
        ? "Hanya baris yang cocok dengan WHERE yang diubah. Tanpa WHERE, semua baris di tabel bisa ikut berubah."
        : "Query ini tidak punya WHERE, jadi semua baris bisa terkena perubahan. Di produksi, selalu batasi dengan WHERE.",
    };
  }

  if (upper.startsWith("DELETE")) {
    const where = upper.includes(" WHERE ");
    return {
      fungsi: "Menghapus baris yang cocok.",
      flow: ["Query", where ? "Cari WHERE" : "Scan tabel", "Hapus baris", "Sukses"],
      behind: where
        ? "Database mencari baris yang cocok dengan WHERE, lalu menghapusnya. Tanpa WHERE, seluruh isi tabel bisa terhapus."
        : "Query ini tidak punya WHERE. Semua baris bisa ikut terhapus, jadi hati-hati saat memakainya di data sungguhan.",
    };
  }

  if (upper.startsWith("EXPLAIN")) {
    return {
      fungsi: "Melihat rencana eksekusi sebuah query.",
      flow: ["Query", "Planner", "Estimasi biaya", "Rencana"],
      behind:
        "EXPLAIN tidak menjalankan query. Ia menunjukkan apakah database memakai index, scan tabel, atau join, sehingga kamu bisa menilai performanya.",
    };
  }

  if (upper.startsWith("BEGIN")) {
    return {
      fungsi: "Membuka sebuah transaksi.",
      flow: ["BEGIN", "Perubahan", "COMMIT / ROLLBACK", "Selesai"],
      behind:
        "Transaksi mengelompokkan beberapa query. Kalau ada error di tengah jalan, ROLLBACK bisa membatalkan semua perubahan.",
    };
  }

  if (upper.startsWith("ROLLBACK")) {
    return {
      fungsi: "Membatalkan semua perubahan transaksi.",
      flow: ["ROLLBACK", "Batalkan perubahan", "Data kembali"],
      behind:
        "Database membuang perubahan yang belum di-commit. Data kembali ke kondisi sebelum transaksi dimulai.",
    };
  }

  return {
    fungsi: "Menjalankan query SQL di database.",
    flow: ["Query", "Parser", "Database", "Hasil"],
    behind:
      "Database mem-parsing query, menjalankan operasinya, lalu mengembalikan hasil atau pesan error.",
  };
}

function explainAuth(command) {
  const lower = command.toLowerCase();

  if (lower.startsWith("login ")) {
    return {
      fungsi: "Memverifikasi email + password lalu membuat sesi.",
      flow: ["Client", "POST /api/login", "Cek hash password", "Token / session"],
      behind:
        "Server mencari user berdasarkan email, mencocokkan password dengan hash tersimpan, lalu membuat token atau session. Password asli tidak pernah disimpan.",
    };
  }

  if (lower === "logout") {
    return {
      fungsi: "Mengakhiri sesi login.",
      flow: ["Client", "POST /api/logout", "Hapus sesi / token", "200 OK"],
      behind:
        "Server menghapus sesi atau client membuang token. Setelah itu, request ke endpoint privat akan kembali mendapat 401.",
    };
  }

  if (lower.startsWith("hash ")) {
    return {
      fungsi: "Mengubah password menjadi hash satu arah.",
      flow: ["Password", "Tambah salt", "Hash function", "Hash"],
      behind:
        "Hash tidak bisa dibalik menjadi password asli. Saat login, server meng-hash password yang dikirim lalu membandingkannya dengan hash tersimpan.",
    };
  }

  if (lower.startsWith("verify ")) {
    return {
      fungsi: "Mencocokkan password dengan hash tersimpan.",
      flow: ["Password", "Hash ulang", "Bandingkan", "Cocok / tidak"],
      behind:
        "Password yang diketik di-hash ulang dengan salt yang sama, lalu hasilnya dibandingkan. Server tidak perlu tahu password aslinya.",
    };
  }

  if (lower.startsWith("jwt encode")) {
    return {
      fungsi: "Membuat token JWT bertanda tangan.",
      flow: ["Header + payload", "Secret server", "Signature", "Token"],
      behind:
        "JWT berisi header, payload, dan signature. Client bisa membaca isinya, tetapi tidak bisa mengubahnya tanpa secret server.",
    };
  }

  if (lower.startsWith("jwt decode")) {
    return {
      fungsi: "Membaca isi payload sebuah JWT.",
      flow: ["Token", "Split 3 bagian", "Decode payload", "Data"],
      behind:
        "Decode hanya membaca isi token; ia tidak memverifikasi signature. Verifikasi tanda tangan tetap harus dilakukan di server.",
    };
  }

  if (lower === "whoami") {
    return {
      fungsi: "Melihat identitas user yang sedang login.",
      flow: ["Client", "Baca token / sesi", "Server verifikasi", "Profil"],
      behind:
        "Server membaca token atau session, memverifikasi identitasnya, lalu mengembalikan user yang cocok.",
    };
  }

  return null;
}

function explainTest() {
  return {
    fungsi: "Menjalankan seluruh test suite.",
    flow: ["Test runner", "Siapkan data", "Jalankan kasus", "Laporan"],
    behind:
      "Runner menjalankan tiap kasus, membandingkan hasil dengan ekspektasi, lalu melaporkan lulus atau gagal. Test membantu menangkap regresi sebelum deploy.",
  };
}

function explainJs(command, engine) {
  const lower = command.toLowerCase();

  if (lower.startsWith("console.log")) {
    return {
      fungsi: "Mencetak nilai ke terminal.",
      flow: ["Kode", "Evaluasi ekspresi", "stdout", "Output"],
      behind:
        "Node menghitung nilai di dalam console.log, lalu menulisnya ke stdout. Berguna untuk debugging, tetapi jangan dipakai untuk mencetak rahasia.",
    };
  }

  if (lower.includes("await api.get") || lower.includes("api.get(")) {
    const notFound = command.includes("999");
    return {
      fungsi: "Mengambil data dari API secara asynchronous.",
      flow: ["Kode", "Request HTTP", "Tunggu response", notFound ? "404 Not Found" : "Data JSON"],
      behind: notFound
        ? "await menunggu promise selesai. Di sini endpoint membalas 404, jadi hasilnya bukan data, melainkan error yang harus ditangani."
        : "await menunggu promise selesai tanpa memblokir seluruh proses. Event loop tetap bisa menangani pekerjaan lain selama menunggu.",
    };
  }

  if (/^(const|let|var)\s/.test(lower)) {
    return {
      fungsi: "Menyimpan nilai ke sebuah variabel.",
      flow: ["Kode", "Parser", "Binding variabel", "Nilai"],
      behind:
        "Runtime menyimpan nilai di memori dengan nama variabel. const tidak bisa diisi ulang; let bisa diubah nilainya.",
    };
  }

  if (lower.startsWith("function ") || lower.includes("=>")) {
    return {
      fungsi: "Membungkus logika agar bisa dipanggil ulang.",
      flow: ["Kode", "Simpan fungsi", "Panggil", "Return value"],
      behind:
        "Saat dipanggil, argumen masuk ke parameter, kode dijalankan, lalu nilai return dikembalikan ke pemanggil.",
    };
  }

  if (/\.(filter|map)\s*\(/.test(lower)) {
    return {
      fungsi: "Mengolah array menjadi array baru.",
      flow: ["Array", "Callback", "Array baru", "Hasil"],
      behind:
        "filter memilih item yang lolos kondisi; map mengubah tiap item. Keduanya mengembalikan array baru dan tidak mengubah array asli.",
    };
  }

  if (lower.startsWith("node ")) {
    return {
      fungsi: "Menjalankan file JavaScript dengan runtime Node.",
      flow: ["Perintah", "Node runtime", "Jalankan kode", "Server / output"],
      behind:
        "Node membaca file, menjalankan kodenya, lalu prosesnya berjalan sampai selesai atau menunggu koneksi (misalnya server listen).",
    };
  }

  if (engine === "node") {
    return {
      fungsi: "Menjalankan ekspresi JavaScript di runtime Node.",
      flow: ["Kode", "Parser", "Evaluasi", "Output"],
      behind:
        "Node membaca kode, menyimpan variabel/fungsi di memori, mengeksekusinya, lalu mencetak hasil atau error ke terminal.",
    };
  }

  return null;
}

function explainShell(command, engine) {
  const lower = command.toLowerCase();

  if (lower === "npm ci" || lower === "npm install" || lower.startsWith("npm install ")) {
    return {
      fungsi: "Memasang dependency proyek.",
      flow: ["npm", "Baca package-lock", "Unduh paket", "node_modules"],
      behind:
        "npm membaca daftar dependency, mengunduh versi yang sesuai, lalu menyimpannya di node_modules. npm ci memakai versi persis dari lockfile.",
    };
  }

  if (lower === "npm run build") {
    return {
      fungsi: "Membuat build produksi.",
      flow: ["Next.js", "Compile", "Optimize", "Folder out/"],
      behind:
        "Next.js mengubah kode menjadi HTML/CSS/JS statis. Hasilnya diletakkan di folder out/ dan siap diunggah ke hosting.",
    };
  }

  if (lower === "npm test" || lower === "npm run test") {
    return {
      fungsi: "Menjalankan pemeriksaan dan test.",
      flow: ["Test runner", "Jalankan kasus", "Bandingkan hasil", "Laporan"],
      behind:
        "Setiap test menjalankan skenario, membandingkan hasil dengan ekspektasi, lalu melaporkan lulus atau gagal.",
    };
  }

  if (lower === "npm start" || lower === "npm run start") {
    return {
      fungsi: "Menjalankan server produksi.",
      flow: ["npm", "Next start", "Server listen", "Ready"],
      behind:
        "Server Node dijalankan dan menunggu request di port tertentu. Di hosting statis, langkah ini biasanya digantikan oleh CDN.",
    };
  }

  if (lower === "npm init -y") {
    return {
      fungsi: "Membuat file package.json awal.",
      flow: ["npm init", "Buat manifest", "package.json"],
      behind:
        "npm membuat package.json berisi nama proyek, versi, dan daftar dependency. File ini menjadi identitas proyek Node.",
    };
  }

  if (lower.startsWith("firebase deploy")) {
    return {
      fungsi: "Mengunggah build ke Firebase Hosting.",
      flow: ["Firebase CLI", "Upload out/", "Buat versi", "Live"],
      behind:
        "Firebase mengunggah file statis, membuat versi baru, lalu merilisnya ke domain. Versi lama tetap tersimpan dan bisa di-rollback.",
    };
  }

  if (lower.startsWith("firebase hosting:rollback")) {
    return {
      fungsi: "Kembali ke versi hosting sebelumnya.",
      flow: ["Firebase CLI", "Pilih versi", "Rollback", "Live"],
      behind:
        "Firebase mengaktifkan kembali versi hosting yang lama tanpa mengubah kode di repo.",
    };
  }

  if (lower.startsWith("curl ")) {
    const health = lower.includes("health");
    const local = lower.includes("localhost");
    return {
      fungsi: health ? "Mengecek endpoint health." : "Mengirim request HTTP dari terminal.",
      flow: ["curl", local ? "localhost:3000" : "Domain hosting", "Server", "Response"],
      behind: health
        ? "curl mengirim GET ke endpoint health, lalu mencetak status dan body. Status 200 biasanya berarti server dan dependency utamanya sehat."
        : "curl membuka koneksi ke host/port, mengirim request HTTP, lalu mencetak status + body yang diterima.",
    };
  }

  if (lower.startsWith("cat ")) {
    return {
      fungsi: "Membaca isi file dari disk.",
      flow: ["Perintah", "Buka file", "Baca isi", "Output"],
      behind:
        "File dibaca dan dicetak ke terminal. Perintah ini hanya membaca; isi file tidak berubah.",
    };
  }

  if (lower.startsWith("git ")) {
    return {
      fungsi: "Mengelola versi kode dengan Git.",
      flow: ["Working tree", "Staging", "Commit", "Remote"],
      behind:
        "Git mencatat snapshot perubahan. status melihat kondisi, commit menyimpan snapshot, dan push mengirim commit ke remote.",
    };
  }

  if (lower === "env") {
    return {
      fungsi: "Melihat environment variables proses.",
      flow: ["Shell", "Baca environment", "Daftar variabel"],
      behind:
        "Environment variables adalah konfigurasi yang diberikan ke proses, misalnya API key. Jangan pernah commit nilai rahasianya ke repo.",
    };
  }

  if (lower === "cat .env") {
    return {
      fungsi: "Membaca konfigurasi environment lokal.",
      flow: ["Buka .env", "Baca key=value", "Output"],
      behind:
        "File .env menyimpan konfigurasi lokal. Pastikan file ini masuk .gitignore supaya secret tidak ikut ter-commit.",
    };
  }

  if (engine === "shell") {
    return {
      fungsi: "Menjalankan perintah di terminal.",
      flow: ["Terminal", "Shell", "Proses", "Output"],
      behind:
        "Shell membaca perintah, menjalankan prosesnya, lalu menampilkan stdout atau error ke terminal.",
    };
  }

  return null;
}

function explainNodeOrShell(command, engine) {
  return explainJs(command, engine) || explainShell(command, engine);
}

export function explainCommand(engine, command, result) {
  const raw = String(command || "").trim();
  if (!raw) {
    return { fungsi: "Menjalankan perintah di lab.", flow: ["Perintah", "Lab", "Output"], behind: "" };
  }

  const httpMatch = raw.match(/^(GET|POST|PUT|PATCH|DELETE|HEAD|OPTIONS)\s+(\S+)(?:\s+([\s\S]+))?$/i);
  if (httpMatch) {
    return explainHttp(httpMatch[1].toUpperCase(), httpMatch[2], result);
  }

  const statusMatch = raw.match(/^status\s+(\d{3})$/i);
  if (statusMatch) {
    const code = Number(statusMatch[1]);
    return {
      fungsi: `Menjelaskan arti status code ${code}.`,
      flow: ["Status code", "Kategori", "Arti", "Keputusan"],
      behind: HTTP_STATUS_NOTE[code] || "Status code memberi tahu hasil request tanpa harus membaca seluruh body.",
    };
  }

  const auth = explainAuth(raw);
  if (auth) return auth;

  if (/^test$/i.test(raw)) return explainTest();

  if (engine === "sql" || /^(SELECT|INSERT|UPDATE|DELETE|SHOW|DESCRIBE|EXPLAIN|BEGIN|ROLLBACK|COMMIT)\b/i.test(raw)) {
    return explainSql(raw);
  }

  const nodeOrShell = explainNodeOrShell(raw, engine);
  if (nodeOrShell) return nodeOrShell;

  return {
    fungsi: "Menjalankan perintah di lab terminal.",
    flow: ["Perintah", "Lab engine", "Proses", "Output"],
    behind:
      "Lab membaca perintah, menjalankan simulasi yang sesuai, lalu mengirim hasilnya ke terminal.",
  };
}
