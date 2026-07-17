import type { CompletionRequest } from '@roads-ai/model';
import { describe, expect, it } from 'vitest';
import {
  createLocalModelConfig,
  createStubLocalModelClient,
} from '@roads-ai/model';
import {
  assertLocalOnlyModel,
  buildPromptEnvelope,
  createTeachingHarness,
} from './index.ts';

describe('@roads-ai/harness', () => {
  it('bakes non-solution policy into the system prompt', () => {
    const envelope = buildPromptEnvelope(
      {
        task: 'Write a function that reverses a linked list.',
        language: 'TypeScript',
      },
      {
        allowedMoves: ['show a smaller example'],
        forbiddenMoves: ['provide the final answer'],
        requiresExamples: true,
        requiresExplanations: true,
      },
    );

    expect(envelope.system).toContain('Never provide the final answer');
    expect(envelope.system).toContain('show a smaller example');
  });

  it('routes prompt envelopes through the local model client', async () => {
    const model = createStubLocalModelClient(
      createLocalModelConfig({ model: 'qwen2.5-coder' }),
      ({ system, user }: CompletionRequest) => ({
        content: `${system}\n---\n${user}`,
        rawModelId: 'qwen2.5-coder',
      }),
    );

    const harness = createTeachingHarness({ model });
    const draft = await harness.draft({
      task: 'Explain recursion using factorial as an example.',
    });

    expect(draft).toContain('programming tutor');
    expect(draft).toContain('Explain recursion');
  });

  it('rejects non-loopback endpoints', () => {
    const model = createStubLocalModelClient(
      createLocalModelConfig({
        model: 'qwen2.5-coder',
        endpoint: 'http://192.168.1.10:11434',
      }),
      () => ({
        content: 'Use an analogy instead of a solution.',
        rawModelId: 'qwen2.5-coder',
      }),
    );

    expect(() => assertLocalOnlyModel(model)).toThrow(/loopback-only/);
  });
});
