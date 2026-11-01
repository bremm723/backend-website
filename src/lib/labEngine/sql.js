import { L } from "./shared";

const SCHEMA = {
  users: {
    columns: ["uid", "display_name", "email", "role", "created_at"],
    types: {
      uid: "TEXT PRIMARY KEY",
      display_name: "TEXT NOT NULL",
      email: "TEXT UNIQUE NOT NULL",
      role: "TEXT NOT NULL DEFAULT 'friend'",
      created_at: "DATE NOT NULL",
    },
  },
  hearts: {
    columns: ["id", "owner_uid", "note", "created_at"],
    types: {
      id: "SERIAL PRIMARY KEY",
      owner_uid: "TEXT REFERENCES users(uid) ON DELETE CASCADE",
      note: "TEXT NOT NULL",
      created_at: "TIMESTAMPTZ DEFAULT now()",
    },
  },
  progress: {
    columns: ["id", "user_uid", "level_id", "hearts_total", "completed_at"],
    types: {
      id: "SERIAL PRIMARY KEY",
      user_uid: "TEXT REFERENCES users(uid) ON DELETE CASCADE",
      level_id: "INT NOT NULL",
      hearts_total: "INT NOT NULL DEFAULT 0",
      completed_at: "DATE NOT NULL",
    },
  },
};

export function createSqlState() {
  return {
    users: [
      {
        uid: "u_ratih",
        display_name: "Tuan Putri Ratih",
        email: "ratih@nduttt.be",
        role: "princess",
        created_at: "2026-10-01",
      },
      {
        uid: "u_admin",
        display_name: "Admin Nduttt",
        email: "admin@nduttt.be",
        role: "owner",
        created_at: "2026-10-02",
      },
      {
        uid: "u_sahabat",
        display_name: "Sahabat Ratih",
        email: "sahabat@nduttt.be",
        role: "friend",
        created_at: "2026-10-03",
      },
    ],
    hearts: [
      { id: 1, owner_uid: "u_ratih", note: "Semangat belajar backend!", created_at: "2026-10-20" },
      { id: 2, owner_uid: "u_ratih", note: "Jangan lupa istirahat.", created_at: "2026-10-24" },
      { id: 3, owner_uid: "u_admin", note: "Selamat datang di level 2.", created_at: "2026-10-25" },
      { id: 4, owner_uid: "u_sahabat", note: "Kamu pasti bisa!", created_at: "2026-10-26" },
    ],
    progress: [
      { id: 1, user_uid: "u_ratih", level_id: 1, hearts_total: 350, completed_at: "2026-10-20" },
      { id: 2, user_uid: "u_ratih", level_id: 2, hearts_total: 300, completed_at: "2026-10-22" },
      { id: 3, user_uid: "u_ratih", level_id: 3, hearts_total: 250, completed_at: "2026-10-25" },
      { id: 4, user_uid: "u_admin", level_id: 1, hearts_total: 150, completed_at: "2026-10-21" },
      { id: 5, user_uid: "u_admin", level_id: 2, hearts_total: 100, completed_at: "2026-10-23" },
      { id: 6, user_uid: "u_sahabat", level_id: 1, hearts_total: 80, completed_at: "2026-10-24" },
    ],
    next: { hearts: 5, progress: 7 },
    snapshot: null,
  };
}

function splitTopLevel(value, separator = ",") {
  const parts = [];
  let current = "";
  let quote = null;
  let depth = 0;
  for (let i = 0; i < value.length; i += 1) {
    const char = value[i];
    if (quote) {
      current += char;
      if (char === quote && value[i - 1] !== "\\") quote = null;
      continue;
    }
    if (char === "'" || char === '"') {
      quote = char;
      current += char;
    } else if (char === "(") {
      depth += 1;
      current += char;
    } else if (char === ")") {
      depth -= 1;
      current += char;
    } else if (depth === 0 && value.startsWith(separator, i)) {
      parts.push(current.trim());
      current = "";
      i += separator.length - 1;
    } else {
      current += char;
    }
  }
  if (current.trim()) parts.push(current.trim());
  return parts;
}

