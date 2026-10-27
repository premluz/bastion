import { Collapsible } from '@astryxdesign/core/Collapsible';
import { Switch } from '@astryxdesign/core/Switch';
import { useStudio } from '../../state/studioStore';
import styles from '../overlay.module.css';
import { ParamSlider } from '../ParamSlider';
import { percent, SectionTitle } from './SectionTitle';

export function SurfaceSection() {
  const m = useStudio((s) => s.material);
  const set = useStudio((s) => s.setMaterial);

  return (
    <Collapsible trigger={<SectionTitle title="Geometry & surface" />} defaultIsOpen>
      <div className={styles.controls}>
        <Switch label="Soft corners" value={m.softCorners} onChange={(softCorners) => set({ softCorners })} labelSpacing="spread" />
        <ParamSlider label="Cut width" value={m.cutWidth} min={0.012} max={0.07} step={0.001} format={(v) => v.toFixed(3)} onChange={(cutWidth) => set({ cutWidth })} />
        <ParamSlider label="Roughness" value={m.roughness} min={0.4} max={0.95} step={0.01} onChange={(roughness) => set({ roughness })} />
        <ParamSlider label="Surface reflectance" value={m.reflectance} min={0} max={1} step={0.01} onChange={(reflectance) => set({ reflectance })} />
        <ParamSlider label="Edge illumination" value={m.edge} min={0} max={1} step={0.01} onChange={(edge) => set({ edge })} />
        <ParamSlider label="Texture scale" value={m.grainScale} min={40} max={2400} step={20} format={(v) => v.toFixed(0)} onChange={(grainScale) => set({ grainScale })} />
        <ParamSlider label="Texture amount" value={m.grainAmount} min={0} max={1} step={0.01} format={percent} onChange={(grainAmount) => set({ grainAmount })} />
      </div>
    </Collapsible>
  );
}
