import '../theme/pane-entry.css';
import { Suspense, createElement, type ComponentType, type ReactNode } from 'react';
import type { HydratedScene, SceneNode } from '../contracts/scene';
import { registry } from '../registry/registry';
import { resolveBindings } from './bindings';
import { AfterReply } from './AfterReply';
import { FallbackNode } from './FallbackNode';
import styles from './assembly.module.css';

interface SceneRendererProps {
  scene: HydratedScene;
}

export function SceneRenderer({ scene }: SceneRendererProps) {
  return <Suspense fallback={null}>{renderNode(scene.layout, scene.data)}</Suspense>;
}

// The panes that wait for the reply before them (theme/pane-entry.css names the same two for their entrance).
const PANES_AFTER_REPLY = new Set(['approval-card', 'payment-card']);

function renderNode(node: SceneNode, data: HydratedScene['data'], previous?: SceneNode): ReactNode {
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

  const children = node.children?.map((child, index) => renderNode(child, data, node.children?.[index - 1]));
  // The registry necessarily erases each entry's specific prop type down to
  // `never` so heterogeneous nodes can share one map (see registry.ts) —
  // propSchema.safeParse just above is what actually guarantees these props
  // are valid at runtime; this cast only tells the compiler what the schema
  // already checked.
  const Component = entry.component as ComponentType<Record<string, unknown>>;
  const finalProps = { ...(parsed.data as Record<string, unknown>), children };
  const pane = wrap(node, createElement(Component, finalProps));
  const reply = previous?.type === 'text-block' ? previous.props?.text : undefined;
  return PANES_AFTER_REPLY.has(node.type) && typeof reply === 'string' ? <AfterReply key={node.id} text={reply}>{pane}</AfterReply> : pane;
}

function wrap(node: SceneNode, element: ReactNode): ReactNode {
  return (
    <div
      key={node.id}
      className={styles.nodeWrapper}
      data-node-type={node.type}
      style={{ '--reveal-index': node.reveal ?? 0 } as React.CSSProperties}
    >
      {element}
    </div>
  );
}
