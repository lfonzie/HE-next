
import React from 'react';

export const PendulumIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m-4.5-4.5a4.5 4.5 0 119 0 4.5 4.5 0 01-9 0z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M5.25 6H18.75" />
    </svg>
);
