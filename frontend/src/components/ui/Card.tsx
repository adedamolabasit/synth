import { ReactNode } from 'react';

interface CardProps {
  children: ReactNode;
  className?: string;
  hover?: boolean;
  glow?: 'blue' | 'cyan' | 'magenta' | 'none';
  onClick?: () => void;
}

export function Card({ children, className = '', hover = false, glow = 'none', onClick }: CardProps) {
  const glowStyles = {
    blue: 'hover:shadow-[0_0_20px_rgba(59,130,246,0.5)]',
    cyan: 'hover:shadow-[0_0_20px_rgba(6,182,212,0.5)]',
    magenta: 'hover:shadow-[0_0_20px_rgba(236,72,153,0.5)]',
    none: '',
  };

  return (
    <div
      onClick={onClick}
      className={`
        bg-slate-800/40 backdrop-blur-md border border-slate-700/50 rounded-xl
        transition-all duration-250
        ${hover ? 'hover:bg-slate-800/60 hover:border-slate-600/50 cursor-pointer transform hover:scale-[1.02]' : ''}
        ${glowStyles[glow]}
        ${className}
      `}
    >
      {children}
    </div>
  );
}
