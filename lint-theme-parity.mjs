#!/usr/bin/env node
// Theme-parity gate (merlin-theme-token skill §2: "Every semantic/component
// token exists in EVERY registered theme file in the same change — no
// theme drifts"). Closes the class of bug behind the default-theme
// motion-binding gap (2026-07-10): an omission that predated this rule and
// went unnoticed because nothing enforced it mechanically.
//
// Astryx bridge-back overrides (--color-*, direction B — see
// astryx-bridge.md) are intentionally asymmetric: theme.default.css is a
// pure pass-through and never defines them, ops-dark/glass do. Only
// Meridian's own semantic namespace is checked for full 3-file parity.
import { readFileSync } from 'node:fs';

const FILES = [
  'app/src/theme/theme.default.css',
  'app/src/theme/theme.ops-dark.css',
  'app/src/theme/theme.glass.css',
  'app/src/theme/theme.glass-light.css',
];

function customPropertyNames(path) {
  const content = readFileSync(path, 'utf-8');
  const matches = content.matchAll(/(--[\w-]+)\s*:/g);
  return new Set(Array.from(matches, (match) => match[1]));
}

const isBridgeOverride = (prop) => prop.startsWith('--color-');

// Deliberate, ratified exceptions — asymmetry here is a decision on record,
// not an omission. Only the exact documented files may skip the token;
// missing from anywhere else still fails loud. Add an entry only alongside
// a STATE.md ruling citing why.
const EXCEPTIONS = {
  '--surface-opacity': {
    allowedMissingFrom: ['app/src/theme/theme.glass.css'],
    reason:
      'tokens-spec.md\'s glass ◆ section gives no value; "missing value → don\'t invent" — resolves via the :root fallback in theme.default.css (STATE.md, Phase 1 "token architecture, glass theme" session log entry).',
  },
};

const byFile = FILES.map((file) => ({ file, props: customPropertyNames(file) }));
const allProps = new Set(byFile.flatMap(({ props }) => [...props]));
const checked = [...allProps].filter((prop) => !isBridgeOverride(prop));

let mismatches = 0;
for (const prop of checked) {
  const missingFrom = byFile.filter(({ props }) => !props.has(prop)).map(({ file }) => file);
  if (missingFrom.length === 0) continue;

  const exception = EXCEPTIONS[prop];
  const unexplainedMisses = exception
    ? missingFrom.filter((file) => !exception.allowedMissingFrom.includes(file))
    : missingFrom;

  if (unexplainedMisses.length > 0) {
    mismatches += 1;
    console.error(`✗ "${prop}" missing from: ${unexplainedMisses.join(', ')}`);
  }
}

if (mismatches > 0) {
  console.error(`\nTheme parity failed — ${mismatches} token(s) not defined in every registered theme file.`);
  process.exit(1);
}

console.log(`Theme parity OK — ${checked.length} semantic/primitive tokens consistent across ${FILES.length} theme files.`);
