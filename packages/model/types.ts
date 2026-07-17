export type LocalTransport = 'http';

export interface LocalModelConfig {
  model: string;
  endpoint: `http://${string}`;
  transport: LocalTransport;
  requestTimeoutMs: number;
}

export interface CompletionRequest {
  system: string;
  user: string;
  temperature?: number;
}

export interface CompletionResponse {
  content: string;
  rawModelId: string;
}

export interface LocalModelClient {
  complete(request: CompletionRequest): Promise<CompletionResponse>;
  config: LocalModelConfig;
}