function parseLiteral(token) {
  const value = String(token).trim();
  if (/^null$/i.test(value)) return null;
  if (/^true$/i.test(value)) return true;
  if (/^false$/i.test(value)) return false;
  if (/^-?\d+(\.\d+)?$/.test(value)) return Number(value);
  if (
    (value.startsWith("'") && value.endsWith("'")) ||
    (value.startsWith('"') && value.endsWith('"'))
  ) {
    return value.slice(1, -1).replace(/''/g, "'");
  }
  return value;
}

function renderTable(columns, rows) {
  if (!rows.length) return "(0 rows)";
  const widths = columns.map((column) =>
    Math.max(
      String(column).length,
      ...rows.map((row) => String(row[column] ?? "NULL").length)
    )
  );
  const border = `+${widths.map((width) => "-".repeat(width + 2)).join("+")}+`;
  const header = `| ${columns
    .map((column, index) => String(column).padEnd(widths[index]))
    .join(" | ")} |`;
  const lines = [border, header, border];
  rows.forEach((row) => {
    lines.push(
      `| ${columns
        .map((column, index) => String(row[column] ?? "NULL").padEnd(widths[index]))
        .join(" | ")} |`
    );
  });
  lines.push(border);
  return lines.join("\n");
}

function resolveValue(row, token) {
  if (token in row) return row[token];
  const short = token.split(".").pop();
  if (short in row) return row[short];
  return undefined;
}

function compare(left, operator, right) {
  if (typeof left === "number" && typeof right === "string" && right !== "" && !Number.isNaN(Number(right))) {
    right = Number(right);
  }
  if (left === undefined) return false;
  switch (operator) {
    case "=":
      return String(left) === String(right);
    case "!=":
    case "<>":
      return String(left) !== String(right);
    case ">":
      return left > right;
    case "<":
      return left < right;
    case ">=":
      return left >= right;
    case "<=":
      return left <= right;
    default:
      return false;
  }
}

function parseWhere(where) {
  if (!where) return [];
  return splitTopLevel(where, " AND ").map((condition) => {
    const match = condition.match(/^([\w.]+)\s*(>=|<=|!=|<>|=|>|<)\s*([\s\S]+)$/);
    if (!match) return null;
    return { column: match[1], operator: match[2], value: parseLiteral(match[3]) };
  }).filter(Boolean);
}

function applyWhere(rows, where) {
  const conditions = parseWhere(where);
  if (!conditions.length) return rows;
  return rows.filter((row) =>
    conditions.every((condition) => compare(resolveValue(row, condition.column), condition.operator, condition.value))
  );
}

function sortRows(rows, orderBy) {
  if (!orderBy) return rows;
  const match = orderBy.match(/^([\w.]+)(?:\s+(ASC|DESC))?$/i);
  if (!match) return rows;
  const column = match[1];
  const direction = (match[2] || "ASC").toUpperCase() === "DESC" ? -1 : 1;
  return [...rows].sort((a, b) => {
    const left = resolveValue(a, column);
    const right = resolveValue(b, column);
    if (left === right) return 0;
    if (left === undefined) return 1;
    if (right === undefined) return -1;
    return left > right ? direction : -direction;
  });
}

function extractClauses(rest) {
  const whereMatch = rest.match(/\bWHERE\s+([\s\S]+?)(?=\bORDER\s+BY\b|\bLIMIT\b|$)/i);
  const orderMatch = rest.match(/\bORDER\s+BY\s+([\w.]+(?:\s+(?:ASC|DESC))?)/i);
  const limitMatch = rest.match(/\bLIMIT\s+(\d+)/i);
  return {
    where: whereMatch ? whereMatch[1].trim() : null,
    orderBy: orderMatch ? orderMatch[1].trim() : null,
    limit: limitMatch ? Number(limitMatch[1]) : null,
  };
}

