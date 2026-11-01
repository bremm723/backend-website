const module = {
  id: "node",
  title: "JavaScript & Node.js untuk Backend",
  shortTitle: "JavaScript & Node",
  emoji: "🟨",
  badge: "Pendalaman",
  levelId: null,
  intro:
    "Sebelum masuk ke API dan database, kamu perlu nyaman dengan bahasa yang dipakai backend-nya. Modul ini mengajarkan JavaScript dari sisi yang paling sering dipakai di backend: variabel, fungsi, array, object, async, dan server Node pertama. Tidak perlu hafal semua fitur bahasa; fokus pada pola yang akan kamu pakai setiap hari.",
  goals: [
    "Menulis variabel, fungsi, array, dan object sederhana.",
    "Memahami async/await dan kenapa backend banyak menunggu.",
    "Mengerti peran package.json dan npm.",
    "Membuat server Node pertama dan mencobanya dengan curl.",
  ],
  sections: [
    {
      title: "JavaScript di browser vs Node.js",
      body: [
        "JavaScript adalah bahasa pemrogramannya. Browser dan Node.js adalah dua tempat berbeda untuk menjalankannya. Di browser, JavaScript punya akses ke DOM, tombol, dan halaman. Di Node.js, JavaScript punya akses ke file, network, dan proses server.",
        "Node.js dibangun di atas mesin V8 (mesin JavaScript milik Chrome). Node menambahkan kemampuan yang dibutuhkan backend: modul file system, HTTP server, environment variables, dan package manager npm.",
        "Satu bahasa untuk frontend dan backend bukan berarti kodenya sama. Yang sama adalah sintaksnya. Yang berbeda adalah lingkungan dan tanggung jawabnya.",
        "Di lab ini, kita memakai sandbox JavaScript mini. Akses browser dan file sengaja diblokir supaya aman, tetapi ekspresi, variabel, fungsi, array, object, dan await tetap bisa dicoba.",
      ],
      examples: [
        {
          title: "Program pertama",
          code: `console.log("Halo Tuan Putri Ratih!");
console.log("Sekarang kita belajar backend.");`,
          output: `Halo Tuan Putri Ratih!
Sekarang kita belajar backend.`,
          note: "console.log adalah cara paling sederhana untuk melihat nilai saat belajar dan debugging.",
        },
      ],
      tip: "Kamu tidak perlu menghafal semua fitur JavaScript. Cukup kuasai variabel, fungsi, array/object, dan async — empat hal ini sudah membawa kamu jauh.",
      practice: {
        prompt: "Cetak sapaan pertamamu di sandbox JavaScript.",
        commands: [{ label: "Cetak sapaan", command: 'console.log("Halo Ratih, selamat belajar backend!")' }],
        hint: "Teks harus diapit tanda kutip. Lalu tekan Enter.",
      },
    },
    {
      title: "Variabel & tipe data",
      body: [
        "Variabel adalah wadah bernama untuk menyimpan nilai. Gunakan const sebagai default. Gunakan let kalau nilainya memang perlu berubah. Hindari var karena aturan scope-nya lebih membingungkan.",
        "Tipe data dasar yang paling sering dipakai: string (teks), number (angka), boolean (true/false), null (sengaja kosong), undefined (belum diisi), array (daftar), dan object (kumpulan pasangan kunci-nilai).",
        "JavaScript bertipe dinamis: satu variabel bisa berisi angka lalu diganti string. Ini fleksibel, tetapi juga sumber bug. Di backend, tipe data yang jelas sangat penting karena data datang dari luar dan harus divalidasi.",
        "Gunakan typeof untuk memeriksa tipe. Hati-hati: typeof null menghasilkan \"object\" (bug lama JavaScript), dan array juga terdeteksi sebagai \"object\". Untuk array, gunakan Array.isArray().",
      ],
      table: {
        head: ["Tipe", "Contoh", "Dipakai untuk"],
        rows: [
          ["string", "\"Ratih\"", "Nama, email, catatan"],
          ["number", "42, 3.14", "Harga, jumlah, level"],
          ["boolean", "true / false", "Status aktif, sudah login"],
          ["null", "null", "Sengaja kosong"],
          ["undefined", "undefined", "Belum diberi nilai"],
          ["array", "[\"a\", \"b\"]", "Daftar hati, daftar user"],
          ["object", "{ id: 1, to: \"Ratih\" }", "Satu entitas dengan banyak field"],
        ],
      },
      examples: [
        {
          title: "Menyimpan data user",
          code: `const nama = "Tuan Putri Ratih";
const level = 3;
const sudahLogin = true;
const hearts = [1, 2, 3];

const user = {
  nama: nama,
  level: level,
  role: "princess",
};

console.log(user.nama);
console.log(hearts.length);`,
          output: `Tuan Putri Ratih
3`,
          note: "Object mengelompokkan data yang saling berhubungan. Array menyimpan urutan banyak nilai.",
        },
      ],
      warning: "Jangan gunakan == kalau bisa memakai ===. == melakukan konversi tipe otomatis yang sering mengejutkan (misal \"0\" == false). === membandingkan nilai dan tipe sekaligus.",
      practice: {
        prompt: "Buat variabel nama dan level, lalu cetak keduanya.",
        commands: [
          { label: "Buat nama", command: 'const nama = "Tuan Putri Ratih"' },
          { label: "Buat level", command: "const level = 3" },
          { label: "Cetak", command: "console.log(nama + \" ada di level \" + level)" },
        ],
        hint: "Variabel yang sudah dibuat tetap tersimpan untuk perintah berikutnya di lab ini.",
      },
    },
    {
      title: "Fungsi: cara membungkus logika",
      body: [
        "Fungsi adalah blok kode yang bisa dipanggil berulang kali. Fungsi menerima parameter (input) dan bisa mengembalikan nilai (output) dengan return. Tanpa fungsi, kode backend akan penuh duplikasi.",
        "Ada beberapa cara menulis fungsi: deklarasi function, function expression, dan arrow function. Arrow function lebih ringkas dan sering dipakai untuk callback seperti map/filter.",
        "Fungsi punya scope. Variabel yang dideklarasikan di dalam fungsi tidak bocor ke luar. Ini menjaga kode tetap rapi dan mengurangi bentrok nama.",
        "Di backend, fungsi membantu memisahkan tanggung jawab: validasi input, mengambil data, mengubah bentuk response, dan menangani error. Fungsi kecil yang jelas lebih mudah diuji daripada satu fungsi raksasa.",
      ],
      examples: [
        {
          title: "Dua gaya penulisan fungsi",
          code: `function sapa(nama) {
  return "Halo " + nama + "!";
}

const sapaSingkat = (nama) => "Halo " + nama + "!";

console.log(sapa("Ratih"));
console.log(sapaSingkat("Ratih"));`,
          output: `Halo Ratih!
Halo Ratih!`,
          note: "return mengirim nilai keluar dari fungsi. Tanpa return, hasilnya undefined.",
        },
      ],
      tip: "Beri nama fungsi sesuai tujuan: validasiHati, ambilProfil, buatToken. Nama yang baik menghemat banyak komentar.",
      practice: {
        prompt: "Buat fungsi sapa, lalu panggil dengan namamu.",
        commands: [
          { label: "Buat fungsi", command: 'function sapa(nama) { return "Halo " + nama + "!"; }' },
          { label: "Panggil", command: 'sapa("Tuan Putri Ratih")' },
        ],
        hint: "Tulis fungsi dalam satu baris di lab. Setelah dibuat, panggil seperti variabel biasa.",
      },
    },
    {
      title: "Array & object: bentuk data backend",
      body: [
        "Data backend hampir selalu berbentuk array of objects. Contoh: daftar hati, daftar user, daftar pesanan. Array menyimpan urutan; object menyimpan field dari satu item.",
        "Method array yang wajib dikenal: map (mengubah setiap item), filter (menyaring), find (mencari satu), reduce (merangkum menjadi satu nilai), dan forEach (melakukan sesuatu untuk setiap item).",
        "Akses object memakai titik (user.nama) atau kurung siku (user[\"nama\"]). Destructuring mempermudah mengambil beberapa field sekaligus: const { nama, level } = user.",
        "Saat mengirim JSON, object dan array otomatis dikonversi menjadi teks. Saat menerima JSON, server mengubahnya kembali menjadi object. Inilah sebabnya bentuk data di API terlihat seperti object JavaScript.",
      ],
      examples: [
        {
          title: "Menyaring dan mengubah daftar hati",
          code: `const hearts = [
  { id: 1, to: "Ratih", note: "Semangat!" },
  { id: 2, to: "Sahabat", note: "Halo" },
  { id: 3, to: "Ratih", note: "Kamu bisa!" },
];

const untukRatih = hearts.filter((hati) => hati.to === "Ratih");
const catatan = untukRatih.map((hati) => hati.note);

console.log(untukRatih.length);
console.log(catatan);`,
          output: `2
[ 'Semangat!', 'Kamu bisa!' ]`,
          note: "filter mengembalikan array baru. map mengubah setiap item menjadi bentuk lain. Keduanya tidak mengubah array asli.",
        },
      ],
      warning: "Jangan mengubah array saat sedang di-loop kalau tidak perlu. Buat array baru dengan map/filter supaya alurnya mudah dibaca dan tidak menimbulkan bug aneh.",
      practice: {
        prompt: "Buat daftar hati, saring hanya milik Ratih, lalu ambil catatannya.",
        commands: [
          { label: "Buat data", command: 'const hati = [{ to: "Ratih", note: "A" }, { to: "Sahabat", note: "B" }, { to: "Ratih", note: "C" }]' },
          { label: "Filter", command: 'hati.filter((item) => item.to === "Ratih")' },
          { label: "Map", command: "hati.map((item) => item.note)" },
        ],
        hint: "Perhatikan bahwa hasil filter dan map adalah array baru, bukan data asli yang berubah.",
      },
    },
    {
      title: "Async/await: kenapa backend banyak menunggu",
      body: [
        "Mengambil data dari database atau memanggil API lain butuh waktu. Kalau JavaScript berhenti total menunggu, server tidak bisa melayani request lain. Solusinya asynchronous: pekerjaan menunggu dijalankan tanpa memblokir seluruh program.",
        "Promise adalah janji bahwa suatu nilai akan tersedia nanti. Promise punya tiga keadaan: pending, fulfilled, dan rejected. async function selalu mengembalikan Promise. await menunggu Promise selesai, tetapi hanya di dalam async function.",
        "Gunakan try/catch untuk menangani error async. Jangan biarkan Promise yang gagal tanpa penanganan; di server, ini bisa membuat request menggantung atau log penuh error.",
        "Kalau beberapa pekerjaan tidak saling bergantung, jalankan bersamaan dengan Promise.all. Kalau saling bergantung, jalankan berurutan dengan await.",
      ],
      examples: [
        {
          title: "Mengambil data seperti fetch API",
          code: `async function ambilHati() {
  const data = await api.get("/api/hearts");
  console.log(data.data.length);
  return data;
}

await ambilHati();`,
          output: `3
{ data: [ ... ], meta: { count: 3, page: 1 } }`,
          note: "Di lab, api.get adalah tiruan fetch. Di proyek asli, kamu akan memakai fetch atau axios dan menangani status error.",
        },
      ],
      table: {
        head: ["Pola", "Kapan dipakai"],
        rows: [
          ["await api.get(...)", "Satu pekerjaan yang harus selesai dulu"],
          ["Promise.all([...])", "Beberapa pekerjaan independen, jalankan bersamaan"],
          ["try/catch", "Menangkap error async"],
          [".then()/.catch()", "Gaya Promise lama, masih sering ditemui"],
        ],
      },
      warning: "Lupa await adalah sumber bug klasik. Kalau kamu melihat Promise { <pending> } di log, kemungkinan besar kamu mencetak Promise-nya, bukan nilai hasilnya.",
      practice: {
        prompt: "Ambil data hati dengan await, lalu cetak jumlahnya. Setelah itu coba ambil satu hati yang tidak ada untuk melihat error.",
        commands: [
          { label: "Ambil data", command: 'const data = await api.get("/api/hearts")' },
          { label: "Cetak jumlah", command: "console.log(data.data.length)" },
          { label: "Coba 404", command: 'await api.get("/api/hearts/999")' },
        ],
        hint: "Kalau api.get gagal, error akan ditampilkan. Di kode nyata, bungkus dengan try/catch.",
      },
    },
    {
      title: "npm, package.json, dan module",
      body: [
        "npm adalah package manager Node.js. Dia mengunduh library pihak ketiga (dependency) dan mencatatnya di package.json. Folder node_modules berisi kode library yang sudah diunduh.",
        "package.json adalah KTP proyek: nama, versi, script, dan daftar dependency. Script mempermudah perintah, misalnya npm run dev atau npm start.",
        "JavaScript modern memakai module: export untuk mengirim nilai keluar dari file, import untuk mengambilnya. Ini membuat kode terpecah menjadi bagian kecil yang bisa dipakai ulang.",
        "Di production, dependency harus dipasang dengan versi yang konsisten. package-lock.json mengunci versi tersebut. Jangan commit node_modules; cukup commit package.json dan package-lock.json.",
      ],
      examples: [
        {
          title: "package.json minimal",
          code: `{
  "name": "nduttt-api",
  "version": "1.0.0",
  "scripts": {
    "start": "node server.js",
    "dev": "node server.js"
  },
  "dependencies": {
    "express": "^4.19.2"
  }
}`,
          output: `$ npm install express
added 1 package

$ npm start
> nduttt-api@1.0.0 start
> node server.js`,
          note: "Versi ^4.19.2 berarti boleh naik ke versi minor/patch 4.x, tetapi tidak ke 5.x.",
        },
      ],
      tip: "Kalau proyek orang lain tidak jalan, cek dulu: apakah node_modules sudah ada, apakah .env sudah diisi, dan apakah versi Node sesuai. Tiga hal ini menyelesaikan banyak masalah.",
      practice: {
        prompt: "Inisialisasi proyek, pasang express, lalu lihat package.json.",
        commands: [
          { label: "Init", command: "npm init -y" },
          { label: "Install", command: "npm install express" },
          { label: "Lihat", command: "cat package.json" },
        ],
        hint: "Di lab, semua langkah ini disimulasikan. Di komputer asli, perintah yang sama benar-benar mengunduh package.",
      },
    },
    {
      title: "Server Node pertama",
      body: [
        "Server HTTP adalah program yang mendengarkan port, menerima request, lalu mengirim response. Di Node, kita bisa membuat server tanpa framework memakai modul http.",
        "Request berisi method, URL, dan header. Response harus diberi status code dan header, lalu diakhiri dengan end(). Kalau lupa end(), browser akan menunggu selamanya.",
        "Framework seperti Express/Next.js membantu routing, parsing body, dan middleware. Tetapi memahami server Node dasar membuatmu tidak buta saat ada masalah di lapisan bawah.",
        "Di production, server tidak dijalankan dengan node server.js mentah tanpa pengawasan. Biasanya ada process manager, container, atau platform yang menangani restart, log, dan scaling.",
      ],
      examples: [
        {
          title: "Server Node 20 baris",
          code: `import http from "node:http";

const server = http.createServer((req, res) => {
  if (req.method === "GET" && req.url === "/api/hearts") {
    res.writeHead(200, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ data: [] }));
    return;
  }

  res.writeHead(404, { "Content-Type": "application/json" });
  res.end(JSON.stringify({ error: "Not found" }));
});

server.listen(3000, () => {
  console.log("Server jalan di http://localhost:3000");
});`,
          output: `$ node server.js
Server jalan di http://localhost:3000

$ curl localhost:3000/api/hearts
{"data":[]}`,
          note: "Setiap request masuk ke callback. Di sinilah routing dan logika response dimulai.",
        },
      ],
      warning: "Port 3000 hanya untuk lokal. Di production, platform biasanya memberi port lewat process.env.PORT. Jangan hardcode port production.",
      practice: {
        prompt: "Jalankan server Node di lab, lalu panggil endpoint-nya dengan curl.",
        commands: [
          { label: "Jalankan server", command: "node server.js" },
          { label: "Curl", command: "curl localhost:3000/api/hearts" },
          { label: "Health", command: "curl localhost:3000/api/health" },
        ],
        hint: "Server harus dijalankan dulu. Kalau langsung curl, koneksi akan ditolak.",
      },
    },
  ],
  summary: [
    "JavaScript adalah bahasanya; browser dan Node.js adalah runtime yang berbeda.",
    "const untuk nilai tetap, let untuk nilai yang berubah, hindari var.",
    "Fungsi membungkus logika; array/object adalah bentuk data backend.",
    "async/await menunggu pekerjaan tanpa memblokir seluruh server.",
    "package.json mencatat dependency dan script proyek.",
    "Server Node menerima request, memilih response, lalu mengakhiri koneksi.",
  ],
};

export default module;
