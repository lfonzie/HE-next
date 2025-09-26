import React from 'react';

export const PendulumIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}
  >
    <circle cx="12" cy="4" r="2" />
    <path d="M12 6v8" />
    <path d="M8 14l4 4 4-4" />
    <path d="M12 18v2" />
  </svg>
);
