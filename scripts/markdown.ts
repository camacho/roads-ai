#!/usr/bin/env -S node --experimental-strip-types

import { readdirSync, readFileSync, writeFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { basename, extname, join, resolve } from 'node:path';
import { execFileSync } from 'node:child_process';

import ENGINES from 'markdown-magic-engines';
import INSTALL from 'markdown-magic-install-command';
import PRETTIER from 'markdown-magic-prettier';
import SCRIPTS from 'markdown-magic-package-scripts';

const require = createRequire(import.meta.url);
const { markdownMagic } = require('markdown-magic');

const root = resolve(import.meta.dirname, '..');
const docsDir = join(root, 'docs');
const generatedMarkdownFiles = [
  join(root, 'README.md'),
  ...findMarkdownFiles(docsDir),
];
const formattedMarkdownFiles = [...generatedMarkdownFiles];

function findMarkdownFiles(dir: string): string[] {
  let entries: string[];

  try {
    entries = readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
      const path = join(dir, entry.name);

      if (entry.isDirectory()) {
        return findMarkdownFiles(path);
      }

      return extname(entry.name) === '.md' ? [path] : [];
    });
  } catch {
    return [];
  }

  return entries.sort();
}

async function workspacePackages(): Promise<string> {
  const packageDirs = readdirSync(join(root, 'packages'), {
    withFileTypes: true,
  })
    .filter((entry) => entry.isDirectory())
    .map((entry) => entry.name)
    .sort();

  const rows = packageDirs.map((name) => {
    const manifest = JSON.parse(
      readFileSync(join(root, 'packages', name, 'package.json'), 'utf8'),
    );

    return `- \`${manifest.name}\`: ${manifest.description}`;
  });

  return rows.join('\n');
}

const config = {
  matchWord: 'AUTO-GENERATED-CONTENT',
  transforms: {
    ENGINES,
    INSTALL,
    PRETTIER,
    SCRIPTS,
    WORKSPACE_PACKAGES: workspacePackages,
  },
};

export async function run() {
  const isCheck = process.argv.includes('--check');
  const originalContents = new Map(
    generatedMarkdownFiles.map((file) => [file, readFileSync(file, 'utf8')]),
  );

  for (const file of generatedMarkdownFiles) {
    await markdownMagic(file, {
      ...config,
      dry: false,
      silent: true,
    });
  }

  execFileSync(
    'pnpm',
    ['exec', 'prettier', '--write', ...formattedMarkdownFiles],
    {
      cwd: root,
      stdio: 'inherit',
    },
  );

  if (!isCheck) {
    return;
  }

  const staleFiles = generatedMarkdownFiles.filter(
    (file) => originalContents.get(file) !== readFileSync(file, 'utf8'),
  );

  for (const file of staleFiles) {
    writeFileSync(file, originalContents.get(file) ?? '', 'utf8');
  }

  if (staleFiles.length > 0) {
    console.error(
      '[docs:check] Generated markdown is out of sync.\n' +
        'Run `pnpm run docs` to regenerate, then commit.',
    );
    process.exit(1);
  }

  console.log(
    `[docs:check] Generated markdown is in sync for ${generatedMarkdownFiles
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
