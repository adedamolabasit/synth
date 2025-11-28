import { InputHTMLAttributes, ReactNode } from 'react';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  icon?: ReactNode;
  error?: string;
}

export function Input({ label, icon, error, className = '', ...props }: InputProps) {
  return (
    <div className="w-full">
      {label && (
        <label className="block text-sm font-medium text-slate-300 mb-2">
          {label}
        </label>
      )}
      <div className="relative">
        {icon && (
          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5">
            {icon}
          </div>
        )}
        <input
          className={`
            w-full px-4 py-2.5 ${icon ? 'pl-10' : ''}
            bg-slate-900/50 border border-slate-700/50
            rounded-lg text-slate-100 placeholder-slate-500
            focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500/50
            transition-all duration-250
            backdrop-blur-sm
            ${error ? 'border-rose-500/50 focus:ring-rose-500/50' : ''}
            ${className}
          `}
          {...props}
        />
      </div>
      {error && (
        <p className="mt-1.5 text-sm text-rose-400">{error}</p>
      )}
    </div>
  );
}

// Textarea.tsx
interface TextareaProps {
  label?: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  rows?: number;
  className?: string;
}

export function Textarea({ 
  label, 
  value, 
  onChange, 
  placeholder, 
  rows = 3,
  className = "" 
}: TextareaProps) {
  return (
    <div className={className}>
      {label && (
        <label className="text-sm text-slate-300 mb-2 block">
          {label}
        </label>
      )}
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        rows={rows}
        className="w-full px-3 py-2 bg-slate-800 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:border-blue-500 resize-vertical"
      />
    </div>
  );
}
