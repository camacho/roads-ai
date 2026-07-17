import type {
  CompletionRequest,
  CompletionResponse,
  LocalModelClient,
  LocalModelConfig,
} from './types.ts';

export type {
  CompletionRequest,
  CompletionResponse,
  LocalModelClient,
  LocalModelConfig,
} from './types.ts';

const defaultTimeoutMs = 15_000;

export function createLocalModelConfig(
  overrides: Partial<LocalModelConfig> & Pick<LocalModelConfig, 'model'>,
): LocalModelConfig {
  return {
    model: overrides.model,
    endpoint: overrides.endpoint ?? 'http://127.0.0.1:11434',
    transport: 'http',
    requestTimeoutMs: overrides.requestTimeoutMs ?? defaultTimeoutMs,
  };
}

export function createStubLocalModelClient(
  config: LocalModelConfig,
  responder: (
    request: CompletionRequest,
  ) => CompletionResponse | Promise<CompletionResponse>,
): LocalModelClient {
  return {
    config,
    complete(request) {
      return Promise.resolve(responder(request));
    },
  };
}
