import { describe, expect, it } from 'vitest';

import run from './index.ts';

describe('@roads-ai/harness unit', () => {
  it('exports an async run stub', async () => {
    await expect(run()).resolves.toBe('run harness');
  });
});
