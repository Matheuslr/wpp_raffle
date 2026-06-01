# DigitalOcean Deployment Guide

This guide deploys the WhatsApp poker draw bot to a DigitalOcean Droplet using Docker Engine and the Docker Compose plugin.

The bot does not expose a public HTTP API and does not need inbound public ports. It connects outbound to WhatsApp through Baileys and replies only in explicitly authorized WhatsApp groups.

## Target Layout

Use this layout on the Droplet:

```text
/opt/poker-draw-bot/
├── app/                  # cloned repository
├── runtime/
│   ├── auth/             # persistent Baileys session
│   └── data/             # persistent draw history/data
└── .env                  # optional external copy; app/.env is used by compose
```

The production compose file lives in `/opt/poker-draw-bot/app` and mounts:

```text
../runtime/auth -> /app/runtime/auth
../runtime/data -> /app/runtime/data
```

## 1. Create The Droplet

Create a DigitalOcean Droplet with:

- Ubuntu 24.04 LTS;
- at least 1 GB RAM;
- SSH key authentication.

For this MVP, allow inbound SSH only. No inbound HTTP port is required.

## 2. Connect Through SSH

```bash
ssh root@your-droplet-ip
```

## 3. Install Docker

If you use a DigitalOcean Docker image, Docker Engine and the Docker Compose plugin may already be installed.

On a plain Ubuntu 24.04 LTS Droplet, install Docker from Docker's official repository:

```bash
apt-get update
apt-get install -y ca-certificates curl
install -m 0755 -d /etc/apt/keyrings
curl -fsSL https://download.docker.com/linux/ubuntu/gpg -o /etc/apt/keyrings/docker.asc
chmod a+r /etc/apt/keyrings/docker.asc
echo "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.asc] https://download.docker.com/linux/ubuntu $(. /etc/os-release && echo "${UBUNTU_CODENAME:-$VERSION_CODENAME}") stable" > /etc/apt/sources.list.d/docker.list
apt-get update
apt-get install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin
```

Verify:

```bash
docker --version
docker compose version
```

## 4. Create Runtime Directories

```bash
mkdir -p /opt/poker-draw-bot/runtime/auth
mkdir -p /opt/poker-draw-bot/runtime/data
chown -R 1000:1000 /opt/poker-draw-bot/runtime
cd /opt/poker-draw-bot
```

The container runs as the non-root Node.js user, which uses UID/GID `1000:1000` in the official Node image. The `chown` command is required so Baileys can write `/app/runtime/auth/creds.json` and the app can write draw history.

## 5. Clone The Repository

Clone the private repository into `/opt/poker-draw-bot/app`:

```bash
git clone your-private-repository-url app
cd /opt/poker-draw-bot/app
```

## 6. Create The Production Environment File

Create `/opt/poker-draw-bot/app/.env` from `.env.example`:

```bash
cp .env.example .env
nano .env
```

Configure real values:

```env
NODE_ENV=production
RUN_WHATSAPP_GATEWAY=true
WHATSAPP_PHONE_NUMBER=5500000000000
AUTHORIZED_GROUP_IDS=120363XXXXXXXXXX@g.us
BAILEYS_AUTH_DIR=/app/runtime/auth
DRAW_HISTORY_FILE=/app/runtime/data/draw-history.json
ALLOW_OWN_MESSAGES_FOR_LOCAL_TESTING=false
```

Use exactly one authorized group ID for the MVP.

`.env` must not be committed.

## 7. Build And Start In The Foreground

Run the first startup in the foreground so you can scan the QR code from container logs:

```bash
cd /opt/poker-draw-bot/app
docker compose -f compose.prod.yml up --build
```

If this is the first login, the QR code is printed in the container logs. Scan it with the dedicated WhatsApp `PokerBot` account:

```text
WhatsApp -> Linked devices -> Link a device
```

Do not copy or commit files from `/opt/poker-draw-bot/runtime/auth`; treat them as WhatsApp account credentials.

## 8. Run Detached

After QR authentication succeeds, stop foreground execution with `Ctrl+C`, then start detached:

```bash
docker compose -f compose.prod.yml up -d
docker compose -f compose.prod.yml logs -f --tail=100
```

## 9. Test A Real Draw

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

The bot should reply in the same group with a Brazilian Portuguese result and seed.

## 10. Verify Session Persistence

Restart the container:

```bash
docker compose -f compose.prod.yml restart
docker compose -f compose.prod.yml logs -f --tail=100
```

The bot should reconnect without requiring a new QR code because `/opt/poker-draw-bot/runtime/auth` is persisted.

## 11. Safe Updates

After code, image, or environment changes, update with:

```bash
cd /opt/poker-draw-bot/app
git pull
docker compose -f compose.prod.yml up -d --build
docker compose -f compose.prod.yml logs -f --tail=100
```

Do not use `docker compose restart` as the update mechanism after code, image, dependency, or environment changes.

## 12. Operational Notes

- The bot does not need a public inbound HTTP port.
- Keep only SSH open on the server firewall for this MVP.
- `.env` must not be committed.
- Baileys auth/session files must not be committed or copied into the image.
- Backups of `/opt/poker-draw-bot/runtime/auth` are sensitive and should be treated as WhatsApp account credentials.
- Draw history is stored in `/opt/poker-draw-bot/runtime/data/draw-history.json`.
- Use `docker compose -f compose.prod.yml logs -f --tail=100` for operational logs.

## Troubleshooting

### `EACCES: permission denied, open '/app/runtime/auth/creds.json'`

The host runtime directory is not writable by the non-root container user. Stop the container and fix ownership on the Droplet:

```bash
cd /opt/poker-draw-bot/app
docker compose -f compose.prod.yml down
chown -R 1000:1000 /opt/poker-draw-bot/runtime
docker compose -f compose.prod.yml up --build
```

After QR authentication succeeds, start detached:

```bash
docker compose -f compose.prod.yml up -d
docker compose -f compose.prod.yml logs -f --tail=100
```
