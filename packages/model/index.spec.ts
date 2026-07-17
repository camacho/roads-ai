import { describe, expect, it } from 'vitest';
import { createLocalModelConfig, createStubLocalModelClient } from './index.ts';

describe('@roads-ai/model', () => {
  it('defaults to a loopback endpoint for local hosting', () => {
    expect(createLocalModelConfig({ model: 'llama3.1' })).toMatchObject({
      endpoint: 'http://127.0.0.1:11434',
      model: 'llama3.1',
      transport: 'http',
    });
  });

  it('allows deterministic stubbing for harness tests', async () => {
    const client = createStubLocalModelClient(
      createLocalModelConfig({ model: 'llama3.1' }),
      () => ({
        content: 'Ask the learner to trace the loop on paper.',
        rawModelId: 'llama3.1',
      }),
    );

    await expect(
      client.complete({
        system: 'teach, do not solve',
        user: 'write a for loop',
      }),
    ).resolves.toMatchObject({
      rawModelId: 'llama3.1',
    });
  });
});
