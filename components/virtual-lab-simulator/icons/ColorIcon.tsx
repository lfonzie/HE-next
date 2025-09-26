import React from 'react';

export const ColorIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}
  >
    <path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z" />
    <circle cx="12" cy="12" r="3" />
    <path d="M12 1v6" />
    <path d="M12 17v6" />
    <path d="M4.22 4.22l4.24 4.24" />
    <path d="M15.54 15.54l4.24 4.24" />
    <path d="M1 12h6" />
    <path d="M17 12h6" />
    <path d="M4.22 19.78l4.24-4.24" />
    <path d="M15.54 8.46l4.24-4.24" />
  </svg>
);
