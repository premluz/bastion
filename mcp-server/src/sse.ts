import type { ServerResponse } from "node:http";
import type { HydratedScene } from "../../app/src/contracts/scene.ts";

// Broadcast channel to the app (CLAUDE.md's locked mcp-server/src/sse.ts).
// A pushed scene is already hydrated by the time it reaches here (server.ts
// does that before calling broadcastScene) — this file only fans the
// message out to every currently-connected app client.
const clients = new Set<ServerResponse>();

export function addClient(res: ServerResponse): void {
  clients.add(res);
}

export function removeClient(res: ServerResponse): void {
  clients.delete(res);
}

export function broadcastScene(scene: HydratedScene): void {
  const payload = `data: ${JSON.stringify(scene)}\n\n`;
  for (const client of clients) {
    client.write(payload);
  }
}
