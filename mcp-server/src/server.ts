import { createServer, type IncomingMessage, type ServerResponse } from "node:http";
import { randomUUID } from "node:crypto";
import { readFileSync, readdirSync } from "node:fs";
import { join, dirname } from "node:path";
import { z } from "zod";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/streamableHttp.js";
import { SceneSchema, type Scene, type HydratedScene } from "../../app/src/contracts/scene.ts";
import { DataSetSchema, MissingDataSetSchema, type DataSet } from "../../app/src/contracts/data.ts";
import { addClient, removeClient, broadcastScene } from "./sse.ts";

const APP_ROOT = join(dirname(new URL(import.meta.url).pathname), "..", "..", "app");
const SCENES_DIR = join(APP_ROOT, "scenes");
const UNIVERSE_DIR = join(APP_ROOT, "universe");
const PORT = 8787;

function readJson(path: string): unknown {
  return JSON.parse(readFileSync(path, "utf-8"));
}

// Same shape as contracts/hydrate.ts's loadUniverse — reimplemented with
// fs.readFileSync rather than Vite's JSON-import machinery, since this
// process runs under plain Node, not a bundler (CLAUDE.md §6: universe
// stays flat keyed JSON, no relations engine — this is still exactly
// that, just read a different way).
function loadUniverse(): Record<string, unknown> {
  const entities = readJson(join(UNIVERSE_DIR, "entities.json")) as Record<string, unknown>;
  const datasets = readJson(join(UNIVERSE_DIR, "datasets.json")) as Record<string, unknown>;
  return { ...entities, ...datasets };
}

// Same hydration contract as contracts/hydrate.ts's hydrateScene (CLAUDE.md
// §6: a dangling $ref hydrates to a marked-missing DataSet, never a
// crash) — reimplemented here rather than imported, since that file's own
// JSON imports are Vite-flavored and don't resolve under plain Node.
function hydrate(scene: Scene, universe: Record<string, unknown>): HydratedScene {
  const data: Record<string, DataSet> = {};
  for (const [key, entry] of Object.entries(scene.data)) {
    if ("$ref" in entry) {
      const parsed = DataSetSchema.safeParse(universe[entry.$ref]);
      data[key] = parsed.success
        ? parsed.data
        : MissingDataSetSchema.parse({
            kind: "missing",
            ref: entry.$ref,
            reason: "ref did not resolve to a valid DataSet in the universe",
          });
    } else {
      data[key] = entry;
    }
  }
  return { ...scene, data };
}

function loadAllScenes(): Map<string, Scene> {
  const scenes = new Map<string, Scene>();
  for (const file of readdirSync(SCENES_DIR)) {
    if (!file.endsWith(".scene.json")) continue;
    const parsed = SceneSchema.safeParse(readJson(join(SCENES_DIR, file)));
    if (parsed.success) scenes.set(parsed.data.id, parsed.data);
  }
  return scenes;
}

function textResult(text: string, isError = false) {
  return { content: [{ type: "text" as const, text }], isError };
}

function buildServer(): McpServer {
  const server = new McpServer({ name: "merlin-mcp-server", version: "1.0.0" });
  const universe = loadUniverse();

  server.registerTool(
    "list_scenes",
    { description: "List every scene the server knows about (id + title)." },
    () => {
      const scenes = Array.from(loadAllScenes().values()).map((s) => ({ id: s.id, title: s.title }));
      return textResult(JSON.stringify({ scenes }, null, 2));
    },
  );

  server.registerTool(
    "get_scene",
    {
      description: "Fetch one scene by id, fully hydrated (all $refs resolved against the universe).",
      inputSchema: { id: z.string().min(1) },
    },
    ({ id }) => {
      const scene = loadAllScenes().get(id);
      if (!scene) return textResult(`No scene found with id "${id}"`, true);
      return textResult(JSON.stringify(hydrate(scene, universe), null, 2));
    },
  );

  server.registerTool(
    "query_data",
    {
      description: "Fetch one hydrated DataSet from a scene by its data key.",
      inputSchema: { sceneId: z.string().min(1), key: z.string().min(1) },
    },
    ({ sceneId, key }) => {
      const scene = loadAllScenes().get(sceneId);
      if (!scene) return textResult(`No scene found with id "${sceneId}"`, true);
      const hydrated = hydrate(scene, universe);
      const entry = hydrated.data[key];
      if (!entry) return textResult(`No data key "${key}" on scene "${sceneId}"`, true);
      return textResult(JSON.stringify(entry, null, 2));
    },
  );

  server.registerTool(
    "push_scene",
    {
      description:
        "Push a new scene into the running app. Zod-validated against the real Scene contract; " +
        "a scene that fails validation is rejected with a structured error and the app is never touched.",
      inputSchema: { scene: z.unknown() },
    },
    ({ scene }) => {
      const parsed = SceneSchema.safeParse(scene);
      if (!parsed.success) {
        const issues = parsed.error.issues.map((issue) => `${issue.path.join(".") || "(root)"}: ${issue.message}`);
        return textResult(`Invalid scene — not pushed:\n${issues.join("\n")}`, true);
      }
      const hydrated = hydrate(parsed.data, universe);
      broadcastScene(hydrated);
      return textResult(`Pushed "${hydrated.title}" (${hydrated.id}) to ${1} live channel(s).`);
    },
  );

  return server;
}

const mcpServer = buildServer();
const transport = new StreamableHTTPServerTransport({ sessionIdGenerator: () => randomUUID() });
await mcpServer.connect(transport);

const httpServer = createServer(async (req: IncomingMessage, res: ServerResponse) => {
  const url = new URL(req.url ?? "/", `http://${req.headers.host}`);

  if (url.pathname === "/mcp") {
    if (req.method === "POST") {
      const chunks: Buffer[] = [];
      for await (const chunk of req) chunks.push(chunk as Buffer);
      const body = chunks.length > 0 ? JSON.parse(Buffer.concat(chunks).toString("utf-8")) : undefined;
      await transport.handleRequest(req, res, body);
    } else {
      await transport.handleRequest(req, res);
    }
    return;
  }

  if (url.pathname === "/events" && req.method === "GET") {
    res.writeHead(200, {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
      // The app (Vite/Storybook dev server) and this server run on
      // different localhost ports — a genuine cross-origin request, not
      // same-origin. Verified live: EventSource fails with a CORS console
      // error and never delivers a message without this header.
      "Access-Control-Allow-Origin": "*",
    });
    // Node buffers the response until the first write — without this the
    // client's connection appears to hang with zero bytes received (caught
    // live via curl, not assumed) since nothing else writes until a scene
    // is actually pushed, which may be much later or never in one session.
    res.flushHeaders();
    addClient(res);
    req.on("close", () => removeClient(res));
    return;
  }

  res.writeHead(404).end("Not found");
});

httpServer.listen(PORT, () => {
  // eslint-disable-next-line no-console
  console.log(`Merlin MCP server listening on http://localhost:${PORT} (MCP: /mcp, app SSE: /events)`);
});
