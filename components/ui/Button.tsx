import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'success' | 'light';
  size?: 'sm' | 'md' | 'lg';
  children: React.ReactNode;
}

const Button: React.FC<ButtonProps> = ({ children, variant = 'primary', size = 'md', className, ...props }) => {
  const baseClasses = "font-semibold shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 transition-colors duration-150 ease-in-out rounded-md inline-flex items-center"; // Default to center justify

  let variantClasses = '';
  switch (variant) {
    case 'primary': 
      variantClasses = 'bg-blue-500 hover:bg-blue-600 focus:ring-blue-500 text-white';
      break;
    case 'secondary': // Adjusted for better visibility on white cards
      variantClasses = 'bg-slate-100 hover:bg-slate-200 focus:ring-slate-500 text-slate-700 border border-slate-300';
      break;
    case 'danger': 
      variantClasses = 'bg-red-600 hover:bg-red-700 focus:ring-red-500 text-white';
      break;
    case 'success':
      variantClasses = 'bg-green-600 hover:bg-green-700 focus:ring-green-500 text-white';
      break;
    case 'light':
      variantClasses = 'bg-slate-200 hover:bg-slate-300 text-slate-800 focus:ring-slate-400';
      break;
  }

  let sizeClasses = '';
  switch (size) {
    case 'sm':
      sizeClasses = 'px-3 py-1.5 text-xs'; // Slightly increased padding for sm
      break;
    case 'md':
      sizeClasses = 'px-4 py-2 text-sm';
      break;
    case 'lg':
      sizeClasses = 'px-6 py-3 text-base';
      break;
  }
  
  // Default to justify-center if not overridden by className
  const justificationClass = className?.includes('justify-') ? '' : 'justify-center';

  return (
    <button
      className={`${baseClasses} ${variantClasses} ${sizeClasses} ${justificationClass} ${className || ''}`}
      {...props}
    >
      {children}
    </button>
  );
};

export default Button;