/**
 * Naskah singkat untuk animasi mengetik "Tuan Putri, Tonton ini ya sayangg!!".
 * Diambil dari materi yang sudah ada supaya penjelasannya tetap konsisten.
 */

const METHOD_MEANING = {
  GET: "ambil data, tidak mengubah apa pun, dan aman dipanggil berkali-kali",
  POST: "buat data baru; kalau dikirim dua kali, bisa jadi dua data",
  PUT: "ganti seluruh data dengan versi yang baru",
  PATCH: "ubah sebagian field saja, bukan seluruh data",
  DELETE: "hapus data; kalau diulang, hasil akhirnya tetap terhapus",
  HEAD: "ambil informasi header saja, tanpa body",
  OPTIONS: "tanya ke server, method apa saja yang boleh dipakai",
};

function clip(text, max = 240) {
  const clean = String(text || "").replace(/\s+/g, " ").trim();
  if (clean.length <= max) return clean;
  const cut = clean.slice(0, max);
  const stop = Math.max(cut.lastIndexOf(". "), cut.lastIndexOf("! "), cut.lastIndexOf("? "));
  return `${(stop > max * 0.45 ? cut.slice(0, stop + 1) : cut.trimEnd())}…`;
}

function methodLines(parts, table) {
  const rows = (table?.rows || []).filter((row) => METHOD_MEANING[String(row[0] || "").toUpperCase()]);
  if (!rows.length) return false;
  parts.push("Ini arti method-nya, pelan-pelan ya:");
  rows.forEach(([method, action]) => {
    const key = String(method).toUpperCase();
    parts.push(`• ${key} = ${METHOD_MEANING[key] || action}.`);
  });
  return true;
}

export function buildTopicNarration(topic) {
  if (!topic) return "";
  const parts = [
    "Halo Tuan Putri sayangg! 🎬",
    `Sekarang kita tonton modul: ${topic.title}.`,
    clip(topic.intro, 340),
  ];

  if (topic.goals?.length) {
    parts.push("Setelah modul ini, Tuan Putri bakal bisa:");
    topic.goals.slice(0, 4).forEach((goal) => parts.push(`• ${clip(goal, 150)}`));
  }

  if (topic.sections?.length) {
    const titles = topic.sections.slice(0, 4).map((section) => section.title);
    parts.push(
      `Materinya ada ${topic.sections.length} bagian: ${titles.join("; ")}${topic.sections.length > 4 ? "; dan lainnya" : ""}.`,
    );
  }

  parts.push("Kalau sudah siap, buka materinya satu per satu ya. Pelan-pelan aja, aku temenin. ❤");
  return parts.filter(Boolean).join("\n\n");
}

export function buildSectionNarration(topic, section) {
  if (!section) return buildTopicNarration(topic);
  const parts = [
    "Halo Tuan Putri sayangg! 🎬",
    `Sekarang kita tonton materi: ${section.title}.`,
  ];

  const bodyLimit = section.table || section.steps ? 1 : 2;
  (section.body || []).slice(0, bodyLimit).forEach((paragraph) => parts.push(clip(paragraph, 280)));

  if (section.steps?.length) {
    parts.push("Alurnya begini:");
    section.steps.slice(0, 5).forEach((step, i) => parts.push(`${i + 1}. ${clip(step, 140)}`));
  }

  const hasMethods = methodLines(parts, section.table);

  if (!hasMethods && section.table?.rows?.length) {
    parts.push(`${section.table.head?.[0] || "Istilah"} yang perlu diingat:`);
    section.table.rows.slice(0, 4).forEach((row) => {
      parts.push(`• ${row[0]} — ${clip(row.slice(1).filter(Boolean).join(" · "), 130)}`);
    });
  }

  if (section.analogy) parts.push(`Versi santainya: ${clip(section.analogy, 230)}`);
  if (section.tip) parts.push(`Catatan penting: ${clip(section.tip, 220)}`);
  if (section.warning) parts.push(`Hati-hati: ${clip(section.warning, 220)}`);

  if (section.examples?.[0]) {
    const example = section.examples[0];
    parts.push(`Contohnya: ${example.title}.${example.note ? ` ${clip(example.note, 190)}` : ""}`);
  }

  if (section.practice?.prompt) {
    parts.push(`Nanti kita coba langsung di lab: ${clip(section.practice.prompt, 190)}`);
  }

  if (topic?.sections?.length) {
    parts.push(`Ini bagian ${topic.sections.findIndex((item) => item.title === section.title) + 1} dari ${topic.sections.length} di modul ${topic.shortTitle || topic.title}.`);
  }

  return parts.filter(Boolean).join("\n\n");
}

export function buildCheatsheetNarration(level) {
  if (!level) return "";
  const parts = [
    "Halo Tuan Putri sayangg! 🎬",
    `Ini ringkasan materi: ${level.title}.`,
    clip(level.description, 300),
  ];

  (level.cheatsheet || []).slice(0, 5).forEach((block) => {
    parts.push(`${block.heading}:`);
    (block.points || []).slice(0, 3).forEach((point) => parts.push(`• ${clip(point, 170)}`));
  });

  parts.push("Kalau sudah paham, kita lanjut ke kuisnya ya. Aku yakin Tuan Putri bisa! ❤");
  return parts.filter(Boolean).join("\n\n");
}
