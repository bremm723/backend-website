const module = {
  id: "db",
  title: "Database Fundamentals",
  shortTitle: "Database",
  emoji: "🗄️",
  badge: "Inti",
  levelId: 3,
  intro:
    "Database adalah ingatan aplikasi. Kalau backend hanya menyimpan data di variabel, semua akan hilang saat server restart. Di modul ini kamu belajar menyimpan, membaca, mengubah, dan menghapus data dengan cara yang aman. Kita mulai dari tabel sederhana, lalu masuk ke relasi, index, dan transaksi.",
  goals: [
    "Membedakan SQL dan NoSQL serta memilih sesuai kebutuhan.",
    "Menulis SELECT, INSERT, UPDATE, DELETE dengan WHERE.",
    "Memahami primary key, foreign key, dan JOIN.",
    "Membaca rencana query dengan EXPLAIN.",
    "Memahami transaksi dan ACID.",
  ],
  sections: [
    {
      title: "Kenapa aplikasi butuh database",
      body: [
        "Menyimpan data di variabel berarti data hilang saat server restart. Menyimpan di file teks bisa, tetapi sulit saat banyak user mengakses bersamaan, sulit dicari, dan rawan korup.",
        "Database dirancang untuk menyimpan data secara permanen, menangani banyak koneksi, menjaga integritas, dan menyediakan query yang cepat. Database juga punya backup, transaksi, dan kontrol akses.",
        "Di backend, database bukan tempat sampah. Struktur tabel dan aturan validasi adalah bagian dari desain aplikasi. Salah mendesain tabel bisa membuat fitur sederhana terasa berat bertahun-tahun.",
        "Database yang dipakai proyek ini adalah Firestore (NoSQL) untuk progres user. Lab SQL di bawah memakai database relasional mini supaya kamu bisa merasakan cara berpikir tabel dan relasi.",
      ],
      table: {
        head: ["Penyimpanan", "Kelebihan", "Kekurangan"],
        rows: [
          ["Variabel memori", "Super cepat", "Hilang saat restart"],
          ["File teks", "Mudah dibuat", "Sulit query, rawan korup"],
          ["SQL database", "Relasi, transaksi, query kuat", "Schema perlu direncanakan"],
          ["NoSQL database", "Fleksibel, mudah scale", "Relasi harus diatur manual"],
        ],
      },
      examples: [
        {
          title: "Data yang hilang vs tersimpan",
          code: `let hearts = [];
hearts.push({ id: 1, to: "Ratih" });

// server restart...
hearts = [];  // data hilang

// dengan database:
await db.insert("hearts", { to: "Ratih" });
// data tetap ada setelah restart`,
          output: `Memori  : data sementara
Database: data persisten`,
          note: "Database memberi durability: data yang sudah di-commit tetap ada meskipun proses aplikasi berhenti.",
        },
      ],
      tip: "Kalau data harus bertahan setelah restart, dipakai banyak user, atau perlu dicari dengan kriteria, itu tanda kuat butuh database.",
      practice: {
        prompt: "Lihat tabel apa saja yang ada di database lab.",
        commands: [{ label: "Lihat tabel", command: "SHOW TABLES;" }],
        hint: "Di lab ada tabel users, hearts, dan progress.",
      },
    },
    {
      title: "SQL vs NoSQL: memilih model data",
      body: [
        "SQL (PostgreSQL, MySQL) menyimpan data dalam tabel dengan kolom dan tipe yang ketat. Relasi antar tabel dijaga oleh foreign key. SQL mendukung JOIN dan transaksi ACID dengan sangat baik.",
        "NoSQL (MongoDB, Firestore) menyimpan data sebagai dokumen, key-value, atau graph. Schema-nya lebih fleksibel dan sering lebih mudah di-scale horizontal. Relasi biasanya diatur manual atau didenormalisasi.",
        "Pilihan bukan soal mana yang lebih keren, tetapi mana yang cocok dengan bentuk data dan pola aksesnya. Data pesanan, pembayaran, dan inventaris biasanya butuh konsistensi kuat → SQL. Data chat, log, dan profil yang bentuknya sering berubah → NoSQL sering nyaman.",
        "Banyak aplikasi memakai keduanya. Yang penting kamu tahu trade-off-nya, bukan memilih karena tren.",
      ],
      table: {
        head: ["Aspek", "SQL", "NoSQL"],
        rows: [
          ["Bentuk", "Tabel baris & kolom", "Dokumen / key-value / graph"],
          ["Schema", "Ketat, migration", "Fleksibel"],
          ["Relasi", "JOIN native, foreign key", "Manual / denormalisasi"],
          ["Transaksi", "ACID kuat", "Bervariasi, sering terbatas"],
          ["Scale", "Vertikal + read replica", "Horizontal / sharding"],
          ["Cocok", "Order, payment, inventory", "Chat, log, katalog, profil"],
        ],
      },
      examples: [
        {
          title: "Data yang sama, dua bentuk",
          code: `SQL
users
+----+---------+-------------------+
| id | name    | email             |
+----+---------+-------------------+
| 1  | Ratih   | ratih@nduttt.be   |
+----+---------+-------------------+

NoSQL (dokumen)
{
  "_id": "u_ratih",
  "name": "Ratih",
  "email": "ratih@nduttt.be",
  "hearts": [{ "note": "Semangat!" }]
}`,
          output: `SQL memecah data ke tabel dan menghubungkan lewat key.
NoSQL sering menyimpan data terkait dalam satu dokumen.`,
          note: "Denormalisasi mempercepat baca, tetapi membuat update data duplikat lebih rumit.",
        },
      ],
      warning: "Jangan memilih NoSQL hanya karena 'tidak perlu schema'. Tanpa schema yang jelas, data akan bercampur format dan validasi menjadi mimpi buruk.",
      practice: {
        prompt: "Lihat isi tabel users. Perhatikan kolom yang dimiliki setiap user.",
        commands: [
          { label: "Semua user", command: "SELECT * FROM users;" },
          { label: "Struktur tabel", command: "DESCRIBE users;" },
        ],
        hint: "DESCRIBE menunjukkan kolom dan tipe datanya. SELECT menunjukkan isinya.",
      },
    },
    {
      title: "Tabel, kolom, tipe data, dan constraint",
      body: [
        "Tabel adalah kumpulan baris dengan kolom yang sama. Setiap kolom punya tipe data: TEXT, INT, BOOLEAN, TIMESTAMPTZ, dan sebagainya. Tipe data membantu database memvalidasi dan mengoptimalkan penyimpanan.",
        "Constraint adalah aturan yang menjaga data tetap benar. NOT NULL mencegah nilai kosong. UNIQUE mencegah duplikat. DEFAULT mengisi nilai otomatis. CHECK membatasi nilai yang boleh masuk.",
        "Schema adalah cetak biru tabel. Perubahan schema di production dilakukan lewat migration, bukan dengan mengubah tabel manual tanpa catatan. Migration membuat perubahan bisa diulang di environment lain.",
        "Kolom tanggal sebaiknya memakai tipe tanggal, bukan TEXT. Kalau semua disimpan sebagai teks, sorting dan perbandingan tanggal akan salah.",
      ],
      table: {
        head: ["Constraint", "Fungsi", "Contoh"],
        rows: [
          ["PRIMARY KEY", "Identitas unik baris", "id SERIAL PRIMARY KEY"],
          ["NOT NULL", "Wajib diisi", "email TEXT NOT NULL"],
          ["UNIQUE", "Tidak boleh duplikat", "email TEXT UNIQUE"],
          ["DEFAULT", "Nilai otomatis", "created_at DEFAULT now()"],
          ["CHECK", "Batasi nilai", "level_id CHECK (level_id > 0)"],
          ["FOREIGN KEY", "Relasi ke tabel lain", "owner_uid REFERENCES users(uid)"],
        ],
      },
      examples: [
        {
          title: "Membuat tabel hearts",
          code: `CREATE TABLE hearts (
  id          SERIAL PRIMARY KEY,
  owner_uid   TEXT NOT NULL REFERENCES users(uid) ON DELETE CASCADE,
  note        TEXT NOT NULL,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);`,
          output: `Tabel hearts punya:
- id unik otomatis
- owner_uid yang wajib menunjuk user valid
- note yang wajib diisi
- waktu dibuat otomatis`,
          note: "Constraint bukan penghalang; dia pelindung agar data tidak setengah benar.",
        },
      ],
      tip: "Beri nama kolom yang jelas dan konsisten. `created_at` lebih mudah dipahami daripada `tgl` atau `cdate`.",
      practice: {
        prompt: "Periksa struktur tabel hearts dan progress. Perhatikan primary key dan foreign key-nya.",
        commands: [
          { label: "Hearts", command: "DESCRIBE hearts;" },
          { label: "Progress", command: "DESCRIBE progress;" },
        ],
        hint: "Kolom owner_uid dan user_uid adalah penghubung ke tabel users.",
      },
    },
    {
      title: "CRUD dengan SQL",
      body: [
        "SELECT mengambil data. INSERT menambah baris. UPDATE mengubah baris. DELETE menghapus baris. Empat operasi ini adalah dasar hampir semua fitur backend.",
        "WHERE adalah bagian paling penting. Tanpa WHERE, UPDATE dan DELETE akan mengenai seluruh tabel. Di lab ini, query tanpa WHERE sengaja ditolak supaya kamu terbiasa aman.",
        "Untuk INSERT, sebutkan kolom yang diisi. Jangan bergantung pada urutan kolom tabel. Untuk UPDATE, tulis WHERE sebelum menekan Enter. Untuk DELETE, pastikan dulu data yang akan dihapus dengan SELECT yang sama.",
        "Di kode aplikasi, jangan menyusun SQL dengan menggabungkan string input user. Gunakan parameterized query agar aman dari SQL injection. Database akan memperlakukan input sebagai nilai, bukan perintah.",
      ],
      table: {
        head: ["Aksi", "SQL", "Catatan"],
        rows: [
          ["Create", "INSERT INTO ... VALUES (...)", "Sebutkan kolom"],
          ["Read", "SELECT ... FROM ... WHERE ...", "Batasi dengan LIMIT"],
          ["Update", "UPDATE ... SET ... WHERE ...", "WHERE wajib"],
          ["Delete", "DELETE FROM ... WHERE ...", "Cek data dulu"],
        ],
      },
      examples: [
        {
          title: "CRUD satu baris",
          code: `INSERT INTO hearts (owner_uid, note)
VALUES ('u_ratih', 'Hati baru dari SQL');

SELECT * FROM hearts WHERE owner_uid = 'u_ratih';

UPDATE hearts SET note = 'Sudah diubah'
WHERE id = 2;

DELETE FROM hearts WHERE id = 4;`,
          output: `INSERT 0 1
SELECT 2 rows
UPDATE 1
DELETE 1`,
          note: "Angka setelah perintah menunjukkan berapa baris yang terpengaruh.",
        },
      ],
      warning: "Jangan pernah menjalankan `DELETE FROM hearts;` atau `UPDATE hearts SET ...;` tanpa WHERE di production. Biasakan SELECT dengan WHERE yang sama sebelum mengubah data.",
      practice: {
        prompt: "Lakukan CRUD lengkap. Insert satu hati, lihat hasilnya, update, lalu delete.",
        commands: [
          { label: "Insert", command: "INSERT INTO hearts (owner_uid, note) VALUES ('u_ratih', 'Halo dari SQL!');" },
          { label: "Baca", command: "SELECT * FROM hearts WHERE owner_uid = 'u_ratih';" },
          { label: "Update", command: "UPDATE hearts SET note = 'Catatan baru' WHERE id = 5;" },
          { label: "Delete", command: "DELETE FROM hearts WHERE id = 5;" },
        ],
        hint: "Id hasil insert kemungkinan 5 karena data awal berisi 4 hati. Lihat output INSERT untuk memastikan.",
      },
    },
    {
      title: "Primary Key, Foreign Key, dan relasi",
      body: [
        "Primary key adalah identitas unik setiap baris. Tidak boleh NULL dan tidak boleh duplikat. Biasanya berupa id auto-increment atau UUID. Jangan memakai email sebagai primary key karena email bisa berubah.",
        "Foreign key adalah kolom yang menunjuk primary key tabel lain. Dia menjaga integritas relasi: hati tidak boleh dimiliki user yang tidak ada. ON DELETE CASCADE membuat data anak ikut terhapus saat induknya dihapus.",
        "Relasi umum: satu-ke-satu (satu user satu profil), satu-ke-banyak (satu user banyak hati), dan banyak-ke-banyak (banyak user banyak role, butuh tabel penghubung).",
        "JOIN menggabungkan baris dari dua tabel berdasarkan kolom relasi. Ini kekuatan utama database relasional: kamu bisa mengambil data user dan progress-nya dalam satu query tanpa duplikasi data di tabel.",
      ],
      examples: [
        {
          title: "JOIN user dengan progress",
          code: `SELECT users.display_name, progress.level_id, progress.hearts_total
FROM progress
JOIN users ON progress.user_uid = users.uid
WHERE progress.level_id = 1
ORDER BY progress.hearts_total DESC;`,
          output: `+------------------+----------+--------------+
| users.display_name | progress.level_id | progress.hearts_total |
+------------------+----------+--------------+
| Tuan Putri Ratih | 1        | 350          |
| Admin Nduttt     | 1        | 150          |
| Sahabat Ratih    | 1        | 80           |
+------------------+----------+--------------+`,
          note: "JOIN mencocokkan progress.user_uid dengan users.uid, lalu menampilkan kolom dari kedua tabel.",
        },
      ],
      tip: "Gambar relasi di kertas sebelum membuat tabel. Satu user punya berapa hati? Satu hati punya berapa komentar? Jawaban ini menentukan bentuk tabel.",
      practice: {
        prompt: "Gabungkan tabel progress dan users, lalu urutkan berdasarkan total hati.",
        commands: [
          { label: "JOIN dasar", command: "SELECT users.display_name, progress.hearts_total FROM progress JOIN users ON progress.user_uid = users.uid;" },
          { label: "JOIN + filter", command: "SELECT users.display_name, progress.level_id, progress.hearts_total FROM progress JOIN users ON progress.user_uid = users.uid WHERE progress.level_id = 1;" },
        ],
        hint: "Awali kolom dengan nama tabel kalau nama kolomnya bisa ambigu, misalnya users.uid dan progress.user_uid.",
      },
    },
    {
      title: "Index: daftar isi untuk query cepat",
      body: [
        "Index adalah struktur tambahan yang membuat pencarian lebih cepat. Analoginya daftar isi buku: kamu tidak perlu membaca semua halaman untuk menemukan topik tertentu.",
        "Index paling berguna untuk kolom yang sering dipakai di WHERE, ORDER BY, atau JOIN. Primary key otomatis punya index. Foreign key sebaiknya juga diberi index karena sering dipakai untuk join.",
        "Index tidak gratis. Setiap INSERT/UPDATE harus memperbarui index, dan index memakan penyimpanan. Terlalu banyak index membuat proses tulis lambat. Ukur dengan EXPLAIN, jangan menebak.",
        "Composite index mengikuti urutan kolom. Index (user_uid, level_id) mempercepat query yang memfilter user_uid dan level_id, tetapi belum tentu mempercepat query yang hanya memfilter level_id.",
      ],
      examples: [
        {
          title: "Membaca EXPLAIN",
          code: `EXPLAIN SELECT * FROM hearts WHERE id = 1;

EXPLAIN SELECT * FROM hearts WHERE owner_uid = 'u_ratih';

EXPLAIN SELECT * FROM hearts;`,
          output: `Index Scan using hearts_pkey on hearts
  → mencari langsung lewat primary key

Index Scan using idx_hearts_owner on hearts
  → memakai index foreign key

Seq Scan on hearts
  → membaca seluruh tabel`,
          note: "Seq Scan belum tentu buruk untuk tabel kecil. Untuk tabel jutaan baris, index bisa sangat membantu.",
        },
      ],
      warning: "Jangan menambahkan index ke semua kolom. Index yang berlebihan memperlambat write dan memboroskan storage. Ukur query yang benar-benar lambat.",
      practice: {
        prompt: "Bandingkan rencana query yang memakai primary key, foreign key, dan tanpa WHERE.",
        commands: [
          { label: "Primary key", command: "EXPLAIN SELECT * FROM hearts WHERE id = 1;" },
          { label: "Foreign key", command: "EXPLAIN SELECT * FROM hearts WHERE owner_uid = 'u_ratih';" },
          { label: "Tanpa WHERE", command: "EXPLAIN SELECT * FROM hearts;" },
        ],
        hint: "Perhatikan kata Index Scan vs Seq Scan. Itulah petunjuk apakah index dipakai.",
      },
    },
    {
      title: "Transaksi & ACID",
      body: [
        "Transaksi adalah sekumpulan operasi yang harus berhasil semua atau tidak sama sekali. Contoh: mengurangi saldo pengirim dan menambah saldo penerima. Kalau satu gagal, keduanya harus dibatalkan.",
        "ACID adalah empat jaminan: Atomicity (semua atau tidak sama sekali), Consistency (data tetap valid), Isolation (transaksi tidak saling mengganggu), dan Durability (data yang sudah commit tetap tersimpan).",
        "Di SQL, transaksi dimulai dengan BEGIN, diakhiri COMMIT kalau sukses, atau ROLLBACK kalau gagal. Jangan membuka transaksi terlalu lama karena bisa mengunci baris dan memperlambat user lain.",
        "Race condition terjadi saat dua proses mengubah data yang sama bersamaan. Transaksi dan lock membantu, tetapi desain query tetap penting. Gunakan operasi atomik seperti `UPDATE ... SET saldo = saldo - 10 WHERE ...` daripada membaca lalu menulis ulang.",
      ],
      examples: [
        {
          title: "Transfer yang aman",
          code: `BEGIN;

UPDATE accounts SET balance = balance - 100
WHERE id = 1 AND balance >= 100;

UPDATE accounts SET balance = balance + 100
WHERE id = 2;

COMMIT;`,
          output: `Kalau salah satu UPDATE gagal:
ROLLBACK;  → saldo kembali seperti semula`,
          note: "Tanpa transaksi, saldo bisa terpotong tetapi tidak pernah sampai ke penerima.",
        },
      ],
      tip: "Transaksi bukan pengganti validasi. Tetap periksa input, hak akses, dan aturan bisnis sebelum menjalankan operasi.",
      practice: {
        prompt: "Coba transaksi: ubah data, lihat hasilnya, lalu rollback. Data harus kembali seperti semula.",
        commands: [
          { label: "Mulai", command: "BEGIN;" },
          { label: "Ubah", command: "UPDATE hearts SET note = 'Perubahan sementara' WHERE id = 1;" },
          { label: "Lihat", command: "SELECT * FROM hearts WHERE id = 1;" },
          { label: "Batalkan", command: "ROLLBACK;" },
          { label: "Cek lagi", command: "SELECT * FROM hearts WHERE id = 1;" },
        ],
        hint: "ROLLBACK membatalkan semua perubahan sejak BEGIN.",
      },
    },
    {
      title: "Latihan: query ranking pemain",
      body: [
        "Sekarang gabungkan semua yang sudah dipelajari. Kita ingin menampilkan peringkat user berdasarkan total hati di level tertentu.",
        "Langkahnya: pilih tabel progress, join ke users untuk mendapatkan nama, filter level, urutkan dari terbesar, lalu batasi jumlahnya.",
        "Query yang baik dibaca seperti kalimat: SELECT kolom apa, FROM tabel mana, JOIN ke tabel apa, WHERE kondisi apa, ORDER BY apa, LIMIT berapa.",
        "Setelah query benar, baru pikirkan performa. Apakah kolom filter sudah di-index? Apakah jumlah barisnya wajar? Apakah query ini akan dipanggil di setiap request?",
      ],
      examples: [
        {
          title: "Ranking level 1",
          code: `SELECT users.display_name, progress.hearts_total
FROM progress
JOIN users ON progress.user_uid = users.uid
WHERE progress.level_id = 1
ORDER BY progress.hearts_total DESC
LIMIT 3;`,
          output: `+------------------+--------------+
| users.display_name | progress.hearts_total |
+------------------+--------------+
| Tuan Putri Ratih | 350          |
| Admin Nduttt     | 150          |
| Sahabat Ratih    | 80           |
+------------------+--------------+`,
          note: "Query ini menggabungkan relasi, filter, sorting, dan limit dalam satu perintah.",
        },
      ],
      practice: {
        prompt: "Coba query ranking lengkap, lalu ubah level dan urutannya.",
        commands: [
          { label: "Ranking level 1", command: "SELECT users.display_name, progress.hearts_total FROM progress JOIN users ON progress.user_uid = users.uid WHERE progress.level_id = 1 ORDER BY progress.hearts_total DESC LIMIT 3;" },
          { label: "Ranking level 2", command: "SELECT users.display_name, progress.hearts_total FROM progress JOIN users ON progress.user_uid = users.uid WHERE progress.level_id = 2 ORDER BY progress.hearts_total DESC;" },
        ],
        hint: "Perhatikan bahwa kolom yang dipakai di WHERE dan ORDER BY diawali nama tabel agar tidak ambigu.",
      },
    },
  ],
  summary: [
    "Database menyimpan data secara permanen dan mengatur akses bersamaan.",
    "SQL cocok untuk relasi & konsistensi; NoSQL untuk fleksibilitas & skala.",
    "WHERE wajib pada UPDATE/DELETE agar data lain tidak ikut berubah.",
    "Primary key = identitas, foreign key = relasi.",
    "Index mempercepat baca tetapi memperlambat tulis.",
    "Transaksi menjaga beberapa operasi tetap atomik.",
  ],
};

export default module;
