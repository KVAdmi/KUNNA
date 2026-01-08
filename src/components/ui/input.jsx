import React from 'react';

export function Input({ 
  className = '', 
  type = 'text',
  ...props 
}) {
  return (
    <input
      type={type}
      className={`w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 ${className}`}
      {...props}
    />
  );
}
