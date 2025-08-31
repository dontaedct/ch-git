**SOS Operation Phase 6 Task 33 - COMPLETED** ✅

Title: Pre-commit hooks + commitlint

Deliverables implemented:

- Husky hooks: updated `pre-commit`, added `commit-msg`.
- Commitlint: `commitlint.config.cjs` with conventional config.
- Lint-staged: configured in `package.json` to run eslint/prettier on staged files.
- NPM prepare: added `prepare` script to ensure Husky installation.

Changes:

- package.json: added `prepare` script; devDependencies for `@commitlint/cli`, `@commitlint/config-conventional`, `lint-staged`, `prettier`; added `lint-staged` config.
- .husky/pre-commit: now runs `npx --no-install lint-staged` before existing checks.
- .husky/commit-msg: runs `npx --no-install commitlint --edit $1` to validate messages.
- commitlint.config.cjs: extends conventional commits and sets line-length guidance.

Notes:

- Run `npm install` to fetch new dev dependencies before committing to avoid hook failures.
- Hooks are network-free (`--no-install`) and rely on local packages.
