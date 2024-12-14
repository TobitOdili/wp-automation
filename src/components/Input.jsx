import React from 'react';

export function Input({ className = '', ...props }) {
  return (
    <input
      className={`w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg 
                 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
                 text-white placeholder-gray-400 ${className}`}
      {...props}
    />
  );
}