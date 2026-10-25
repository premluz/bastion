import { Slider } from '@astryxdesign/core/Slider';

interface ParamSliderProps {
  readonly label: string;
  readonly value: number;
  readonly min: number;
  readonly max: number;
  readonly step: number;
  readonly onChange: (value: number) => void;
  readonly format?: (value: number) => string;
}

const twoDecimals = (v: number): string => v.toFixed(2);

export function ParamSlider({ label, value, min, max, step, onChange, format = twoDecimals }: ParamSliderProps) {
  return (
    <Slider
      label={label}
      value={value}
      min={min}
      max={max}
      step={step}
      valueDisplay="text"
      formatValue={format}
      onChange={onChange}
    />
  );
}
