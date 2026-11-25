// ===========================================================================
// Pigeon Pitch, One Line
// make.fun bounty: u-donrulezz-pigeon-pitch-one-line-af06c6cf
// ===========================================================================
//
// The scene: a city pigeon rides the elevator up to the top floor, turns to
// the investors, and pitches the only startup a pigeon could ever found —
// StatueBnB, subletting the general's statue. Prime downtown real estate,
// sun-warmed bronze, panoramic views, and a landlord who has never once
// complained about anything, because he is a statue. The ask is crumbs.
//
// This program does one job: it checks the pitch against every rule in the
// bounty gate and writes it, exactly as-is, to the output file.
//
//   Gate: UTF-8 text, 1 to 200 characters, not only whitespace, one line,
//   no leading or trailing whitespace, no trailing newline in the file.
//
// Run it:
//   node main.ts
//   OUTPUT_PATH=/tmp/entry.txt node main.ts

import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";

// ---------------------------------------------------------------------------
// The pitch
// ---------------------------------------------------------------------------

const PITCH =
  "Meet StatueBnB: I sublet the general\u2019s head \u2014 sun-warmed bronze, 360\u00b0 views, and a landlord who has never once complained. Our ask: one bag of breadcrumbs.";

// ---------------------------------------------------------------------------
// Gate
// ---------------------------------------------------------------------------

const MIN_CHARS = 1;
const MAX_CHARS = 200;

const LINE_BREAK = /[\r\n]/;
const CONTROL_CHAR = /[\u0000-\u0008\u000b\u000c\u000e-\u001f\u007f]/;

// Every rule the sealed scorer applies, checked here first so a bad line
// can never be written out.
const RULES: Array<{ name: string; test: (line: string) => string | null }> = [
  {
    name: "length",
    test: (line) =>
      line.length >= MIN_CHARS && line.length <= MAX_CHARS
        ? null
        : `must be ${MIN_CHARS}-${MAX_CHARS} characters, got ${line.length}`,
  },
  {
    name: "non-blank",
    test: (line) => (line.trim().length > 0 ? null : "must not be only whitespace"),
  },
  {
    name: "no-surrounding-whitespace",
    test: (line) =>
      line === line.trim() ? null : "must not start or end with whitespace",
  },
  {
    name: "one-line",
    test: (line) => (LINE_BREAK.test(line) ? "must not contain a line break" : null),
  },
  {
    name: "no-control-characters",
    test: (line) =>
      CONTROL_CHAR.test(line) ? "must not contain control characters" : null,
  },
];

function gateProblems(line: string): string[] {
  const problems: string[] = [];
  for (const rule of RULES) {
    const problem = rule.test(line);
    if (problem !== null) {
      problems.push(`${rule.name}: ${problem}`);
    }
  }
  return problems;
}

// ---------------------------------------------------------------------------
// Entry point
// ---------------------------------------------------------------------------

function resolveOutputPath(): string {
  const envPath = (process.env.OUTPUT_PATH ?? "").trim();
  return resolve(envPath === "" ? "/output/entry.txt" : envPath);
}

function run(): void {
  const problems = gateProblems(PITCH);
  if (problems.length > 0) {
    throw new Error(`pitch rejected by the gate — ${problems.join("; ")}`);
  }

  const target = resolveOutputPath();
  mkdirSync(dirname(target), { recursive: true });

  // Write the line and nothing else: no trailing newline, so the file's
  // bytes are exactly the pitch the judge reads.
  writeFileSync(target, PITCH, { encoding: "utf8" });
}

run();
