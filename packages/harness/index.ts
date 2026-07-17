#!/usr/bin/env -S node --experimental-strip-types

const message = 'run harness';

export default async function run(): Promise<string> {
  return message;
}

if (import.meta.main) {
  const output = await run();
  process.stdout.write(`${output}\n`);
}
