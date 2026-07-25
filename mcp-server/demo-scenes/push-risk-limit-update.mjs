#!/usr/bin/env node
// Demo trigger (Portfolio wiring order, 2026-07-25): pushes the revised
// risk-limit scene at demo-scenes/risk-limit-update.scene.json against a
// running mcp-server instance. Same id as risk-desk-dashboard.scene.json
// — if that scene is already open as an artifact, liveChannel.ts's
// update-in-place path patches it live (ring-gauge sweeps to 92%, no new
// turn); otherwise it lands as a fresh investigation, same as any push.
//
// Run: node mcp-server/demo-scenes/push-risk-limit-update.mjs
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StreamableHTTPClientTransport } from "@modelcontextprotocol/sdk/client/streamableHttp.js";

const __dirname = dirname(fileURLToPath(import.meta.url));
const scene = JSON.parse(readFileSync(join(__dirname, "risk-limit-update.scene.json"), "utf-8"));

const client = new Client({ name: "risk-limit-update-demo", version: "1.0.0" });
await client.connect(new StreamableHTTPClientTransport(new URL("http://localhost:8787/mcp")));

const result = await client.callTool({ name: "push_scene", arguments: { scene } });
for (const item of result.content ?? []) {
  if (item.type === "text") console.log(item.text);
}
process.exit(result.isError ? 1 : 0);
