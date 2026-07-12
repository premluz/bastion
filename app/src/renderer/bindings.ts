import type { DataSet } from "../contracts/data";
import type { DataBinding } from "../contracts/scene";

export interface BindingResolution {
  props: Record<string, unknown>;
  missingKeys: string[];
}

// Resolves a node's `bind` map against the scene's already-hydrated data.
// A key present in `bind` but absent from `data` (as opposed to present but
// holding a MissingDataSet, which the registry's own propSchema will reject)
// is reported via missingKeys rather than thrown — the renderer turns that
// into a FallbackNode, never a crash (CLAUDE.md §6).
export function resolveBindings(
  bind: DataBinding | undefined,
  data: Record<string, DataSet>,
): BindingResolution {
  if (!bind) {
    return { props: {}, missingKeys: [] };
  }

  const props: Record<string, unknown> = {};
  const missingKeys: string[] = [];

  for (const [propName, dataKey] of Object.entries(bind)) {
    if (dataKey in data) {
      props[propName] = data[dataKey];
    } else {
      missingKeys.push(dataKey);
    }
  }

  return { props, missingKeys };
}
