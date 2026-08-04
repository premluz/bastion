import { Suspense, createElement, type ComponentType, type ReactNode } from 'react';
import type { HydratedScene, SceneNode } from '../contracts/scene';
import { registry } from '../registry/registry';
import { resolveBindings } from './bindings';
import { FallbackNode } from './FallbackNode';
import styles from './assembly.module.css';

interface SceneRendererProps {
  scene: HydratedScene;
}

export function SceneRenderer({ scene }: SceneRendererProps) {
  return <Suspense fallback={null}>{renderNode(scene.layout, scene.data)}</Suspense>;
}

function renderNode(node: SceneNode, data: HydratedScene['data']): ReactNode {
  const entry = registry[node.type];
  if (!entry) {
    return wrap(node, <FallbackNode reason="unknown-type" detail={`Unknown node type "${node.type}"`} />);
  }

  const { props: boundProps, missingKeys } = resolveBindings(node.bind, data);
  if (missingKeys.length > 0) {
    return wrap(
      node,
      <FallbackNode
        reason="missing-data"
        detail={`"${node.type}" binds to data key(s) not present in this scene: ${missingKeys.join(', ')}`}
      />,
    );
  }

  const mergedProps = { ...node.props, ...boundProps };
  const parsed = entry.propSchema.safeParse(mergedProps);
  if (!parsed.success) {
    const issues = parsed.error.issues.map((issue) => `${issue.path.join('.') || '(root)'}: ${issue.message}`);
    return wrap(
      node,
      <FallbackNode reason="invalid-props" detail={`"${node.type}" has invalid props — ${issues.join('; ')}`} />,
    );
  }

  const children = node.children?.map((child) => renderNode(child, data));
  // The registry necessarily erases each entry's specific prop type down to
  // `never` so heterogeneous nodes can share one map (see registry.ts) —
  // propSchema.safeParse just above is what actually guarantees these props
  // are valid at runtime; this cast only tells the compiler what the schema
  // already checked.
  const Component = entry.component as ComponentType<Record<string, unknown>>;
  const finalProps = { ...(parsed.data as Record<string, unknown>), children };
  return wrap(node, createElement(Component, finalProps));
}

function wrap(node: SceneNode, element: ReactNode): ReactNode {
  return (
    <div
      key={node.id}
      className={styles.nodeWrapper}
      style={{ '--reveal-index': node.reveal ?? 0 } as React.CSSProperties}
    >
      {element}
    </div>
  );
}
