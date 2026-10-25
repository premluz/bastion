import { describe, expect, it } from 'vitest';
import { ApprovalCardPropsSchema } from '../contracts/props/approval-card';
import { HydratedSceneSchema } from '../contracts/scene';
import { ATTENTION_ITEMS, buildResolutionScene } from './attentionQueue';

describe('attention resolution scene', () => {
  it.each(ATTENTION_ITEMS)('builds a valid question for $id, with no footer of its own', (item) => {
    const scene = HydratedSceneSchema.parse(buildResolutionScene(item, ''));
    expect(scene.layout.type).toBe('approval-card');
    const props = ApprovalCardPropsSchema.parse(scene.layout.props);
    expect(props.navigationMode).toBe('hidden');
    expect(props.options.map((option) => option.value)).toEqual(item.options.map((option) => option.value));
  });

  it('carries the current choice', () => {
    const item = ATTENTION_ITEMS[0];
    if (!item) throw new Error('No attention items authored');
    const props = ApprovalCardPropsSchema.parse(buildResolutionScene(item, 'money').layout.props);
    expect(props.selected).toBe('money');
  });
});
