import React, { useEffect, useState } from 'react';
import { 
  X, 
  CheckCircle, 
  AlertCircle, 
  Info, 
  AlertTriangle,
  XCircle 
} from 'lucide-react';

export type ToastVariant = 'success' | 'error' | 'warning' | 'info';
export type ToastPosition = 
  | 'top-right' 
  | 'top-left' 
  | 'bottom-right' 
  | 'bottom-left'
  | 'top-center'
  | 'bottom-center'
  | 'center';

export interface Toast {
  id: string;
  title: string;
  message?: string;
  variant: ToastVariant;
  duration?: number;
  isPersistent?: boolean;
  action?: {
    label: string;
    onClick: () => void;
  };
}

interface ToastProps {
  toast: Toast;
  onClose: (id: string) => void;
}

const variantConfig = {
  success: {
    icon: CheckCircle,
    bgColor: 'bg-emerald-500/10',
    borderColor: 'border-emerald-500/20',
    iconColor: 'text-emerald-500',
    titleColor: 'text-emerald-400',
    textColor: 'text-emerald-300/80',
    buttonColor: 'hover:bg-emerald-500/10',
  },
  error: {
    icon: XCircle,
    bgColor: 'bg-red-500/10',
    borderColor: 'border-red-500/20',
    iconColor: 'text-red-500',
    titleColor: 'text-red-400',
    textColor: 'text-red-300/80',
    buttonColor: 'hover:bg-red-500/10',
  },
  warning: {
    icon: AlertTriangle,
    bgColor: 'bg-amber-500/10',
    borderColor: 'border-amber-500/20',
    iconColor: 'text-amber-500',
    titleColor: 'text-amber-400',
    textColor: 'text-amber-300/80',
    buttonColor: 'hover:bg-amber-500/10',
  },
  info: {
    icon: Info,
    bgColor: 'bg-blue-500/10',
    borderColor: 'border-blue-500/20',
    iconColor: 'text-blue-500',
    titleColor: 'text-blue-400',
    textColor: 'text-blue-300/80',
    buttonColor: 'hover:bg-blue-500/10',
  },
};

export const ToastComponent: React.FC<ToastProps> = ({ toast, onClose }) => {
  const [isLeaving, setIsLeaving] = useState(false);
  const config = variantConfig[toast.variant];
  const Icon = config.icon;

  useEffect(() => {
    if (!toast.isPersistent && toast.duration !== 0) {
      const timer = setTimeout(() => {
        setIsLeaving(true);
        setTimeout(() => onClose(toast.id), 300);
      }, toast.duration || 3000);

      return () => clearTimeout(timer);
    }
  }, [toast.id, toast.duration, toast.isPersistent, onClose]);

  const handleClose = () => {
    setIsLeaving(true);
    setTimeout(() => onClose(toast.id), 300);
  };

  const handleAction = () => {
    toast.action?.onClick();
    handleClose();
  };

  return (
    <div
      className={`
        relative w-80 p-4 rounded-xl border backdrop-blur-sm
        ${config.bgColor} ${config.borderColor}
        transform transition-all duration-300 ease-out
        ${isLeaving ? 'opacity-0 translate-x-full' : 'opacity-100 translate-x-0'}
        shadow-lg shadow-black/20
        animate-in slide-in-from-right-10
      `}
      role="alert"
      aria-live="assertive"
    >
      <div className="flex items-start gap-3">
        <div className="flex-shrink-0">
          <Icon className={`w-5 h-5 ${config.iconColor}`} />
        </div>
        
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <h4 className={`font-semibold text-sm ${config.titleColor}`}>
              {toast.title}
            </h4>
            <button
              onClick={handleClose}
              className={`flex-shrink-0 p-1 rounded-lg transition-colors ${config.buttonColor}`}
              aria-label="Close toast"
            >
              <X className="w-4 h-4 text-slate-400 hover:text-white" />
            </button>
          </div>
          
          {toast.message && (
            <p className={`mt-1 text-sm ${config.textColor}`}>
              {toast.message}
            </p>
          )}
          
          {toast.action && (
            <div className="mt-3">
              <button
                onClick={handleAction}
                className={`
                  px-3 py-1.5 text-xs font-medium rounded-lg
                  bg-white/5 border border-slate-700
                  hover:bg-white/10 transition-colors
                  ${config.titleColor}
                `}
              >
                {toast.action.label}
              </button>
            </div>
          )}
        </div>
      </div>
      
      {/* Progress bar for auto-dismiss toasts */}
      {!toast.isPersistent && toast.duration !== 0 && (
        <div className="absolute bottom-0 left-0 right-0 h-0.5 rounded-b-xl overflow-hidden">
          <div
            className={`
              h-full ${config.iconColor} transition-all duration-[${toast.duration || 3000}ms] ease-linear
              ${isLeaving ? 'w-0' : 'w-full'}
            `}
            style={{
              transition: `width ${toast.duration || 3000}ms linear`,
            }}
          />
        </div>
      )}
    </div>
  );
};