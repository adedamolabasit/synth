import React from 'react';
import { ToastComponent, Toast, ToastPosition } from './index';

interface ToastContainerProps {
  toasts: Toast[];
  position?: ToastPosition;
  onClose: (id: string) => void;
}

const positionClasses = {
  'top-right': 'top-4 right-4',
  'top-left': 'top-4 left-4',
  'bottom-right': 'bottom-4 right-4',
  'bottom-left': 'bottom-4 left-4',
  'top-center': 'top-4 left-1/2 -translate-x-1/2',
  'bottom-center': 'bottom-4 left-1/2 -translate-x-1/2',
  'center': 'top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2',
};

export const ToastContainer: React.FC<ToastContainerProps> = ({
  toasts,
  position = 'top-right',
  onClose,
}) => {
  const isCenterPosition = position.includes('center');
  
  return (
    <div
      className={`
        fixed z-[9999] flex flex-col gap-3
        ${positionClasses[position]}
        pointer-events-none
        ${isCenterPosition ? 'items-center' : ''}
      `}
    >
      {toasts.map((toast) => (
        <div 
          key={toast.id} 
          className={`pointer-events-auto ${isCenterPosition ? 'w-full max-w-md' : ''}`}
        >
          <ToastComponent toast={toast} onClose={onClose} />
        </div>
      ))}
    </div>
  );
};