import React from 'react';

export default function Spinner({ size = 'md', className = '' }) {
  const sizes = {
    sm: 'w-4 h-4',
    md: 'w-8 h-8',
    lg: 'w-12 h-12'
  };

  return (
    <div className={`${className} flex justify-center items-center`}>
      <div className={`${sizes[size]} animate-spin rounded-full border-t-2 border-b-2 border-blue-600`} role="status">
        <span className="sr-only">Carregando...</span>
      </div>
    </div>
  );
}