import { execFile } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { promisify } from 'node:util';
import { describe, expect, it } from 'vitest';
import run from './index.ts';

const execFileAsync = promisify(execFile);

describe('@roads-ai/harness', () => {
  it('exports an async run stub', async () => {
    await expect(run()).resolves.toBe('run harness');
  });

  it('runs automatically when called as a script', async () => {
    const scriptPath = fileURLToPath(new URL('./index.ts', import.meta.url));

    const { stdout } = await execFileAsync('node', [
      '--experimental-strip-types',
      scriptPath,
    ]);

    expect(stdout).toBe('run harness\n');
  });
});
