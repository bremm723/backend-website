import { createHttpState, runHttpCommand } from "./http";
import { createSqlState, runSqlCommand } from "./sql";
import { createNodeState, runNodeCommand } from "./node";
import { createShellState, runShellCommand } from "./shell";

export function createLabState(engine) {
  switch (engine) {
    case "sql":
      return createSqlState();
    case "node":
      return createNodeState();
    case "shell":
      return createShellState();
    default:
      return createHttpState();
  }
}

export async function runLabCommand(engine, raw, state) {
  switch (engine) {
    case "sql":
      return runSqlCommand(raw, state);
    case "node":
      return runNodeCommand(raw, state);
    case "shell":
      return runShellCommand(raw, state);
    default:
      return runHttpCommand(raw, state, {
        auth: engine === "auth" || engine === "capstone",
        test: engine === "quality" || engine === "capstone",
      });
  }
}
