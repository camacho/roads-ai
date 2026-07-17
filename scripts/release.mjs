import { execSync } from 'node:child_process';

const commands = ['pnpm build', 'pnpm lint', 'pnpm typecheck', 'pnpm test'];

for (const command of commands) {
  execSync(command, {
    stdio: 'inherit',
  });
}
