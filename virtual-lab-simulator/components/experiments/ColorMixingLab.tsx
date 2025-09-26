
import React, { useState } from 'react';
import { Slider } from '../ui/Slider';

export const ColorMixingLab: React.FC = () => {
  const [red, setRed] = useState<number>(173);
  const [green, setGreen] = useState<number>(216);
  const [blue, setBlue] = useState<number>(230);

  const hexColor = `#${red.toString(16).padStart(2, '0')}${green.toString(16).padStart(2, '0')}${blue.toString(16).padStart(2, '0')}`;

  return (
    <div className="flex flex-col md:flex-row h-full w-full gap-8">
      <div className="flex-1 flex flex-col justify-center items-center p-4">
        <div 
            className="w-48 h-48 sm:w-64 sm:h-64 rounded-full border-8 border-slate-600 shadow-2xl transition-all duration-300" 
            style={{ backgroundColor: `rgb(${red}, ${green}, ${blue})` }}
        ></div>
        <div className="mt-6 text-center">
            <p className="text-slate-400">RGB: ({red}, {green}, {blue})</p>
            <p className="font-mono text-xl text-white bg-slate-700/50 px-3 py-1 rounded-md mt-2">{hexColor.toUpperCase()}</p>
        </div>
      </div>
      <div className="w-full md:w-64 flex-shrink-0 flex flex-col justify-center space-y-6">
        <Slider
          label="Red"
          min="0"
          max="255"
          value={red}
          onChange={(e) => setRed(parseInt(e.target.value, 10))}
        />
        <Slider
          label="Green"
          min="0"
          max="255"
          value={green}
          onChange={(e) => setGreen(parseInt(e.target.value, 10))}
        />
        <Slider
          label="Blue"
          min="0"
          max="255"
          value={blue}
          onChange={(e) => setBlue(parseInt(e.target.value, 10))}
        />
      </div>
    </div>
  );
};
