import entitiesJson from "../../universe/entities.json";

interface UniverseEntityRecord {
  intent?: string;
}

// Universe entities carry an investigation intent (Phase 8F) — a routing
// fact, not a rendering one, so it deliberately lives outside the
// Zod-validated EntityDataSet contract (same precedent as sources.json
// staying outside the DataSet union): entity-header/EntityDataSet
// consumers never see it, only this lookup does. Only entities that
// genuinely carry one resolve — everything else returns undefined, so a
// click on an unlinked entity is simply impossible rather than a dead
// no-match turn (entity links are only ever authored in scene data for
// entities confirmed to have one, but this lookup stays honest either way).
const intentById = new Map(
  Object.entries(entitiesJson as Record<string, UniverseEntityRecord>)
    .filter((entry): entry is [string, { intent: string }] => typeof entry[1].intent === "string")
    .map(([id, record]) => [id, record.intent]),
);

// Called only when a real EntityLink was clicked (a data-entity-id
// existed in the DOM), so a miss here means the id doesn't match any
// universe entity that carries an intent — a typo'd or stale entityId
// authored in a scene. Warn loudly rather than degrade silently
// (Prem's condition for keeping `intent` outside the Zod contract):
// if a third linked entity ever misroutes, promote `intent` into the
// schema instead of adding a second silent-failure path here.
export function getIntentForEntity(entityId: string): string | undefined {
  const intent = intentById.get(entityId);
  if (!intent) {
    console.warn(`entityIntent: no investigation intent found for entity id "${entityId}" — link will not navigate.`);
  }
  return intent;
}