function selectRows(state, sql, events) {
  const match = sql.match(
    /^SELECT\s+([\s\S]+?)\s+FROM\s+([A-Za-z_]\w*)(?:\s+(?:AS\s+)?((?!WHERE\b|JOIN\b|ORDER\b|LIMIT\b|GROUP\b)[A-Za-z_]\w*))?\s*([\s\S]*)$/i
  );
  if (!match) {
    return [L.error("Sintaks SELECT belum benar. Contoh: SELECT * FROM users;")];
  }

  const selectPart = match[1].trim();
  const baseTable = match[2].toLowerCase();
  const baseAlias = match[3] || baseTable;
  let rest = (match[4] || "").trim();

  if (!SCHEMA[baseTable]) {
    return [L.error(`Tabel '${baseTable}' tidak ada. Coba SHOW TABLES;`)];
  }

  const joinMatch = rest.match(
    /^JOIN\s+([A-Za-z_]\w*)(?:\s+(?:AS\s+)?((?!ON\b|WHERE\b|ORDER\b|LIMIT\b)[A-Za-z_]\w*))?\s+ON\s+([A-Za-z_]\w*)\.([A-Za-z_]\w*)\s*=\s*([A-Za-z_]\w*)\.([A-Za-z_]\w*)\s*([\s\S]*)$/i
  );

  let rows = state[baseTable].map((row) => ({ ...row }));
  let columns = [...SCHEMA[baseTable].columns];
  let joinTable = null;

  if (joinMatch) {
    joinTable = joinMatch[1].toLowerCase();
    const rightAlias = joinMatch[2] || joinTable;
    const leftOnTable = joinMatch[3].toLowerCase();
    const leftOnColumn = joinMatch[4];
    const rightOnTable = joinMatch[5].toLowerCase();
    const rightOnColumn = joinMatch[6];
    rest = (joinMatch[7] || "").trim();

    if (!SCHEMA[joinTable]) {
      return [L.error(`Tabel join '${joinTable}' tidak ada.`)];
    }

    const joined = [];
    state[baseTable].forEach((leftRow) => {
      state[joinTable].forEach((rightRow) => {
        const leftValue =
          leftOnTable === baseTable || leftOnTable === baseAlias
            ? leftRow[leftOnColumn]
            : rightRow[leftOnColumn];
        const rightValue =
          rightOnTable === joinTable || rightOnTable === rightAlias
            ? rightRow[rightOnColumn]
            : leftRow[rightOnColumn];
        if (leftValue !== undefined && rightValue !== undefined && String(leftValue) === String(rightValue)) {
          const row = {};
          SCHEMA[baseTable].columns.forEach((column) => {
            row[`${baseAlias}.${column}`] = leftRow[column];
            if (!(column in row)) row[column] = leftRow[column];
          });
          SCHEMA[joinTable].columns.forEach((column) => {
            row[`${rightAlias}.${column}`] = rightRow[column];
            if (!(column in row)) row[column] = rightRow[column];
          });
          joined.push(row);
        }
      });
    });
    rows = joined;
    columns = [
      ...SCHEMA[baseTable].columns.map((column) => `${baseAlias}.${column}`),
      ...SCHEMA[joinTable].columns.map((column) => `${rightAlias}.${column}`),
    ];
    events.push("sql:join");
  }

  const clauses = extractClauses(rest);
  rows = applyWhere(rows, clauses.where);
  rows = sortRows(rows, clauses.orderBy);
  if (clauses.limit !== null) rows = rows.slice(0, clauses.limit);

  if (/^COUNT\(\*\)$/i.test(selectPart)) {
    return [
      L.success(`${rows.length} baris cocok.`),
      L.table(renderTable(["count"], [{ count: rows.length }])),
    ];
  }

  const selected = selectPart === "*"
    ? columns.map((column) => ({ token: column, label: column }))
    : splitTopLevel(selectPart).map((token) => {
        const aliasMatch = token.match(/^([\s\S]+?)\s+AS\s+([A-Za-z_]\w*)$/i);
        return aliasMatch
          ? { token: aliasMatch[1].trim(), label: aliasMatch[2] }
          : { token: token.trim(), label: token.trim() };
      });

  const outputRows = rows.map((row) => {
    const output = {};
    selected.forEach(({ token, label }) => {
      output[label] = resolveValue(row, token);
    });
    return output;
  });
  const labels = selected.map((item) => item.label);
  return [
    L.success(`${outputRows.length} baris dikembalikan.`),
    L.table(renderTable(labels, outputRows)),
  ];
}

