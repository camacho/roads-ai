import { readdir, readFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { markdownMagic } from 'markdown-magic';

const rootDir = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  '..',
);
const readmePath = path.join(rootDir, 'README.md');
const packagesDir = path.join(rootDir, 'packages');

const formatPackageRow = async (name) => {
  const manifestPath = path.join(packagesDir, name, 'package.json');
  const manifest = JSON.parse(await readFile(manifestPath, 'utf8'));

  return `- \`${manifest.name}\`: ${manifest.description}`;
};

const packageNames = (await readdir(packagesDir)).sort();

const transforms = {
  WORKSPACE_PACKAGES: async () => {
    const entries = await Promise.all(packageNames.map(formatPackageRow));

    return entries.join('\n');
  },
};

await markdownMagic(readmePath, {
  matchWord: 'AUTO-GENERATED-CONTENT',
  transforms,
});
