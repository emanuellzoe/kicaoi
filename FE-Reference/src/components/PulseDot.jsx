import React from 'react';

export function PulseDot({ color = 'bg-green-400' }) {
  return (
    <span className="relative inline-flex h-2 w-2">
      <span className={`animate-ping absolute inline-flex h-full w-full rounded-full ${color} opacity-75`} />
      <span className={`relative inline-flex rounded-full h-2 w-2 ${color}`} />
    </span>
  );
}
