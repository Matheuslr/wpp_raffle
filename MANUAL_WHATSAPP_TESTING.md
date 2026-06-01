# Local WhatsApp Testing Guide

This guide explains how to run the bot locally with Baileys and test one authorized WhatsApp group.

## 1. Prerequisites

- Use Node.js LTS.
- Use a WhatsApp account that is safe for local testing.
- Create or choose one test WhatsApp group.
- Keep `.env`, `.auth/`, `storage/`, logs and QR/session files out of Git.

## 2. Install Dependencies

```bash
npm install
```

## 3. Run Automated Checks First

```bash
npm run test
npm run typecheck
npm run lint
npm run format:check
```

Do not continue to WhatsApp testing until these commands pass.

## 4. Configure `.env`

Edit `.env`:

```bash
RUN_WHATSAPP_GATEWAY=false
WHATSAPP_PHONE_NUMBER=5500000000000
AUTHORIZED_GROUP_IDS=
BAILEYS_AUTH_DIR=.auth
DRAW_HISTORY_FILE=storage/draw-history.json
ALLOW_OWN_MESSAGES_FOR_LOCAL_TESTING=false
```

Use `WHATSAPP_PHONE_NUMBER` as a local note for the account being linked. The current runtime does not send it to WhatsApp; Baileys authenticates through QR/device linking.

Leave `RUN_WHATSAPP_GATEWAY=false` for the first dry run.

## 5. Dry Run The Runtime

```bash
npm run dev
```

Expected terminal output:

```text
WhatsApp gateway not started. Set RUN_WHATSAPP_GATEWAY=true for manual local testing.
```

This confirms `.env` loading and runtime startup without connecting to WhatsApp.

## 6. Get The Test Group ID

You need the WhatsApp group JID, which usually ends with `@g.us`.

Run:

```bash
npm run list:groups
```

If this is the first Baileys login, scan the QR code using WhatsApp:

```text
WhatsApp → Linked devices → Link a device
```

The QR code is printed directly in the terminal. If your terminal is too narrow, make it wider and run `npm run list:groups` again.

The command prints each group name with its ID:

```text
Participating WhatsApp groups:
- Poker Test Group
  id: 120363000000000000@g.us
  participants: 6
```

Set:

```bash
AUTHORIZED_GROUP_IDS=your-group-id@g.us
```

For multiple local test groups, separate IDs with commas:

```bash
AUTHORIZED_GROUP_IDS=group-one@g.us,group-two@g.us
```

## 7. Start The WhatsApp Gateway

Set `.env`:

```bash
RUN_WHATSAPP_GATEWAY=true
AUTHORIZED_GROUP_IDS=your-group-id@g.us
BAILEYS_AUTH_DIR=.auth
DRAW_HISTORY_FILE=storage/draw-history.json
```

Then run:

```bash
npm run dev
```

If Baileys prints or exposes a QR authentication flow, scan it using WhatsApp:

```text
WhatsApp → Linked devices → Link a device
```

Keep the terminal process running during the test.

If you send the test message from the same WhatsApp account linked as the bot, Baileys marks it as `fromMe=true`.
The bot ignores those messages by default to prevent loops. For single-account local testing only, set:

```bash
ALLOW_OWN_MESSAGES_FOR_LOCAL_TESTING=true
```

Turn `ALLOW_OWN_MESSAGES_FOR_LOCAL_TESTING` back to `false` for normal operation.

## 8. Send A Valid Draw Message

Send this in the authorized WhatsApp group:

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

Expected response shape:

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

ID: draw-1

Seed: 1748801234
```

The exact winners and seed can differ in manual testing because the runtime seed comes from the local system clock.

## 9. Send A Validation Message

Send this in the authorized WhatsApp group:

```text
!sortear

Lista
João
Pedro

Sierra: 2
Automóvel: 1
```

Expected response:

```text
❌ Não foi possível realizar o sorteio: há 3 vagas para apenas 2 participantes.
```

## 10. Verify Safety Behavior

- Send the valid command in an unauthorized group. The bot must not reply.
- Send the valid command as a private message. The bot must not reply.
- Send any message that does not start with `!sortear`. The bot must not reply.
- Confirm the bot does not respond to its own messages.

## 11. Verify Local Files

After a successful draw, confirm history was written locally:

```bash
ls storage
```

Confirm local-only files are ignored:

```bash
git status --ignored --short
```

Expected ignored entries include:

```text
!! .env
!! .auth/
!! storage/
!! node_modules/
```

## 12. Stop The Bot

Stop the local process with `Ctrl+C`.

Before committing, keep these untracked or ignored:

- `.env`
- `.auth/`
- `storage/`
- logs
