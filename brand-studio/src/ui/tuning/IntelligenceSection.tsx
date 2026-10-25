import { Button } from '@astryxdesign/core/Button';
import { Collapsible } from '@astryxdesign/core/Collapsible';
import { SegmentedControl, SegmentedControlItem } from '@astryxdesign/core/SegmentedControl';
import { Switch } from '@astryxdesign/core/Switch';
import { Selector } from '@astryxdesign/core/Selector';
import { STYLE_LABELS, STYLES, type IntelligenceMode, type MotionStyle } from '@bastion/monolith';
import { useStudio, type GlowMode } from '../../state/studioStore';
import styles from '../overlay.module.css';
import { ParamSlider } from '../ParamSlider';
import { percent, SectionTitle } from './SectionTitle';

const MODES: readonly { value: IntelligenceMode; label: string }[] = [
  { value: 'dormant', label: 'Dormant' },
  { value: 'thinking', label: 'Thinking' },
  { value: 'awakening', label: 'Awakening' },
];

const isMode = (value: string): value is IntelligenceMode => MODES.some((m) => m.value === value);

const STYLE_OPTIONS = (Object.keys(STYLES) as MotionStyle[]).map((value) => ({ value, label: STYLE_LABELS[value] }));
const isStyle = (value: string): value is MotionStyle => value in STYLES;

const GLOW_MODES: readonly { value: GlowMode; label: string }[] = [
  { value: 'contained', label: 'Contained' },
  { value: 'incandescent', label: 'Incandescent' },
];

const isGlowMode = (value: string): value is GlowMode => GLOW_MODES.some((m) => m.value === value);

export function IntelligenceSection() {
  const m = useStudio((s) => s.material);
  const setMaterial = useStudio((s) => s.setMaterial);
  const intel = useStudio((s) => s.intelligence);
  const setIntel = useStudio((s) => s.setIntelligence);
  const resetLight = useStudio((s) => s.resetLight);

  return (
    <Collapsible trigger={<SectionTitle title="Internal intelligence" />} defaultIsOpen>
      <div className={styles.controls}>
        <SegmentedControl
          label="Intelligence mode"
          size="sm"
          layout="fill"
          value={intel.mode}
          onChange={(value) => {
            if (isMode(value)) setIntel({ mode: value });
          }}
        >
          {MODES.map((mode) => (
            <SegmentedControlItem key={mode.value} value={mode.value} label={mode.label} />
          ))}
        </SegmentedControl>
        <Selector
          label="Movement"
          size="sm"
          options={STYLE_OPTIONS}
          value={intel.style}
          onChange={(value) => {
            if (isStyle(value)) setIntel({ style: value });
          }}
        />
        <SegmentedControl
          label="Glow character"
          size="sm"
          layout="fill"
          value={m.glowMode}
          onChange={(value) => {
            if (isGlowMode(value)) setMaterial({ glowMode: value });
          }}
        >
          {GLOW_MODES.map((mode) => (
            <SegmentedControlItem key={mode.value} value={mode.value} label={mode.label} />
          ))}
        </SegmentedControl>
        {m.glowMode === 'incandescent' && (
          <ParamSlider label="Incandescence" value={m.incandescence} min={0} max={1} step={0.01} format={percent} onChange={(incandescence) => setMaterial({ incandescence })} />
        )}
        <ParamSlider label="Outer glow" value={m.halo} min={0} max={1} step={0.01} format={percent} onChange={(halo) => setMaterial({ halo })} />
        <Switch label="Pause intelligence" value={intel.paused} onChange={(paused) => setIntel({ paused })} labelSpacing="spread" />
        <ParamSlider label="Core intensity" value={m.core} min={0} max={1} step={0.01} format={percent} onChange={(core) => setMaterial({ core })} />
        <ParamSlider label="Cut illumination" value={m.cutLight} min={0} max={1} step={0.01} format={percent} onChange={(cutLight) => setMaterial({ cutLight })} />
        <ParamSlider label="Exterior spill" value={m.spill} min={0} max={1} step={0.01} format={percent} onChange={(spill) => setMaterial({ spill })} />
        <ParamSlider label="Diffusion radius" value={m.diffusion} min={0} max={1} step={0.01} format={percent} onChange={(diffusion) => setMaterial({ diffusion })} />
        <ParamSlider label="Absorption" value={m.absorption} min={0} max={1} step={0.01} format={percent} onChange={(absorption) => setMaterial({ absorption })} />
        <ParamSlider label="Glow falloff" value={m.falloff} min={0.8} max={3} step={0.05} onChange={(falloff) => setMaterial({ falloff })} />
        <ParamSlider label="Intelligence activity" value={intel.activity} min={0} max={1} step={0.01} format={percent} onChange={(activity) => setIntel({ activity })} />
        <ParamSlider label="Flow speed" value={intel.flowSpeed} min={0} max={1} step={0.01} format={percent} onChange={(flowSpeed) => setIntel({ flowSpeed })} />
        <ParamSlider label="Impulse strength" value={intel.impulse} min={0} max={1} step={0.01} format={percent} onChange={(impulse) => setIntel({ impulse })} />
        <Button label="Reset light" variant="secondary" size="sm" onClick={resetLight} />
      </div>
    </Collapsible>
  );
}
