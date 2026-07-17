import type { LocalModelClient } from '@roads-ai/model';
import type {
  AgentPromptEnvelope,
  LearnerTurn,
  TeachingHarness,
  TeachingHarnessOptions,
  TeachingPolicy,
} from './types.ts';

export type {
  AgentPromptEnvelope,
  LearnerTurn,
  TeachingHarness,
  TeachingHarnessOptions,
  TeachingPolicy,
} from './types.ts';

const defaultPolicy: TeachingPolicy = {
  allowedMoves: [
    'explain the concept',
    'show a smaller analogous example',
    'ask a guiding question',
    'suggest a debugging step',
  ],
  forbiddenMoves: [
    'provide the final answer',
    'rewrite the learner task end-to-end',
    'invent tool or filesystem output',
  ],
  requiresExamples: true,
  requiresExplanations: true,
};

export function createTeachingPolicy(
  overrides: Partial<TeachingPolicy> = {},
): TeachingPolicy {
  return {
    ...defaultPolicy,
    ...overrides,
  };
}

export function buildPromptEnvelope(
  turn: LearnerTurn,
  policy: TeachingPolicy,
): AgentPromptEnvelope {
  const learnerContext = turn.learnerAttempt
    ? `Learner attempt:\n${turn.learnerAttempt}`
    : 'Learner attempt:\nNone provided yet.';

  return {
    system: [
      'You are a programming tutor, not a task-completion bot.',
      'Never provide the final answer or a copy-paste-ready solution.',
      `Allowed moves: ${policy.allowedMoves.join('; ')}.`,
      `Forbidden moves: ${policy.forbiddenMoves.join('; ')}.`,
      'Prefer explanations, worked examples on adjacent problems, and questions that move the learner forward.',
    ].join(' '),
    user: [
      `Task:\n${turn.task}`,
      learnerContext,
      turn.language ? `Language:\n${turn.language}` : '',
    ]
      .filter(Boolean)
      .join('\n\n'),
  };
}

export function createTeachingHarness({
  model,
  policy: policyOverrides,
}: TeachingHarnessOptions): TeachingHarness {
  const policy = createTeachingPolicy(policyOverrides);

  return {
    policy,
    async draft(turn) {
      const prompt = buildPromptEnvelope(turn, policy);
      const response = await model.complete(prompt);

      return response.content;
    },
  };
}

export function assertLocalOnlyModel(model: LocalModelClient): void {
  if (!model.config.endpoint.startsWith('http://127.0.0.1')) {
    throw new Error(
      'Teaching harness must use a loopback-only model endpoint.',
    );
  }
}
