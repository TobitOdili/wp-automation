import React from 'react';

export function ColorInput({ value, onChange }) {
  return (
    <div className="flex items-center space-x-4">
      <input
        type="color"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="h-10 w-20 bg-transparent rounded cursor-pointer"
      />
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="#000000"
        className="flex-1 px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg 
                  focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
                  text-white placeholder-gray-400"
      />
    </div>
  );
}