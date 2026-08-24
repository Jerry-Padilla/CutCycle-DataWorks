# Contributing to FactoryOS

Thank you for considering a contribution. FactoryOS welcomes focused bug fixes, accessibility improvements, performance work, tests, documentation, and well-scoped manufacturing scenarios.

## Before opening a change

1. Search existing issues and pull requests.
2. Open an issue before starting a large feature or architecture change.
3. Never include confidential employer information, proprietary machine data, production records, credentials, or third-party assets without clear redistribution rights.

## Development

Use Node.js 22 and install the locked dependencies:

```bash
npm ci
npm run dev
```

Before submitting a pull request, run:

```bash
npm run lint
npm test
npm run build
```

## Pull requests

- Keep changes focused and explain the manufacturing or user problem being solved.
- Add tests for simulation, KPI, fault, or state-management changes.
- Include before/after screenshots for visible UI changes when practical.
- Preserve mobile usability, keyboard access, WebGL fallback behavior, and client-only simulation constraints.
- Update documentation and legal notices when dependencies, data handling, assets, or deployment behavior change.

## Contribution license

By submitting a contribution, you agree that your contribution is your original work or that you have the right to submit it, and that it will be licensed under the project’s [MIT License](LICENSE). No contributor license agreement is currently required.

All contributors must follow the [Code of Conduct](CODE_OF_CONDUCT.md).
