import React from 'react';

export default function Button({ children, variant = 'primary', className = '', ...rest }) {
  const base = 'inline-flex items-center justify-center rounded-md font-semibold transition-colors';
  const variants = {
    primary: 'bg-primary text-white px-4 py-2 hover:bg-primary-dark',
    ghost: 'bg-transparent text-gray-700 px-3 py-1 hover:bg-gray-100',
    danger: 'bg-red-600 text-white px-3 py-1 hover:bg-red-700'
  };
  const cls = [base, variants[variant] || variants.primary, className].filter(Boolean).join(' ');
  return (
    <button className={cls} {...rest}>
      {children}
    </button>
  );
}