function runInsert(state, sql, events, table) {
  const match = sql.match(/^INSERT\s+INTO\s+([A-Za-z_]\w*)\s*\(([^)]+)\)\s*VALUES\s*\(([\s\S]+)\)$/i);
  if (!match) {
    return [L.error("Format INSERT: INSERT INTO hearts (owner_uid, note) VALUES ('u_ratih', 'Halo');")];
  }
  const target = match[1].toLowerCase();
  if (!SCHEMA[target]) return [L.error(`Tabel '${target}' tidak ada.`)];
  if (table && target !== table) return [L.error(`Perintah ini hanya untuk tabel ${table}.`)];

  const columns = splitTopLevel(match[2]).map((item) => item.trim());
  const values = splitTopLevel(match[3]).map(parseLiteral);
  if (columns.length !== values.length) {
    return [L.error("Jumlah kolom dan VALUES harus sama.")];
  }
  const unknown = columns.find((column) => !SCHEMA[target].columns.includes(column));
  if (unknown) return [L.error(`Kolom '${unknown}' tidak ada di tabel ${target}.`)];

  const row = {};
  columns.forEach((column, index) => {
    row[column] = values[index];
  });

  if (target === "users") {
    if (!row.uid) return [L.error("Kolom uid wajib diisi untuk tabel users.")];
    if (!row.display_name) return [L.error("Kolom display_name wajib diisi.")];
    if (!row.email) return [L.error("Kolom email wajib diisi.")];
    if (!row.role) row.role = "friend";
  }

  if (target === "hearts") {
    if (!row.owner_uid) return [L.error("Kolom owner_uid wajib diisi.")];
    if (!row.note) return [L.error("Kolom note wajib diisi.")];
    if (!state.users.some((user) => user.uid === row.owner_uid)) {
      return [L.error(`FOREIGN KEY gagal: owner_uid '${row.owner_uid}' tidak ada di tabel users.`)];
    }
    if (row.id === undefined) row.id = state.next.hearts++;
  }

  if (target === "progress") {
    if (!row.user_uid) return [L.error("Kolom user_uid wajib diisi.")];
    if (row.level_id === undefined) return [L.error("Kolom level_id wajib diisi.")];
    if (!state.users.some((user) => user.uid === row.user_uid)) {
      return [L.error(`FOREIGN KEY gagal: user_uid '${row.user_uid}' tidak ada di tabel users.`)];
    }
    if (row.hearts_total === undefined) row.hearts_total = 0;
    if (row.id === undefined) row.id = state.next.progress++;
  }

  if (SCHEMA[target].columns.includes("created_at") && !row.created_at) {
    row.created_at = new Date().toISOString().slice(0, 10);
  }
  if (SCHEMA[target].columns.includes("completed_at") && !row.completed_at) {
    row.completed_at = new Date().toISOString().slice(0, 10);
  }

  state[target].push(row);
  events.push("sql:insert");
  return [
    L.success(`INSERT 0 1 — 1 baris ditambahkan ke ${target}.`),
    L.table(renderTable(SCHEMA[target].columns, [row])),
  ];
}

function splitUpdate(sql, keyword) {
  const match = sql.match(
    new RegExp(`^${keyword}\\s+([A-Za-z_]\\w*)\\s+(SET\\s+)?([\\s\\S]+)$`, "i")
  );
  if (!match) return null;
  let rest = match[3];
  let where = null;
  const whereMatch = rest.match(/^([\s\S]+?)\s+WHERE\s+([\s\S]+)$/i);
  if (whereMatch) {
    rest = whereMatch[1];
    where = whereMatch[2];
  }
  return { table: match[1].toLowerCase(), rest, where };
}

