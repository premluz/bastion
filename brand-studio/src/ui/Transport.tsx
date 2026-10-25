import { IconButton } from '@astryxdesign/core/IconButton';
import { Slider } from '@astryxdesign/core/Slider';
import { Text } from '@astryxdesign/core/Text';
import { useAssembly } from '../state/assemblyStore';
import { PauseIcon, PlayIcon, ReplayIcon, ReverseIcon } from './icons';
import styles from './overlay.module.css';

interface TransportProps {
  /** Names the current phase of the sequence being played. */
  readonly phaseName: (progress: number) => string;
}

export function Transport({ phaseName: nameOf }: TransportProps) {
  const progress = useAssembly((s) => s.progress);
  const playing = useAssembly((s) => s.playing);
  const direction = useAssembly((s) => s.direction);
  const play = useAssembly((s) => s.play);
  const pause = useAssembly((s) => s.pause);
  const reverse = useAssembly((s) => s.reverse);
  const replay = useAssembly((s) => s.replay);
  const scrub = useAssembly((s) => s.scrub);

  return (
    <div className={`${styles.panel} ${styles.transport}`}>
      <IconButton label="Replay" variant="ghost" icon={<ReplayIcon />} onClick={replay} />
      <IconButton
        label={direction === 1 ? 'Disassemble' : 'Assemble'}
        variant="ghost"
        icon={direction === 1 ? <ReverseIcon /> : <PlayIcon />}
        onClick={reverse}
      />
      <IconButton
        label={playing ? 'Pause' : 'Play'}
        variant="primary"
        icon={playing ? <PauseIcon /> : <PlayIcon />}
        onClick={playing ? pause : play}
      />
      <div className={styles.scrubber}>
        <Slider
          label="Assembly progress"
          isLabelHidden
          value={progress}
          min={0}
          max={1}
          step={0.001}
          valueDisplay="none"
          onChange={scrub}
        />
      </div>
      <span className={styles.readout}>
        <Text type="supporting" hasTabularNumbers>
          {`${Math.round(progress * 100)}%`}
        </Text>
      </span>
      <span className={styles.phase}>
        <Text type="supporting" weight="medium">
          {nameOf(progress)}
        </Text>
      </span>
    </div>
  );
}
