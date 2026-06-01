# AGENTS.md — Poker Draw Bot

## Purpose

Build a lightweight WhatsApp draw bot for a private poker group.

The bot listens for a `!sortear` message in one authorized WhatsApp group, parses participants and prize-slot categories, performs a reproducible random draw with unique winners, and replies in the same group.

This project starts as a local proof of concept using the developer's own WhatsApp account. WhatsApp integration uses Baileys as an experimental adapter only. Keep domain and application logic independent from Baileys so the adapter can be replaced later.

## Language Policy

Use English for all development-facing artifacts:

- source code;
- identifiers, types, class/function names and file names;
- tests and test descriptions;
- code comments;
- commits, technical documentation and task reports;
- configuration and architecture documentation.

Use Brazilian Portuguese for all end-user input/output:

- supported chat commands, beginning with `!sortear`;
- parsing examples that represent real WhatsApp messages;
- bot success responses;
- validation and error responses shown in WhatsApp;
- category and participant names supplied by users.

Do not translate user-provided participant names or category names. Normalize only as required by business rules.

## Working Agreement

Work as a senior TypeScript backend engineer.

Optimize for:

- correctness and trust in draw results;
- small, reviewable increments;
- simple local execution;
- strict domain isolation;
- deterministic tests;
- minimal infrastructure.

Do not build SaaS features, dashboards, authentication, billing, multi-tenancy, or deployment infrastructure unless explicitly requested.

## Required Stack

Use:

- Node.js LTS;
- TypeScript with strict mode;
- Vitest for tests and coverage;
- ESLint and Prettier;
- Baileys only in the infrastructure adapter;
- local JSON persistence for the MVP, unless explicitly changed.

Prefer npm unless the repository already uses another package manager.

## Architecture Boundary

Use a lightweight hexagonal architecture. Domain code must be pure and must not import Baileys, filesystem APIs, environment variables, timers, logging, HTTP frameworks, or database libraries.

Recommended structure:

```text
src/
  domain/
    draw/
      draw.ts
      draw-errors.ts
      seeded-random.ts
      types.ts
  application/
    execute-draw.ts
    ports/
      draw-history-repository.ts
      message-gateway.ts
      seed-provider.ts
  presentation/
    parse-draw-command.ts
    format-draw-result.ts
    handle-incoming-message.ts
  infrastructure/
    whatsapp/
      baileys-message-gateway.ts
    persistence/
      json-draw-history-repository.ts
    runtime/
      main.ts
tests/
  unit/
  integration/
```

This structure is guidance, not a reason to over-engineer. Keep it as small as the current feature requires.

## Strict TDD Policy

Every behavior change must follow this cycle:

### RED

1. Restate the behavior being introduced.
2. Add or modify the smallest tests that specify that behavior.
3. Run the relevant test command.
4. Confirm tests fail for the expected missing behavior, not because of setup mistakes.

### GREEN

1. Implement only the minimum production code required to satisfy the failing tests.
2. Run the relevant tests again.
3. Confirm tests pass.

### REFACTOR

1. Improve naming, duplication, interfaces, or file organization only when it improves present clarity.
2. Run all relevant tests after refactoring.
3. Keep behavior unchanged.

For autonomous tasks, execute the complete RED → GREEN → REFACTOR cycle without waiting for confirmation. In the final report, show commands run and summarize the observed RED and GREEN results.

Only stop after RED when the user explicitly requests failing tests only.

## Testing Rules

- Every domain rule must have unit tests.
- Every bug fix must begin with a failing regression test.
- Write test descriptions in English, even when asserting Portuguese user-facing messages.
- Test deterministic behavior; never assert on uncontrolled randomness.
- Inject a seed or deterministic seeded RNG instead of depending on uncontrolled random generation.
- Do not mock pure domain code.
- Test WhatsApp-facing behavior through a port or fake gateway; never connect to a real WhatsApp account in automated tests.
- Tests must not require network access or a running WhatsApp session.
- Do not weaken or delete tests merely to make a change pass.
- Target 90% coverage for domain and application layers after the MVP is complete.
- Never use flaky time-dependent assertions.

## Code Quality Rules

- Enable TypeScript `strict`.
- Do not use `any`; prefer `unknown` with boundary validation.
- Prefer pure functions and immutable inputs/outputs.
- Prefer explicit result/error types or domain errors over silent failures.
- Avoid global mutable state.
- Avoid premature abstractions, decorators, dependency injection containers, and framework-heavy patterns.
- Keep secrets and WhatsApp authentication state out of Git.

## Security and Local Authentication Rules

Baileys authenticates as a linked WhatsApp device. During local validation:

