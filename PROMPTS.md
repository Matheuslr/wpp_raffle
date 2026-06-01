# PROMPTS.md — Initial Codex CLI Task Sequence

Use these prompts in order. `AGENTS.md` instructs Codex to run each complete TDD cycle autonomously and provide test evidence at task completion.

Remember: implementation artifacts and reports must be in English, while user-visible WhatsApp input/output must remain in Brazilian Portuguese.

## Prompt 1 — Repository Bootstrap

```text
Read AGENTS.md and PROJECT.md completely before changing any file.

Execute only Feature 0 — Project Bootstrap.

Set up a Node.js + strict TypeScript project with Vitest, coverage, ESLint and Prettier. Create the minimum required folder structure, the npm scripts defined in AGENTS.md, and a .gitignore that excludes node_modules, coverage, dist, .env, logs, local history/storage and WhatsApp/Baileys authentication directories.

Use English for all engineering artifacts. Do not implement any business behavior, parser, draw engine or WhatsApp integration in this task.

Run applicable checks and report:
- files created;
- commands executed;
- check results;
- the next smallest recommended step.
```

## Prompt 2 — Command Parser

```text
Read AGENTS.md and PROJECT.md.

Implement only Feature 1 — Command Parser using RED → GREEN → REFACTOR.

Before creating production code, write tests for the valid and invalid cases in the specification, run them and confirm they fail because the parser behavior does not exist. Then implement only the parser code required to pass them.

Write code and test descriptions in English. Treat the Portuguese command/input examples as the external I/O contract and test them exactly as specified.

Do not implement the draw engine, seed generation, Baileys or persistence.

At completion, report the observed RED and GREEN results and run test, typecheck and lint.
```

## Prompt 3 — Domain Validation

```text
Read AGENTS.md and PROJECT.md.

Implement only Feature 2 — Validation using RED → GREEN → REFACTOR.

Write English test descriptions that cover:
- blank participant;
- duplicate participant with casing/spacing variation;
- blank category;
- non-positive or non-integer quantity;
- duplicate category;
- total slots greater than participants;
- valid inputs.

Domain errors may be typed/named in English. Any final text intended for WhatsApp users must be Brazilian Portuguese.

Do not implement WhatsApp, persistence or additional commands.
```

## Prompt 4 — Deterministic Draw Engine

```text
Read AGENTS.md and PROJECT.md.

Implement only Feature 3 — Seeded Draw Engine using RED → GREEN → REFACTOR.

Write tests first proving:
- correct winner count;
- no duplicate winner;
- correct category allocation;
- identical output with identical seed and identical input;
- valid output for different seeds;
- no direct Math.random dependency in tested domain logic.

Keep the engine pure. Do not implement formatting or Baileys.
```

## Prompt 5 — Portuguese Response Formatter

```text
Read AGENTS.md and PROJECT.md.

Implement only Feature 4 — Result Formatter using RED → GREEN → REFACTOR.

Write tests in English for Brazilian Portuguese WhatsApp output containing categories, winners and seed. Use the output contract in PROJECT.md.

Do not make WhatsApp API calls. Keep visual/output choices isolated from business logic.
```

## Prompt 6 — Use Case and Local History

```text
Read AGENTS.md and PROJECT.md.

Implement only Feature 5 — Execute Draw Use Case using RED → GREEN → REFACTOR.

Orchestrate parser, validation, draw engine, Portuguese formatter and persistence of completed draws through a repository port. Implement minimal local JSON persistence only after testing the use case with a fake/in-memory repository.

Do not connect to WhatsApp in this task.
```

## Prompt 7 — Baileys Adapter for Local Testing

```text
Read AGENTS.md and PROJECT.md.

Implement only Feature 6 — WhatsApp Adapter.

Before integrating Baileys, create contract/integration tests with a fake gateway proving:
- only authorized groups trigger the use case;
- messages sent by the bot itself are ignored;
- messages without !sortear are ignored;
- the application response is sent to the correct chat.

Then add the minimum Baileys implementation for local execution and manual QR-code authentication.

Ensure auth/session files, .env and local history are gitignored. Do not automatically run a real connection. Document how I should perform the manual test.

Keep all user-facing WhatsApp responses in Brazilian Portuguese.
```

## Prompt 8 — MVP Review

```text
Review the implemented MVP against AGENTS.md and PROJECT.md.

Do not add new features.

Focus the review on:
- violations of the boundary between domain logic and Baileys;
- missing tests for critical rules;
- any possibility of duplicate winners;
- seed determinism;
- accidental versioning or logging of WhatsApp session material;
- local execution scripts;
- compliance with the rule that engineering artifacts are English and user-facing WhatsApp I/O is Brazilian Portuguese.

Fix discovered problems starting with a failing regression test. Run test, coverage, typecheck and lint. Generate a short manual WhatsApp group testing guide in English, quoting the required Portuguese chat input/output examples where necessary.
```
