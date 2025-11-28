// Input.tsx
interface InputProps {
  label?: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  type?: string;
  required?: boolean;
  className?: string;
  min?: string;
  max?: string;
}

export function Input({ 
  label, 
  value, 
  onChange, 
  placeholder, 
  type = "text", 
  required = false,
  className = "",
  min,
  max 
}: InputProps) {
  return (
    <div className={className}>
      {label && (
        <label className="text-sm text-slate-300 mb-2 block">
          {label}
          {required && <span className="text-red-400 ml-1">*</span>}
        </label>
      )}
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full px-3 py-2 bg-slate-800 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:border-blue-500"
        min={min}
        max={max}
      />
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