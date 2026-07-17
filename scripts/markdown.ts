#!/usr/bin/env -S node --experimental-strip-types

import { readFileSync, writeFileSync } from 'node:fs';
import { basename, relative, resolve } from 'node:path';

import { markdownMagic } from 'markdown-magic';
import ENGINES from 'markdown-magic-engines';
import PRETTIER from 'markdown-magic-prettier';
import SCRIPTS from 'markdown-magic-package-scripts';
import SUBPACKAGELIST from 'markdown-magic-subpackage-list';
import prettier from 'prettier';

const root = resolve(import.meta.dirname, '..');
const markdownGlobs = ['README.md', 'docs/**/*.md'];

type MarkdownResult = {
  outputPath?: string;
};

const config = {
  matchWord: 'AUTO-GENERATED-CONTENT',
  cwd: root,
  transforms: {
    ENGINES,
    PRETTIER,
    SCRIPTS,
    SUBPACKAGELIST,
  },
};

function getOutputPaths(results: MarkdownResult[]): string[] {
  return results
    .map((result) => result.outputPath)
    .filter((path): path is string => typeof path === 'string')
    .sort();
}

async function formatMarkdown(contents: string, file: string): Promise<string> {
  const options = (await prettier.resolveConfig(file)) ?? {};
  return prettier.format(contents, {
    ...options,
    filepath: file,
  });
}

async function formatGeneratedFiles(files: string[]): Promise<void> {
  for (const file of files) {
    const contents = readFileSync(file, 'utf8');
    const formatted = await formatMarkdown(contents, file);

    if (formatted !== contents) {
      writeFileSync(file, formatted, 'utf8');
    }
  }
}

export async function run(argv: string[] = process.argv.slice(2)) {
  const isCheck = argv.includes('--check');
  const dryRun = await markdownMagic(markdownGlobs, {
    ...config,
    dry: true,
    silent: true,
  });
  const files = getOutputPaths(dryRun.results as MarkdownResult[]);
  const originalContents = new Map(
    files.map((file) => [file, readFileSync(file, 'utf8')]),
  );

  const generated = await markdownMagic(markdownGlobs, {
    ...config,
    silent: true,
  });
  const generatedFiles = getOutputPaths(generated.results as MarkdownResult[]);
  await formatGeneratedFiles(generatedFiles);

  if (!isCheck) {
    return;
  }

  const staleFiles: string[] = [];

  for (const file of generatedFiles) {
    const original = originalContents.get(file) ?? '';
    const current = readFileSync(file, 'utf8');

    if (
      (await formatMarkdown(original, file)) !==
      (await formatMarkdown(current, file))
    ) {
      staleFiles.push(file);
      writeFileSync(file, original, 'utf8');
    }
  }

  if (staleFiles.length > 0) {
    console.error(
      '[docs:check] Generated markdown is out of sync.\n' +
        'Run `pnpm docs` to regenerate, then commit.',
    );
    console.error(
      `[docs:check] Stale files: ${staleFiles
        .map((file) => relative(root, file))
        .join(', ')}`,
    );
    process.exit(1);
  }

  console.log(
    `[docs:check] Generated markdown is in sync for ${generatedFiles
      .map((file) => basename(file))
      .join(', ')}.`,
  );
}

if (import.meta.main) {
  run().catch((error: Error) => {
    console.error('[docs] Error:', error.message);
    process.exit(1);
  });
}