function runUpdate(state, sql, events) {
  const parsed = splitUpdate(sql, "UPDATE");
  if (!parsed) return [L.error("Format UPDATE: UPDATE hearts SET note = 'Baru' WHERE id = 2;")];
  const { table, rest, where } = parsed;
  if (!SCHEMA[table]) return [L.error(`Tabel '${table}' tidak ada.`)];
  if (!where) {
    events.push("sql:error-no-where");
    return [
      L.error("UPDATE ditolak: WHERE wajib ada."),
      L.warn("Tanpa WHERE, SEMUA baris akan berubah. Lab ini sengaja memblokir supaya aman."),
    ];
  }
  const assignments = splitTopLevel(rest.replace(/^SET\s+/i, ""));
  if (!assignments.length) return [L.error("Tidak ada kolom yang diubah.")];

  const changes = {};
  for (const assignment of assignments) {
    const match = assignment.match(/^([A-Za-z_]\w*)\s*=\s*([\s\S]+)$/);
    if (!match) return [L.error(`Assignment '${assignment}' tidak valid.`)];
    if (!SCHEMA[table].columns.includes(match[1])) {
      return [L.error(`Kolom '${match[1]}' tidak ada di tabel ${table}.`)];
    }
    changes[match[1]] = parseLiteral(match[2]);
  }

  const targets = applyWhere(state[table], where);
  targets.forEach((row) => Object.assign(row, changes));
  events.push("sql:update");
  return [
    L.success(`UPDATE ${targets.length} — ${targets.length} baris diubah.`),
    targets.length ? L.table(renderTable(SCHEMA[table].columns, targets)) : L.muted("Tidak ada baris yang cocok."),
  ];
}

function runDelete(state, sql, events) {
  const match = sql.match(
    /^DELETE\s+FROM\s+([A-Za-z_]\w*)(?:\s+WHERE\s+([\s\S]+))?$/i
  );
  if (!match) return [L.error("Format DELETE: DELETE FROM hearts WHERE id = 3;")];
  const table = match[1].toLowerCase();
  const where = match[2] ? match[2].trim() : null;
  if (!SCHEMA[table]) return [L.error(`Tabel '${table}' tidak ada.`)];
  if (!where) {
    events.push("sql:error-no-where");
    return [
      L.error("DELETE ditolak: WHERE wajib ada."),
      L.warn("Tanpa WHERE, seluruh isi tabel akan hilang. Selalu tulis WHERE dulu."),
    ];
  }

  const targets = applyWhere(state[table], where);
  const targetSet = new Set(targets);
  state[table] = state[table].filter((row) => !targetSet.has(row));

  // Simulasikan ON DELETE CASCADE untuk relasi users -> hearts/progress.
  if (table === "users" && targets.length) {
    const removedUids = new Set(targets.map((row) => row.uid));
    state.hearts = state.hearts.filter((row) => !removedUids.has(row.owner_uid));
    state.progress = state.progress.filter((row) => !removedUids.has(row.user_uid));
  }

  events.push("sql:delete");
  return [
    L.success(`DELETE ${targets.length} — ${targets.length} baris dihapus.`),
    targets.length ? L.table(renderTable(SCHEMA[table].columns, targets)) : L.muted("Tidak ada baris yang cocok."),
  ];
}

function explain(sql) {
  const query = sql.replace(/^EXPLAIN\s+/i, "");
  const tableMatch = query.match(/\bFROM\s+([A-Za-z_]\w*)/i);
  const table = tableMatch ? tableMatch[1].toLowerCase() : "?";
  const where = query.match(/\bWHERE\s+([\s\S]+)$/i);
  const whereText = where ? where[1] : "";
  let plan = `Seq Scan on ${table}  (cost=0.00..35.50 rows=1000 width=64)`;
  let reason = "Tidak ada WHERE, jadi database membaca seluruh tabel.";
  if (/\bid\s*=/i.test(whereText)) {
    plan = `Index Scan using ${table}_pkey on ${table}  (cost=0.15..8.20 rows=1 width=64)`;
    reason = "Kolom id punya primary key index, pencarian langsung menuju barisnya.";
  } else if (/owner_uid\s*=/i.test(whereText) || /user_uid\s*=/i.test(whereText)) {
    plan = `Index Scan using idx_${table}_owner on ${table}  (cost=0.28..12.60 rows=8 width=64)`;
    reason = "Kolom relasi sering dipakai WHERE/JOIN, jadi dia diberi index.";
  } else if (whereText) {
    reason = "WHERE ada, tapi kolomnya belum punya index. Database bisa tetap full scan.";
  }
  return [
    L.info("Rencana eksekusi (simulasi EXPLAIN):"),
    L.code(plan),
    L.text(reason),
    L.muted("Index mempercepat baca, tetapi menambah biaya tulis. Ukur dengan EXPLAIN ANALYZE di database asli."),
  ];
}

