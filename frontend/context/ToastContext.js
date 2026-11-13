'use client';

import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  useMemo,
  useEffect,
  useRef,
} from 'react';
import {
  CheckCircle2,
  AlertCircle,
  AlertTriangle,
  Info,
  X,
} from 'lucide-react';

const ToastContext = createContext(null);

const formatToastMessage = (message) => {
  if (message === null || message === undefined) return '';
  if (typeof message === 'string') return message;
  if (message instanceof Error) return message.message || 'An error occurred';
  if (typeof message === 'object') {
    return (
      message.message ||
      message.msg ||
      message.error ||
      (message.statusText ? `Error: ${message.statusText}` : JSON.stringify(message))
    );
  }
  return String(message);
};

export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);
  const timersRef = useRef(new Map());

  // Gracefully remove toast with exit animation
  const removeToast = useCallback((id) => {
    // Clear any existing auto-dismiss timer
    if (timersRef.current.has(id)) {
      clearTimeout(timersRef.current.get(id));
      timersRef.current.delete(id);
    }

    // Set exiting state first to allow smooth slide-out animation
    setToasts((prev) =>
      prev.map((t) => (t.id === id ? { ...t, isExiting: true } : t))
    );

    // Completely unmount after exit animation finishes (200ms)
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 200);
  }, []);

  const showToast = useCallback(
    (rawMessage, type = 'success', duration = 4000) => {
      const message = formatToastMessage(rawMessage);
      if (!message || message.trim() === '') return;

      const id = Date.now() + Math.random().toString(36).substring(2, 9);
      const newToast = {
        id,
        message,
        type: ['success', 'error', 'warning', 'alert', 'info'].includes(type)
          ? type
          : 'info',
        isExiting: false,
      };

      // Limit to latest 4 toasts to avoid screen clutter
      setToasts((prev) => [...prev.slice(-3), newToast]);

      if (duration > 0) {
        const timer = setTimeout(() => {
          removeToast(id);
        }, duration);
        timersRef.current.set(id, timer);
      }
    },
    [removeToast]
  );

  // Alias showAlert to showToast for backward-compatibility
  const showAlert = useCallback(
    (message, type = 'info', duration = 4000) => {
      showToast(message, type, duration);
    },
    [showToast]
  );

  // Stable object-style toast helpers: toast.success(), toast.error(), etc.
  const toast = useMemo(
    () => ({
      success: (msg, dur) => showToast(msg, 'success', dur),
      error: (msg, dur) => showToast(msg, 'error', dur),
      info: (msg, dur) => showToast(msg, 'info', dur),
      warning: (msg, dur) => showToast(msg, 'warning', dur),
      alert: (msg, dur) => showToast(msg, 'alert', dur),
      dismiss: (id) => removeToast(id),
      clear: () => {
        timersRef.current.forEach((timer) => clearTimeout(timer));
        timersRef.current.clear();
        setToasts([]);
      },
    }),
    [showToast, removeToast]
  );

  // Intercept window.alert and custom event pt_toast
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const originalAlert = window.alert;
    window.alert = (msg) => {
      showToast(msg, 'info', 4500);
    };

    const handleCustomToast = (e) => {
      if (e?.detail?.message) {
        showToast(e.detail.message, e.detail.type || 'info', e.detail.duration || 4000);
      }
    };

    window.addEventListener('pt_toast', handleCustomToast);

    return () => {
      window.alert = originalAlert;
      window.removeEventListener('pt_toast', handleCustomToast);
    };
  }, [showToast]);

  // Clean up all timers on unmount
  useEffect(() => {
    return () => {
      timersRef.current.forEach((timer) => clearTimeout(timer));
      timersRef.current.clear();
    };
  }, []);

  return (
    <ToastContext.Provider value={{ showToast, showAlert, toast }}>
      {children}

      {/* Floating Toast Notification Container - Always on top (z-[99999]) */}
      <div
        className="fixed top-4 sm:top-5 right-3 sm:right-6 left-3 sm:left-auto z-[99999] pointer-events-none flex flex-col gap-2.5 max-w-sm sm:max-w-md w-full sm:w-auto"
        aria-live="polite"
        role="region"
        aria-label="Notifications"
      >
        {toasts.map((t) => {
          const isSuccess = t.type === 'success';
          const isError = t.type === 'error';
          const isWarning = t.type === 'warning' || t.type === 'alert';
          const isInfo = !isSuccess && !isError && !isWarning;

          return (
            <div
              key={t.id}
              className={`pointer-events-auto flex items-center justify-between gap-3 p-3.5 sm:p-4 rounded-2xl bg-white/95 backdrop-blur-md border shadow-[0_12px_36px_rgba(15,17,15,0.12)] text-sm transition-all duration-200 select-none ${
                t.isExiting ? 'pt-toast-leave' : 'pt-toast-enter'
              } ${
                isSuccess
                  ? 'border-[#3f7a1e]/25 text-[#0f110f]'
                  : isError
                  ? 'border-[#d96c6c]/35 text-[#991b1b]'
                  : isWarning
                  ? 'border-[#f59e0b]/35 text-[#92400e]'
                  : 'border-[#0f110f]/15 text-[#0f110f]'
              }`}
            >
              <div className="flex items-center gap-3 min-w-0 flex-1">
                {isSuccess && (
                  <div className="w-7 h-7 rounded-xl bg-[#f1f7da] text-[#3f7a1e] flex items-center justify-center shrink-0">
                    <CheckCircle2 className="w-4 h-4" strokeWidth={2.5} />
                  </div>
                )}
                {isError && (
                  <div className="w-7 h-7 rounded-xl bg-[#ffd9c7]/70 text-[#d96c6c] flex items-center justify-center shrink-0">
                    <AlertCircle className="w-4 h-4" strokeWidth={2.5} />
                  </div>
                )}
                {isWarning && (
                  <div className="w-7 h-7 rounded-xl bg-[#fef3c7] text-[#d97706] flex items-center justify-center shrink-0">
                    <AlertTriangle className="w-4 h-4" strokeWidth={2.5} />
                  </div>
                )}
                {isInfo && (
                  <div className="w-7 h-7 rounded-xl bg-[#f6f6f5] text-[#0f110f] flex items-center justify-center shrink-0">
                    <Info className="w-4 h-4" strokeWidth={2.5} />
                  </div>
                )}
                <span className="font-medium text-xs sm:text-[13px] leading-snug break-words">
                  {t.message}
                </span>
              </div>

              <button
                type="button"
                onClick={() => removeToast(t.id)}
                className="w-6 h-6 rounded-full flex items-center justify-center text-[#6b6b68] hover:text-[#0f110f] hover:bg-black/5 transition-colors shrink-0"
                aria-label="Dismiss notification"
              >
                <X className="w-3.5 h-3.5" strokeWidth={2.2} />
              </button>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
};

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};
