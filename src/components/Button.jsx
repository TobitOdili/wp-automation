import React from 'react';

export function Button({ 
  children, 
  variant = 'primary', 
  as: Component = 'button',
  className = '',
  ...props 
}) {
  const baseClasses = 'px-6 py-2 rounded-lg font-medium transition-all duration-200 disabled:opacity-50';
  
  const variants = {
    primary: 'bg-blue-500 hover:bg-blue-600 text-white',
    secondary: 'bg-gray-700 hover:bg-gray-600 text-white'
  };

  const classes = `${baseClasses} ${variants[variant]} ${className}`;

  return (
    <Component
      className={classes}
      {...props}
    >
      {children}
    </Component>
  );
}