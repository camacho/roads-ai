declare module 'markdown-magic' {
  export function markdownMagic(
    globOrOpts?: string | string[] | Record<string, unknown>,
    options?: Record<string, unknown>,
  ): Promise<{
    errors: unknown[];
    filesChanged: string[];
    results: unknown[];
  }>;
}
