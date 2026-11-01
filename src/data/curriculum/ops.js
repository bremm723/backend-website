const module = {
  id: "ops",
  title: "Deployment & Server Operations",
  shortTitle: "Deployment",
  emoji: "🚀",
  badge: "Inti",
  levelId: 5,
  intro:
    "Kode yang hanya jalan di laptop belum menyelesaikan apa pun. Deployment adalah proses membawa aplikasi ke server yang bisa diakses orang lain, dengan konfigurasi, keamanan, dan pemantauan yang benar. Modul ini membahas build, environment variables, Firebase Hosting, reverse proxy, CI/CD, dan rollback.",
  goals: [
    "Memahami perbedaan localhost dan production.",
    "Mengelola environment variables tanpa membocorkan secret.",
    "Membangun dan men-deploy static export ke Firebase Hosting.",
    "Memahami peran reverse proxy dan HTTPS.",
    "Menyiapkan alur CI/CD dan monitoring dasar.",
  ],
  sections: [
    {
      title: "Dari localhost ke internet",
      body: [
        "localhost adalah alamat komputer kamu sendiri. Selama aplikasi berjalan di localhost, hanya kamu yang bisa membukanya. Production adalah environment yang bisa diakses publik lewat domain dan HTTPS.",
        "Proses deploy setidaknya mencakup: menyiapkan environment, install dependency, build, upload artefak, menjalankan aplikasi/server, lalu memeriksa kesehatan. Kalau satu langkah terlewat, aplikasi bisa tampak hidup tetapi error di belakang.",
        "Jangan pernah menjalankan `next dev` di production. Mode dev lebih lambat, menampilkan detail error, dan tidak dioptimalkan. Gunakan `next build` lalu `next start`, atau static export ke CDN.",
        "Deployment yang baik bisa diulang. Kalau langkah deploy hanya ada di kepala satu orang, itu risiko. Simpan konfigurasi dan otomatiskan lewat CI/CD.",
      ],
      steps: [
        "Pastikan environment variables production sudah diisi.",
        "Install dependency dengan versi terkunci (npm ci).",
        "Jalankan test dan lint.",
        "Build aplikasi.",
        "Upload/deploy artefak.",
        "Cek health endpoint dan halaman utama.",
        "Pantau log dan error setelah rilis.",
      ],
      examples: [
        {
          title: "Urutan build yang wajar",
          code: `npm ci
npm test
npm run build
firebase deploy --only hosting`,
          output: `added 248 packages
✓ 12 tests passed
✓ Compiled successfully
✓ Deploy complete!
Hosting URL: https://tuanputri-cde07.web.app`,
          note: "Di proyek ini, build menghasilkan folder out/ yang di-upload ke Firebase Hosting.",
        },
      ],
      tip: "Deploy kecil dan sering lebih aman daripada deploy besar sekali sebulan. Kalau ada masalah, kamu tahu perubahan mana yang menyebabkannya.",
      practice: {
        prompt: "Install dependency lalu build production. Perhatikan file hasil build.",
        commands: [
          { label: "Install", command: "npm ci" },
          { label: "Build", command: "npm run build" },
        ],
        hint: "Build harus dijalankan setelah dependency terpasang.",
      },
    },
    {
      title: "Environment variables & secret",
      body: [
        "Environment variable adalah konfigurasi yang diberikan dari luar kode. Database URL, API key, dan secret berbeda antara lokal, staging, dan production. Kode yang sama bisa berjalan di environment berbeda tanpa diubah.",
        "Di Next.js, hanya variabel dengan prefix NEXT_PUBLIC_ yang ikut ke bundle browser. Variabel lain hanya tersedia di server. Jangan pernah menaruh secret di NEXT_PUBLIC_.",
        "File .env berisi nilai sensitif dan tidak boleh di-commit. Sertakan .env.example berisi nama variabel tanpa nilai asli, supaya orang lain tahu apa yang perlu diisi.",
        "Kalau secret bocor, rotasi segera. Menghapus dari commit terakhir tidak cukup karena secret mungkin sudah ada di riwayat Git, cache, atau log.",
      ],
      table: {
        head: ["Variabel", "Terlihat di browser?", "Contoh"],
        rows: [
          ["NEXT_PUBLIC_FIREBASE_API_KEY", "Ya", "Konfigurasi Firebase client"],
          ["DATABASE_URL", "Tidak", "Koneksi database"],
          ["JWT_SECRET", "Tidak", "Signature token"],
          ["STRIPE_SECRET_KEY", "Tidak", "Pembayaran"],
        ],
      },
      examples: [
        {
          title: ".env dan .env.example",
          code: `# .env.local (JANGAN di-commit)
NEXT_PUBLIC_FIREBASE_PROJECT_ID=tuanputri-cde07
NEXT_PUBLIC_FIREBASE_API_KEY=AIza...
JWT_SECRET=rahasia-super-panjang
DATABASE_URL=postgres://user:pass@host:5432/db

# .env.example (boleh di-commit)
NEXT_PUBLIC_FIREBASE_PROJECT_ID=
NEXT_PUBLIC_FIREBASE_API_KEY=
JWT_SECRET=
DATABASE_URL=`,
          output: `Contoh nama variabel aman dibagikan.
Nilai asli hanya ada di environment masing-masing.`,
          note: "Di Firebase/Cloud Run/Vercel, isi variabel lewat dashboard atau secret store, bukan file yang ikut repo.",
        },
      ],
      warning: "NEXT_PUBLIC_ bukan tempat menyembunyikan secret. Itu hanya prefix untuk variabel yang memang boleh dilihat browser.",
      practice: {
        prompt: "Periksa environment variables di lab. Perhatikan bahwa nilai secret disamarkan.",
        commands: [
          { label: "Env", command: "env" },
          { label: "Lihat .env", command: "cat .env" },
        ],
        hint: "Perhatikan peringatan tentang .gitignore dan NEXT_PUBLIC_.",
      },
    },
    {
      title: "Static export & Firebase Hosting",
      body: [
        "Proyek ini memakai output: \"export\" di next.config.mjs. Artinya Next.js menghasilkan HTML/CSS/JS statis di folder out/, bukan server Node yang berjalan terus-menerus.",
        "Firebase Hosting membaca konfigurasi firebase.json. Bagian public: \"out\" menentukan folder yang di-upload. cleanUrls: true membuat URL tanpa .html. Firebase menyajikan file lewat CDN global dengan HTTPS otomatis.",
        "Static export sangat murah, cepat, dan aman karena tidak ada server process yang bisa crash. Kekurangannya: API route dinamis, SSR, dan fitur server-side lain tidak berjalan. Untuk API, kamu butuh layanan terpisah seperti Cloud Functions atau Cloud Run.",
        "Proyek ini menggunakan Firestore dari browser untuk menyimpan progres user. Firestore rules harus membatasi siapa yang boleh membaca dan menulis dokumen.",
      ],
      examples: [
        {
          title: "Konfigurasi Firebase Hosting",
          code: `{
  "hosting": {
    "public": "out",
    "ignore": ["firebase.json", "**/.*", "**/node_modules/**"],
    "cleanUrls": true
  },
  "firestore": {
    "rules": "firestore.rules"
  }
}`,
          output: `next build → folder out/
firebase deploy → upload out/ ke CDN
https://tuanputri-cde07.web.app`,
          note: "Deploy hosting tidak otomatis mengubah Firestore rules kecuali kamu ikut men-deploy rules.",
        },
      ],
      warning: "Jangan men-deploy folder out/ yang belum di-build ulang setelah perubahan kode. Kamu bisa merasa 'perubahan tidak muncul' padahal yang ter-upload adalah build lama.",
      practice: {
        prompt: "Deploy hasil build ke Firebase Hosting simulasi. Sebelumnya pastikan build sudah berhasil.",
        commands: [
          { label: "Build", command: "npm run build" },
          { label: "Test", command: "npm test" },
          { label: "Deploy", command: "firebase deploy" },
          { label: "Buka situs", command: "curl https://tuanputri-cde07.web.app" },
        ],
        hint: "Deploy akan ditolak kalau folder out/ belum ada.",
      },
    },
    {
      title: "Reverse proxy & HTTPS",
      body: [
        "Reverse proxy seperti Nginx berdiri di depan aplikasi. Dia menerima traffic publik di port 80/443, lalu meneruskan request ke aplikasi di port lokal (misalnya 3000).",
        "Manfaat reverse proxy: terminasi HTTPS, redirect HTTP ke HTTPS, serving file statis, rate limit, compression, dan load balancing ke beberapa instance aplikasi.",
        "Header X-Forwarded-For membawa IP asli user, dan X-Forwarded-Proto memberi tahu apakah request asli memakai http/https. Tanpa header ini, aplikasi bisa salah membaca IP atau membuat URL redirect yang salah.",
        "Di Firebase Hosting, reverse proxy dan HTTPS sudah ditangani platform. Kamu tidak perlu mengelola Nginx sendiri. Namun konsepnya tetap penting saat memakai VPS atau Cloud Run.",
      ],
      examples: [
        {
          title: "Konfigurasi Nginx dasar",
          code: `server {
  listen 443 ssl http2;
  server_name nduttt.be;

  ssl_certificate     /etc/letsencrypt/live/nduttt.be/fullchain.pem;
  ssl_certificate_key /etc/letsencrypt/live/nduttt.be/privkey.pem;

  location / {
    proxy_pass http://127.0.0.1:3000;
    proxy_set_header Host $host;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
  }
}`,
          output: `Client → HTTPS :443 → Nginx → aplikasi :3000
Aplikasi tidak perlu menangani sertifikat SSL sendiri.`,
          note: "Let's Encrypt menyediakan sertifikat gratis; perpanjangannya bisa otomatis.",
        },
      ],
      tip: "Kalau aplikasi di belakang proxy selalu menghasilkan URL http://, periksa header X-Forwarded-Proto dan konfigurasi trust proxy di framework.",
      practice: {
        prompt: "Cek health endpoint setelah server production berjalan.",
        commands: [
          { label: "Start", command: "npm start" },
          { label: "Health", command: "curl http://localhost:3000/api/health" },
        ],
        hint: "Health check adalah endpoint ringan yang memberi tahu apakah aplikasi hidup.",
      },
    },
    {
      title: "CI/CD: rilis otomatis yang bisa dipercaya",
      body: [
        "CI (Continuous Integration) menjalankan install, lint, test, dan build setiap kali ada push. Tujuannya menangkap masalah sebelum merge. CD (Continuous Delivery/Deployment) melanjutkan ke deploy setelah semua pemeriksaan hijau.",
        "Pipeline yang baik cepat, deterministik, dan punya secret store. Jangan menaruh token deploy di kode. Gunakan GitHub Secrets atau secret manager platform.",
        "Preview deployment per pull request memudahkan review UI sebelum masuk main. Setelah merge, deploy ke production bisa otomatis atau butuh approval manual.",
        "Siapkan rollback. Kalau build baru error, kamu harus bisa kembali ke versi sebelumnya dalam hitungan menit, bukan jam. Firebase Hosting menyimpan versi sebelumnya; platform lain punya mekanisme serupa.",
      ],
      examples: [
        {
          title: "GitHub Actions sederhana",
          code: `name: deploy
on:
  push:
    branches: [main]

jobs:
  build-deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with: { node-version: 20 }
      - run: npm ci
      - run: npm test
      - run: npm run build
      - run: npx firebase-tools deploy --only hosting --token \${{ secrets.FIREBASE_TOKEN }}`,
          output: `push ke main
→ install
→ test
→ build
→ deploy
→ health check`,
          note: "Token Firebase disimpan di GitHub Secrets, bukan di file workflow.",
        },
      ],
      warning: "Jangan men-deploy setiap commit tanpa test. CI yang tidak memeriksa apa pun hanya memberi ilusi aman.",
      practice: {
        prompt: "Simulasikan alur Git: cek status, commit, lalu push. Push inilah yang memicu pipeline.",
        commands: [
          { label: "Status", command: "git status" },
          { label: "Commit", command: 'git commit -m "Tambah materi dan lab terminal"' },
          { label: "Push", command: "git push" },
        ],
        hint: "Di lab, commit dan push disimulasikan. Di proyek asli, push ke main bisa langsung memicu deploy.",
      },
    },
    {
      title: "Monitoring, health check, dan rollback",
      body: [
        "Setelah deploy, pekerjaan belum selesai. Kamu perlu tahu apakah aplikasi benar-benar sehat: halaman utama terbuka, API merespons, error rate normal, dan latency wajar.",
        "Health check adalah endpoint ringan yang memeriksa dependensi penting. Jangan membuat health check yang menjalankan query berat; itu justru bisa membebani server saat diperiksa terus-menerus.",
        "Log terpusat dan error tracking membantu menemukan masalah lebih cepat. Metrics seperti request per menit, latency p95, error rate, dan penggunaan memori memberi gambaran kesehatan sistem.",
        "Siapkan runbook: apa yang harus dilakukan kalau deploy gagal, database down, atau error rate naik. Rollback adalah tombol pertama yang harus mudah dijangkau.",
      ],
      examples: [
        {
          title: "Health check yang berguna",
          code: `GET /api/health

200 OK
{
  "status": "ok",
  "service": "nduttt-api",
  "uptime": "3600s",
  "version": "1.0.0"
}`,
          output: `Uptime monitor memanggil endpoint ini tiap 30 detik.
Kalau gagal 3 kali berturut-turut → kirim alert.`,
          note: "Jangan sertakan detail sensitif di health check publik.",
        },
      ],
      tip: "Latih rollback sebelum kamu benar-benar membutuhkannya. Saat production down, kamu tidak ingin membaca dokumentasi untuk pertama kali.",
      practice: {
        prompt: "Cek kesehatan situs hasil deploy, lalu coba rollback.",
        commands: [
          { label: "Health", command: "curl https://tuanputri-cde07.web.app/api/health" },
          { label: "Rollback", command: "firebase hosting:rollback" },
        ],
        hint: "Rollback mengembalikan versi hosting sebelumnya. Gunakan dengan hati-hati di production.",
      },
    },
    {
      title: "Checklist go-live",
      body: [
        "Sebelum mengumumkan situs ke user, periksa domain, HTTPS, environment variables, build, dan health endpoint. Buka halaman utama di mode incognito untuk memastikan tidak bergantung pada cache lokal.",
        "Periksa auth dan database rules. Pastikan user tidak bisa membaca data orang lain, dan Firestore rules tidak terbuka untuk semua orang. Uji dengan akun kedua.",
        "Siapkan backup dan rencana pemulihan. Untuk Firestore, pahami export/import. Untuk SQL, pahami backup otomatis dan restore. Backup yang belum pernah diuji restore-nya belum bisa dipercaya.",
        "Pantau setelah rilis. Buka log, error tracking, dan metrics. Kalau ada masalah, komunikasikan dengan jelas dan rollback kalau perlu.",
      ],
      examples: [
        {
          title: "Checklist rilis",
          code: `[x] Build sukses tanpa warning kritis
[x] Test & lint hijau
[x] Environment production terisi
[x] Secret tidak ada di repo
[x] HTTPS aktif
[x] Auth & Firestore rules diuji
[x] Health check 200
[x] Monitoring & alert aktif
[x] Rollback sudah dicoba
[x] Backup database tersedia`,
          output: `Rilis tenang karena semua yang penting sudah diperiksa.`,
          note: "Checklist bukan birokrasi; dia mencegah kesalahan yang sudah diketahui orang lain.",
        },
      ],
      tip: "Deploy saat kamu masih punya energi dan waktu untuk memantau. Jangan deploy fitur besar Jumat malam lalu langsung tidur.",
      practice: {
        prompt: "Tantangan terakhir: deploy ulang, cek halaman utama, lalu pastikan health endpoint merespons.",
        commands: [
          { label: "Build", command: "npm run build" },
          { label: "Test", command: "npm test" },
          { label: "Deploy", command: "firebase deploy" },
          { label: "Cek situs", command: "curl https://tuanputri-cde07.web.app" },
          { label: "Cek health", command: "curl https://tuanputri-cde07.web.app/api/health" },
        ],
        hint: "Health endpoint di static export ini adalah simulasi lab, bukan API sungguhan.",
      },
    },
  ],
  summary: [
    "Production berbeda dari localhost: build, env, HTTPS, dan monitoring wajib.",
    "Secret disimpan di environment/secret store, bukan repo.",
    "Static export menghasilkan folder out/ yang di-host Firebase Hosting.",
    "Reverse proxy menangani HTTPS, header, dan meneruskan ke aplikasi.",
    "CI/CD mengotomatiskan test, build, deploy, dan rollback.",
    "Health check + monitoring membuat masalah terlihat sebelum user marah.",
  ],
};

export default module;
