#!/usr/bin/env -S node --experimental-strip-types

import { fileURLToPath } from 'node:url';

const message = 'run harness';

export default async function run(): Promise<string> {
  return message;
}

function isEntrypoint(): boolean {
  return process.argv[1] === fileURLToPath(import.meta.url);
}

if (isEntrypoint()) {
  const output = await run();
  process.stdout.write(`${output}\n`);
}
