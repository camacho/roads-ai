import type { LocalModelClient } from '@roads-ai/model';

export interface TeachingPolicy {
  allowedMoves: string[];
  forbiddenMoves: string[];
  requiresExamples: boolean;
  requiresExplanations: boolean;
}

export interface LearnerTurn {
  task: string;
  learnerAttempt?: string;
  language?: string;
}

export interface AgentPromptEnvelope {
  system: string;
  user: string;
}

export interface TeachingHarness {
  policy: TeachingPolicy;
  draft(turn: LearnerTurn): Promise<string>;
}

export interface TeachingHarnessOptions {
  model: LocalModelClient;
  policy?: Partial<TeachingPolicy>;
}
