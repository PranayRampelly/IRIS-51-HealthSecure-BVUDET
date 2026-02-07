
import React from 'react';

interface LogoProps {
  className?: string;
  showText?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

const Logo: React.FC<LogoProps> = ({ className = '', showText = true, size = 'md' }) => {
  const sizeClasses = {
    sm: 'h-8 w-8',
    md: 'h-12 w-12',
    lg: 'h-16 w-16'
  };
  const textSizes = {
    sm: 'text-lg',
    md: 'text-xl',
    lg: 'text-2xl'
  };
  return (
    <div className={`flex items-center space-x-3 ${className}`}>
      <img
        src="/Heathtech.png"
        alt="HealthTech Logo"
        className={`object-contain ${sizeClasses[size]}`}
        style={{ borderRadius: '12px' }}
      />
      {showText && (
        <div
          className="font-montserrat select-none"
          style={{ userSelect: 'none', background: 'none' }}
        >
          <span className={`${textSizes[size]} font-bold text-health-teal`}>Health</span>
          <span className={`${textSizes[size]} font-medium text-health-teal`}>Secure</span>
        </div>
      )}
    </div>
  );
};

export default Logo;