export function runSqlCommand(rawInput, state) {
  const raw = rawInput.trim();
  if (!raw) return { lines: [], events: [] };
  if (/^help$/i.test(raw)) {
    return {
      events: [],
      lines: [
        L.info("Perintah SQL yang didukung"),
        L.text("  SHOW TABLES;"),
        L.text("  DESCRIBE hearts;"),
        L.text("  SELECT * FROM users;"),
        L.text("  SELECT * FROM hearts WHERE owner_uid = 'u_ratih';"),
        L.text("  SELECT * FROM progress ORDER BY hearts_total DESC LIMIT 3;"),
        L.text("  SELECT users.display_name, progress.hearts_total"),
        L.text("    FROM progress JOIN users ON progress.user_uid = users.uid;"),
        L.text("  INSERT INTO hearts (owner_uid, note) VALUES ('u_ratih', 'Halo!');"),
        L.text("  UPDATE hearts SET note = 'Baru' WHERE id = 2;"),
        L.text("  DELETE FROM hearts WHERE id = 3;"),
        L.text("  EXPLAIN SELECT * FROM hearts WHERE id = 1;"),
        L.text("  BEGIN; · COMMIT; · ROLLBACK;"),
        L.muted("Semicolon boleh dipakai atau tidak. UPDATE/DELETE tanpa WHERE akan ditolak."),
      ],
    };
  }

  const sql = raw.replace(/;+\s*$/g, "").trim();
  const upper = sql.toUpperCase();
  const events = [];

  if (upper === "SHOW TABLES") {
    return {
      events: ["sql:list-tables"],
      lines: [
        L.info("Tabel di database nduttt:"),
        L.table(renderTable(["table_name", "rows"], Object.keys(SCHEMA).map((name) => ({
          table_name: name,
          rows: state[name].length,
        })))),
      ],
    };
  }

  const describeMatch = sql.match(/^DESCRIBE\s+([A-Za-z_]\w*)$/i);
  if (describeMatch) {
    const table = describeMatch[1].toLowerCase();
    if (!SCHEMA[table]) return { events: [], lines: [L.error(`Tabel '${table}' tidak ada.`)] };
    return {
      events: [],
      lines: [
        L.info(`Struktur tabel ${table}:`),
        L.table(renderTable(["column", "type"], SCHEMA[table].columns.map((column) => ({
          column,
          type: SCHEMA[table].types[column],
        })))),
      ],
    };
  }

  if (/^SELECT\b/i.test(sql)) {
    const lines = selectRows(state, sql, events);
    return { events: [...events, "sql:select"], lines };
  }
  if (/^INSERT\b/i.test(sql)) return { events, lines: runInsert(state, sql, events) };
  if (/^UPDATE\b/i.test(sql)) return { events, lines: runUpdate(state, sql, events) };
  if (/^DELETE\b/i.test(sql)) return { events, lines: runDelete(state, sql, events) };
  if (/^EXPLAIN\b/i.test(sql)) {
    return { events: ["sql:explain"], lines: explain(sql) };
  }
  if (upper === "BEGIN") {
    state.snapshot = JSON.parse(JSON.stringify({ users: state.users, hearts: state.hearts, progress: state.progress, next: state.next }));
    return { events: ["sql:transaction"], lines: [L.info("BEGIN — transaksi dimulai. Perubahan belum permanen.")] };
  }
  if (upper === "COMMIT") {
    state.snapshot = null;
    return { events: ["sql:transaction"], lines: [L.success("COMMIT — semua perubahan disimpan permanen.")] };
  }
  if (upper === "ROLLBACK") {
    if (!state.snapshot) {
      return { events: ["sql:transaction"], lines: [L.warn("Tidak ada transaksi aktif untuk di-rollback.")] };
    }
    state.users = state.snapshot.users;
    state.hearts = state.snapshot.hearts;
    state.progress = state.snapshot.progress;
    state.next = state.snapshot.next;
    state.snapshot = null;
    return { events: ["sql:transaction"], lines: [L.success("ROLLBACK — semua perubahan dibatalkan.")] };
  }

  return {
    events: [],
    lines: [
      L.error("Query tidak dikenali."),
      L.muted("Ketik help untuk melihat contoh query yang didukung."),
    ],
  };
}