- never commit authentication/session files;
- keep session material inside `.auth/` or another gitignored directory;
- never print credentials or full authentication content;
- only process authorized group IDs configured locally;
- ignore private messages and unauthorized groups by default;
- do not resend, spam, or loop on messages emitted by the bot itself.

## Commands to Maintain

Once the project is bootstrapped, maintain these scripts:

```bash
npm run test
npm run test:watch
npm run test:coverage
npm run lint
npm run format:check
npm run typecheck
npm run dev
```

Before marking an implementation task complete, run at least:

```bash
npm run test
npm run typecheck
npm run lint
```

If a script does not yet exist during bootstrap, create it before relying on it.

## MVP Scope

Build only the following capability chain:

1. Bootstrap project/tooling.
2. Parse a `!sortear` command.
3. Validate participants and prize categories.
4. Execute a deterministic seeded draw.
5. Format a Portuguese WhatsApp reply.
6. Orchestrate the flow in an application use case.
7. Persist completed draws locally for audit/history.
8. Integrate a Baileys adapter for authorized-group local testing.

Do not add extra chat commands until the MVP draw flow is tested end-to-end locally.

## Feature Sequence and Acceptance Gates

### Feature 0 — Project Bootstrap

Deliver TypeScript, Vitest, linting, formatting, scripts, `.gitignore`, and the minimum folder structure.

No business behavior is implemented here. Confirm a sample test can run, then remove it or replace it when Feature 1 begins.

### Feature 1 — Command Parser

Create `parseDrawCommand(text)`.

It must:

- only accept messages whose first meaningful line is `!sortear`;
- read participants from the section beginning with `Lista`;
- accept participants as `João`, `1 - João`, `2- Pedro`, `3. Ana`, or similar numbered lines;
- read categories as `<nome>: <quantidade>`;
- normalize surrounding whitespace;
- ignore empty lines;
- preserve display casing and accents;
- reject missing command, missing participant list, or missing prize categories;
- never parse category lines as participants.

### Feature 2 — Validation

Validate:

- participant name cannot be empty;
- participants must be unique after trimming and case-insensitive comparison;
- prize category name cannot be empty;
- quantity must be a positive integer;
- prize categories must be unique after trimming and case-insensitive comparison;
- total slot count must not exceed participant count.

Domain errors may use English identifiers/types. Presentation code must convert validation failures into friendly Portuguese messages.

### Feature 3 — Seeded Draw Engine

Create a deterministic draw engine.

It must:

- select exactly the total required number of winners;
- never select the same participant twice;
- assign selected winners across categories according to each quantity;
- produce the same allocation for identical normalized inputs and identical seed;
- not use `Math.random()` directly inside tested domain logic.

Prefer a small seeded pseudo-random generator owned by the domain or passed through a narrow interface.

### Feature 4 — Result Formatter

Create a Brazilian Portuguese WhatsApp reply containing:

- a title such as `🎲 Sorteio realizado`;
- each user-provided category with its winners;
- the reproducible seed;
- optionally a draw identifier once persistence exists.

No WhatsApp API calls belong in the formatter.

### Feature 5 — Execute Draw Use Case

Orchestrate:

```text
raw message → parser → validation/draw → formatter → persisted completed draw
```

It must return a user-facing Portuguese success or validation response without knowing anything about Baileys.

### Feature 6 — WhatsApp Adapter

Create a thin Baileys-based adapter only after all preceding use cases are tested.

It must:

- receive incoming messages;
- ignore messages sent by the bot itself;
- ignore chats not in the authorized group allowlist;
- route only `!sortear` messages to the application service;
- send the returned application response back to the originating authorized group;
- keep auth files local and ignored by Git.

Use fakes at the port boundary for tests. Real QR authentication is a manual local verification step, not an automated test.

## User-Facing Command Contract (Portuguese)

Supported input example:

```text
!sortear

Lista
1 - Jogador A
2 - Jogador B
3 - Jogador C
4 - Jogador D
5 - Jogador E
6 - Jogador F

Sierra: 3
Automóvel: 3
```

Initial output template:

```text
🎲 Sorteio realizado

🏆 Sierra
• Jogador B
• Jogador F
• Jogador C

🏆 Automóvel
• Jogador D
• Jogador A
• Jogador E

Seed: 1748801234
```

Initial validation-error template:

```text
❌ Não foi possível realizar o sorteio: há 3 vagas para apenas 2 participantes.
```

## Completion Reporting

At the end of each Codex task, report in English:

- behavior added or changed;
- files changed;
- RED command and expected failure observed;
- GREEN/refactor validation commands and outcomes;
- any manual action still required, especially WhatsApp QR authentication;
- next smallest recommended feature.

Never claim tests passed unless you actually ran them and saw the result.
