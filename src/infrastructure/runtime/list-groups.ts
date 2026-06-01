import "dotenv/config";

import {
  fetchLatestBaileysVersion,
  makeWASocket,
  useMultiFileAuthState
} from "@whiskeysockets/baileys";
import qrcode from "qrcode-terminal";

const authDirectory = process.env["BAILEYS_AUTH_DIR"] ?? ".auth";
const { state, saveCreds } = await useMultiFileAuthState(authDirectory);
const { version } = await fetchLatestBaileysVersion();
const socket = makeWASocket({
  auth: state,
  markOnlineOnConnect: false,
  shouldSyncHistoryMessage: () => false,
  version
});

socket.ev.on("creds.update", saveCreds);
socket.ev.on("connection.update", async (update) => {
  if (update.qr) {
    console.info("QR code received. Scan it in WhatsApp under Linked devices:");
    qrcode.generate(update.qr, { small: true });
  }

  if (update.connection === "open") {
    const groups = await socket.groupFetchAllParticipating();
    const groupList = Object.values(groups).sort((left, right) =>
      left.subject.localeCompare(right.subject, "pt-BR")
    );

    if (groupList.length === 0) {
      console.info("No participating WhatsApp groups found for this account.");
    } else {
      console.info("Participating WhatsApp groups:");

      for (const group of groupList) {
        console.info(`- ${group.subject}`);
        console.info(`  id: ${group.id}`);
        console.info(`  participants: ${group.participants.length}`);
      }
    }

    socket.end(new Error("Group listing completed."));
  }
});
