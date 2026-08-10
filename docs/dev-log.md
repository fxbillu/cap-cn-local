# Development Log

## 2026-08-10 — Public repository disclosure guardrails

- Background: prepare the Chinese desktop fork for public visibility so its GitHub Actions workflow can use the public Windows runner allocation.
- Scope: documentation only; no application code, credentials, build settings, or licensing files changed.
- Changes: added prominent English and Chinese notices that this is an unofficial Simplified Chinese build, clarified trademark ownership, and preserved AGPLv3, MIT, and third-party license obligations.
- Validation: reviewed the five-commit history for common secret fingerprints and checked that tracked environment files contain placeholders rather than live credentials.
- Risk: public disclosure is irreversible for anyone who clones the repository; build artifacts remain unsigned and must not be presented as official Cap releases.
