
import React from 'react';

interface SliderProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  value: number | string;
  displayValue?: string;
  minLabel?: string;
  maxLabel?: string;
}

export const Slider: React.FC<SliderProps> = ({ label, value, displayValue, minLabel, maxLabel, ...props }) => {
  return (
    <div className="w-full">
      <label className="flex justify-between items-center text-sm font-medium text-slate-300 mb-2">
        <span>{label}</span>
        <span className="font-mono text-cyan-300 bg-black/20 px-2 py-0.5 rounded">{displayValue !== undefined ? displayValue : value}</span>
      </label>
      <div className="flex items-center space-x-3">
        {minLabel && <span className="text-xs text-slate-400">{minLabel}</span>}
        <input
          type="range"
          value={value}
          {...props}
          className="w-full h-1.5 bg-black/30 rounded-full appearance-none cursor-pointer accent-cyan-400"
        />
        {maxLabel && <span className="text-xs text-slate-400">{maxLabel}</span>}
      </div>
    </div>
  );
};
