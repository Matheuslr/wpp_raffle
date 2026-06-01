# PROJECT.md — WhatsApp Poker Group Draw Bot

## 1. Context

This project is a private automation tool for a poker group of friends. The group performs approximately one daily draw to distribute slots or benefits among players listed in a WhatsApp message.

The primary goal is to eliminate any need to open a website or additional app: a member sends the command in the group, and the bot replies in the same group with the result.

This is not a commercial product and does not need scale, multi-client support, or high availability.

## 2. MVP Goal

A WhatsApp group message such as:

```text
!sortear

Lista
1 - Jogador A
2 - Jogador B
3 - Jogador C
4 - Jogador D
5 - Jogador E
6 - Jogador F
7 - Jogador G
8 - Jogador H

Sierra: 3
Automóvel: 3
```

must automatically generate a response containing six unique winners: three assigned to `Sierra` and three assigned to `Automóvel`.

## 3. Language Rule

All development artifacts are written in English:

- code, tests, identifiers and comments;
- documentation and agent prompts;
- technical logs and implementation reports.

All user-facing WhatsApp inputs and outputs are in Brazilian Portuguese:

- `!sortear` remains the supported command;
- `Lista` remains the participant-list marker;
- validation errors and result messages must be written in Portuguese;
- participant and category labels are user input and must not be translated.

Portuguese examples in this document exist because they define the external I/O contract, not because the implementation should be written in Portuguese.

## 4. Initial Environment

The initial validation runs locally:

```text
Developer's personal WhatsApp account
        ↓ linked device / QR code
Baileys running locally
        ↓
Authorized test group
```

After validation, the account may be replaced by a secondary number and the process may be hosted on a VPS. That infrastructure change must not alter any business rule.

## 5. Technical Decisions

### Language and tools

- Node.js + TypeScript
- Vitest
- ESLint + Prettier
- Baileys only for WhatsApp communication
- Simple local JSON persistence for the initial audit/history requirement

### Architecture

Separate:

- **Domain:** participants, prize categories, seed, draw execution and uniqueness rules.
- **Application:** the use case coordinating parser, draw, formatting and persistence.
- **Presentation:** message parsing and user-visible Portuguese responses.
- **Infrastructure:** Baileys and local history storage.

WhatsApp integration is replaceable. The draw engine must work and be testable without WhatsApp.

## 6. Business Rules

### 6.1 Participants

- Each player is identified by the name listed in the message.
- Leading and trailing spaces are removed.
- Blank lines are ignored.
- Optional numbering is removed (`1 - João`, `1- João`, `1. João`).
- Duplicate participants are forbidden after trimming and case-insensitive comparison.
- The normalized original display spelling must be preserved in results.

### 6.2 Prize Categories and Slots

- A category is provided as `<categoria>: <quantidade>`.
- Example: `Sierra: 3`.
- A category name cannot be blank.
- Quantity must be a positive integer.
- Duplicate categories are forbidden after normalization.
- Total slot count is the sum of all category quantities.

### 6.3 Draw

- A participant can win at most one slot in one draw.
- Total slot count cannot exceed total participant count.
- The draw selects winners and distributes them across the requested categories.
- Every completed draw has a seed.
- With the same normalized participants, normalized categories and seed, the result must be exactly reproducible.
- History stores normalized input, seed and output.

### 6.4 Messaging and Authorization

- Only messages whose first meaningful line is `!sortear` trigger the flow.
- Initially, the bot operates only on group IDs explicitly authorized in local configuration.
- Private messages and messages sent by the bot itself are ignored.
- Validation errors are returned in Brazilian Portuguese without stack traces.

## 7. I/O Contract Examples (Portuguese)

### Valid input

```text
!sortear

Lista
João
2 - Pedro
3- Ana
Bruno

Sierra: 2
Automóvel: 2
```

### Invalid input: slots exceed players

```text
!sortear

Lista
João
Pedro

Sierra: 2
Automóvel: 1
```

Expected user-facing meaning:

```text
❌ Não foi possível realizar o sorteio: há 3 vagas para apenas 2 participantes.
```

### Invalid input: duplicate participant

```text
!sortear

Lista
João
joão
Pedro

Sierra: 1
```

Expected user-facing meaning:

```text
❌ Não foi possível realizar o sorteio: o participante "joão" aparece mais de uma vez.
```

## 8. Initial Result Format (Portuguese)

```text
🎲 Sorteio realizado

🏆 Sierra
• Jogador B
• Jogador D
• Jogador F

🏆 Automóvel
• Jogador A
• Jogador E
• Jogador C

Seed: 1748801234
```

Emoji choice is not a business rule and may be adjusted without changing the draw engine.

## 9. Initially Out of Scope

Do not implement in the MVP:

- web dashboard;
- user login/authentication;
- multiple group support;
- scheduled draws;
- editing or deleting results;
- payments or subscription plans;
- PostgreSQL;
- Meta official API integration;
- VPS deployment;
- additional commands such as `!historico`, `!ultimo` or `!ajuda`.

These items enter scope only after the main local flow works and is tested.

## 10. MVP Definition of Done

The MVP is complete when:

1. the project has executable unit and integration tests;
2. the parser accepts the agreed template and rejects invalid inputs;
3. the engine performs unique, seed-reproducible draws;
4. the result is formatted in Brazilian Portuguese;
5. the use case persists completed results locally;
6. the Baileys adapter receives `!sortear` in an authorized group and replies;
7. WhatsApp session files are not versioned;
8. tests, lint and typecheck all pass;
9. one real draw is manually executed in a test WhatsApp group.
