// components/ui/Toast/useToast.ts
import { useState, useCallback } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { Toast, ToastVariant, ToastPosition } from './index';

export const useToast = () => {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const addToast = useCallback((toast: Omit<Toast, 'id'>) => {
    const id = uuidv4();
    const newToast = { ...toast, id };
    
    setToasts((prev) => {
      // Limit to 5 toasts maximum
      const updatedToasts = [...prev, newToast];
      return updatedToasts.slice(-5);
    });
    
    return id;
  }, []);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  }, []);

  const success = useCallback((title: string, message?: string, options?: Partial<Omit<Toast, 'id' | 'title' | 'message' | 'variant'>>) => {
    return addToast({ title, message, variant: 'success', ...options });
  }, [addToast]);

  const error = useCallback((title: string, message?: string, options?: Partial<Omit<Toast, 'id' | 'title' | 'message' | 'variant'>>) => {
    return addToast({ title, message, variant: 'error', ...options });
  }, [addToast]);

  const warning = useCallback((title: string, message?: string, options?: Partial<Omit<Toast, 'id' | 'title' | 'message' | 'variant'>>) => {
    return addToast({ title, message, variant: 'warning', ...options });
  }, [addToast]);

  const info = useCallback((title: string, message?: string, options?: Partial<Omit<Toast, 'id' | 'title' | 'message' | 'variant'>>) => {
    return addToast({ title, message, variant: 'info', ...options });
  }, [addToast]);

  const clearAll = useCallback(() => {
    setToasts([]);
  }, []);

  return {
    toasts,
    success,
    error,
    warning,
    info,
    removeToast,
    clearAll,
  };
};