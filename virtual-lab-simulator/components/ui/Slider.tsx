
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
      <label className="flex justify-between items-center text-sm font-medium text-slate-300 mb-1">
        <span>{label}</span>
        <span className="font-mono text-cyan-400 bg-slate-700/50 px-2 py-0.5 rounded">{displayValue !== undefined ? displayValue : value}</span>
      </label>
      <div className="flex items-center space-x-2">
        {minLabel && <span className="text-xs text-slate-400">{minLabel}</span>}
        <input
          type="range"
          value={value}
          {...props}
          className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:bg-cyan-400 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:shadow"
        />
        {maxLabel && <span className="text-xs text-slate-400">{maxLabel}</span>}
      </div>
    </div>
  );
};
