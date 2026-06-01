# Manual WhatsApp Group Testing Guide

Use this only after automated tests, typecheck and lint pass.

## Preconditions

- Use Node.js LTS.
- Keep WhatsApp auth files in `.auth/` or another gitignored directory.
- Configure exactly the test group IDs you want to authorize.
- Do not use a production group for the first QR login.

## Start The Local Gateway

```bash
RUN_WHATSAPP_GATEWAY=true \
AUTHORIZED_GROUP_IDS="your-group-id@g.us" \
BAILEYS_AUTH_DIR=".auth" \
DRAW_HISTORY_FILE="storage/draw-history.json" \
npm run dev
```

If Baileys requires QR authentication, complete the QR flow manually with the local WhatsApp account.
Do not commit `.auth/`, `storage/`, logs or `.env` files.

## Valid Draw Message

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

## Validation Check

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

## Safety Checks

- Send the same command in an unauthorized group; the bot must not reply.
- Send the command as a private message; the bot must not reply.
- Confirm `.auth/` and `storage/` remain untracked with `git status --ignored --short`.
