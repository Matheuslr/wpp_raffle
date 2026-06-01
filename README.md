# Poker Draw Bot — Codex Starter Kit

This starter kit contains project instructions for building the WhatsApp poker draw bot with Codex CLI under a strict TDD workflow.

## Language Convention

All engineering artifacts are in English to reduce context noise and keep the codebase consistent.

The WhatsApp interface remains in Brazilian Portuguese because that is the real user-facing contract:

- command: `!sortear`;
- section marker: `Lista`;
- bot success and validation messages;
- participant and category names supplied by users.

## Files

- `AGENTS.md`: mandatory engineering, architecture, TDD and language rules for Codex.
- `PROJECT.md`: product specification, business rules, I/O examples and MVP scope.
- `PROMPTS.md`: ordered prompts ready to paste into Codex CLI.

Keep `AGENTS.md` at the repository root so Codex can use it as persistent project guidance.

## Start the Repository

```bash
mkdir poker-draw-bot
cd poker-draw-bot
git init
# Copy AGENTS.md, PROJECT.md and PROMPTS.md into this directory.
```

Install and start Codex CLI according to the official OpenAI documentation:

```bash
npm install -g @openai/codex
codex
```

Inside the Codex session, start with **Prompt 1 — Repository Bootstrap** from `PROMPTS.md`.

## Planned Delivery Flow

```text
TypeScript + Vitest bootstrap
        ↓
!sortear parser
        ↓
Participant/category validation
        ↓
Seeded deterministic draw engine
        ↓
Portuguese response formatter
        ↓
Use case + local JSON history
        ↓
Local Baileys adapter
        ↓
Manual test in an authorized WhatsApp group
```

## Important Notes

- Real WhatsApp connection is introduced only after the critical business logic is tested.
- Automated tests must never connect to WhatsApp.
- Baileys session/authentication files must remain local and never be committed.
- Baileys is an unofficial linked-device integration. This MVP accepts that trade-off because it is private and very low volume.

## Deployment

For the minimal DigitalOcean Droplet deployment using Docker Compose, see [docs/deployment-digitalocean.md](docs/deployment-digitalocean.md).

## Official Codex References

- AGENTS.md project instructions: https://developers.openai.com/codex/guides/agents-md
- Codex CLI: https://developers.openai.com/codex/cli
- Codex Quickstart: https://developers.openai.com/codex/quickstart
