/**
 * Demo terminal untuk tombol "Tuan Putri, Tonton ini ya sayangg!!".
 *
 * Isinya bukan narasi panjang, tetapi perintah yang benar-benar bisa diketik
 * di lab + response yang keluar dari mesin lab yang sama. Jadi animasinya
 * terasa seperti menonton terminal sungguhan.
 */

import { createLabState, runLabCommand } from "@/lib/labEngine";
import { explainCommand } from "@/lib/commandExplainer";
import { getLab } from "@/data/labData";

const MAX_STEPS = 3;
const MAX_BLOCKS = 18;
const MAX_BLOCK_CHARS = 1600;

const LEVEL_LAB = {
  1: "http",
  2: "rest",
  3: "db",
  4: "auth",
  5: "ops",
};

function clipBlock(text) {
  const value = String(text ?? "").replace(/\r/g, "");
  return value.length > MAX_BLOCK_CHARS ? `${value.slice(0, MAX_BLOCK_CHARS)}…` : value;
}

function httpToBlocks(line) {
  const status = Number(line.status) || 0;
  const tone = status >= 500 ? "error" : status >= 400 ? "warn" : status >= 300 ? "info" : "success";
  const blocks = [
    {
      kind: tone,
      text: `HTTP/1.1 ${line.status ?? ""} ${line.statusText || ""}`.replace(/\s+$/, ""),
    },
  ];

  (line.headers || []).forEach(([key, value]) => {
    blocks.push({ kind: "muted", text: `${key}: ${value}` });
  });

  if (line.ms !== undefined && line.ms !== null) {
    blocks.push({ kind: "muted", text: `${line.ms} ms` });
  }

  if (line.body !== null && line.body !== undefined) {
    const body = typeof line.body === "string" ? line.body : JSON.stringify(line.body, null, 2);
    if (body) {
      blocks.push({ kind: "blank", text: "" });
      blocks.push({ kind: "code", text: clipBlock(body) });
    }
  }

  return blocks;
}

function normalizeLines(result) {
  let blocks = [];

  for (const line of result?.lines || []) {
    if (!line) continue;

    if (line.kind === "http") {
      blocks.push(...httpToBlocks(line));
      continue;
    }

    const text = String(line.text ?? "").replace(/\r/g, "");
    if (!text.trim()) {
      if (blocks.length && blocks[blocks.length - 1].kind !== "blank") {
        blocks.push({ kind: "blank", text: "" });
      }
      continue;
    }

    if (line.kind === "code" || line.kind === "table") {
      blocks.push({ kind: line.kind, text: clipBlock(text) });
      continue;
    }

    text.split("\n").forEach((part) => {
      if (!part.trim()) {
        if (blocks.length && blocks[blocks.length - 1].kind !== "blank") {
          blocks.push({ kind: "blank", text: "" });
        }
        return;
      }
      blocks.push({ kind: line.kind || "text", text: part });
    });
  }

  while (blocks.length && blocks[blocks.length - 1].kind === "blank") blocks.pop();

  if (blocks.length > MAX_BLOCKS) {
    blocks = blocks.slice(0, MAX_BLOCKS);
    blocks.push({ kind: "muted", text: "… output dipotong supaya tetap ringkas" });
  }

  return blocks;
}

async function runCommands(engine, commands, { maxSteps = MAX_STEPS, onlyWithOutput = false } = {}) {
  const state = createLabState(engine);
  const steps = [];
  const seen = new Set();

  for (const raw of commands) {
    const command = String(raw || "").trim();
    if (!command || seen.has(command)) continue;
    seen.add(command);

    let result;
    try {
      result = await runLabCommand(engine, command, state);
    } catch (error) {
      result = {
        lines: [{ kind: "error", text: `Terminal error: ${error?.message || "tidak diketahui"}` }],
      };
    }

    let blocks = normalizeLines(result);
    if (!blocks.length) {
      if (onlyWithOutput) continue;
      blocks = [{ kind: "muted", text: "(tidak ada output)" }];
    }

    steps.push({
      command,
      blocks,
      explain: explainCommand(engine, command, result),
    });
    if (steps.length >= maxSteps) break;
  }

  return steps;
}

function practiceCommands(topic) {
  const commands = [];
  (topic?.sections || []).forEach((section) => {
    (section.practice?.commands || []).forEach((item) => {
      if (item?.command) commands.push(item.command);
    });
  });
  return commands;
}

/** Demo untuk satu modul: ambil perintah kurasi lab, lalu perintah latihan. */
export async function buildTopicDemo(topic, maxSteps = MAX_STEPS) {
  if (!topic) return [];
  const lab = getLab(topic.id);
  const engine = lab?.engine || "http";
  const commands = [
    ...(lab?.quickCommands || []).map((item) => item.command),
    ...practiceCommands(topic),
  ];
  return runCommands(engine, commands, { maxSteps, onlyWithOutput: true });
}

/** Demo untuk satu materi: pakai perintah latihan materi tersebut. */
export async function buildSectionDemo(topic, section) {
  if (!topic) return [];
  if (!section) return buildTopicDemo(topic);

  const engine = getLab(topic.id)?.engine || "http";
  const commands = (section.practice?.commands || [])
    .map((item) => item.command)
    .filter(Boolean);

  if (!commands.length) return buildTopicDemo(topic, 2);
  return runCommands(engine, commands, { maxSteps: MAX_STEPS });
}

/** Demo singkat untuk cheatsheet kuis, memakai lab yang sesuai level. */
export async function buildCheatsheetDemo(level) {
  const lab = getLab(LEVEL_LAB[level?.id] || "http");
  const engine = lab?.engine || "http";
  const commands = (lab?.quickCommands || []).map((item) => item.command);
  return runCommands(engine, commands, { maxSteps: 2, onlyWithOutput: true });
}
