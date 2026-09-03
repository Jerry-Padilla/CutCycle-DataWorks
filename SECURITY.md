# Security Policy

## Supported versions

CutCycle DataWorks is a portfolio and demonstration project. Security fixes are applied to the latest version on the default branch.

| Version | Supported |
| --- | --- |
| Latest `main` | Yes |
| Older commits or forks | No |

## Reporting a vulnerability

Please do not disclose a suspected vulnerability in a public issue.

Use the repository’s **Security → Report a vulnerability** workflow to send a private report. Include:

- A clear description of the issue and its impact
- Reproduction steps or a minimal proof of concept
- Affected browser, version, or dependency
- Any suggested mitigation

You should receive an acknowledgement within seven days. Confirmed issues will be assessed, fixed when practical, and disclosed through a GitHub Security Advisory with appropriate credit unless anonymity is requested.

## Scope

Useful reports include cross-site scripting, unsafe dependency behavior, unintended data transmission, deployment misconfiguration, or a security boundary that contradicts the documentation.

Synthetic simulation behavior, unrealistic machine values, or the absence of industrial safety certification are not security vulnerabilities. CutCycle DataWorks must never be used as a real industrial control or safety system; see [NOTICE.md](NOTICE.md).
