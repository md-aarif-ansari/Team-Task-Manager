import React from 'react';

export default function Card({ children, className = '' }) {
  return (
    <div className={`card-surface p-4 ${className}`}>
      {children}
    </div>
  );
}
