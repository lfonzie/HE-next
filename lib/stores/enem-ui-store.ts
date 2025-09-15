import { create } from 'zustand';

export interface LoadingState {
  isLoading: boolean;
  loadingMessage: string;
  progress?: number;
}

export interface ErrorState {
  hasError: boolean;
  errorMessage: string;
  errorDetails?: any;
}

export interface ToastMessage {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  message: string;
  duration?: number;
  action?: {
    label: string;
    onClick: () => void;
  };
}

export interface ModalState {
  isOpen: boolean;
  type: 'confirmation' | 'info' | 'custom';
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  onConfirm?: () => void;
  onCancel?: () => void;
  customContent?: React.ReactNode;
}

export interface ThemeState {
  theme: 'light' | 'dark' | 'auto';
  highContrast: boolean;
  fontSize: 'small' | 'medium' | 'large';
  reducedMotion: boolean;
}

interface EnemUIState {
  // Loading states
  loading: LoadingState;
  
  // Error states
  error: ErrorState;
  
  // Toast notifications
  toasts: ToastMessage[];
  
  // Modal states
  modal: ModalState;
  
  // Theme and accessibility
  theme: ThemeState;
  
  // Actions
  setLoading: (loading: Partial<LoadingState>) => void;
  clearLoading: () => void;
  
  setError: (error: Partial<ErrorState>) => void;
  clearError: () => void;
  
  addToast: (toast: Omit<ToastMessage, 'id'>) => void;
  removeToast: (id: string) => void;
  clearToasts: () => void;
  
  showModal: (modal: Partial<ModalState>) => void;
  hideModal: () => void;
  
  setTheme: (theme: Partial<ThemeState>) => void;
  
  // Utility
  showSuccessToast: (title: string, message: string) => void;
  showErrorToast: (title: string, message: string) => void;
  showWarningToast: (title: string, message: string) => void;
  showInfoToast: (title: string, message: string) => void;
  
  showConfirmationModal: (
    title: string,
    message: string,
    onConfirm: () => void,
    confirmText?: string,
    cancelText?: string
  ) => void;
}

const initialLoading: LoadingState = {
  isLoading: false,
  loadingMessage: '',
  progress: undefined
};

const initialError: ErrorState = {
  hasError: false,
  errorMessage: '',
  errorDetails: undefined
};

const initialModal: ModalState = {
  isOpen: false,
  type: 'info',
  title: '',
  message: '',
  confirmText: 'Confirmar',
  cancelText: 'Cancelar'
};

const initialTheme: ThemeState = {
  theme: 'auto',
  highContrast: false,
  fontSize: 'medium',
  reducedMotion: false
};

export const useEnemUIStore = create<EnemUIState>((set, get) => ({
  // Initial state
  loading: initialLoading,
  error: initialError,
  toasts: [],
  modal: initialModal,
  theme: initialTheme,

  // Loading actions
  setLoading: (loading) =>
    set((state) => ({
      loading: { ...state.loading, ...loading }
    })),

  clearLoading: () =>
    set({ loading: initialLoading }),

  // Error actions
  setError: (error) =>
    set((state) => ({
      error: { ...state.error, ...error }
    })),

  clearError: () =>
    set({ error: initialError }),

  // Toast actions
  addToast: (toast) => {
    const id = `toast-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const newToast: ToastMessage = {
      id,
      duration: 5000,
      ...toast
    };

    set((state) => ({
      toasts: [...state.toasts, newToast]
    }));

    // Auto-remove toast after duration
    if (newToast.duration && newToast.duration > 0) {
      setTimeout(() => {
        get().removeToast(id);
      }, newToast.duration);
    }
  },

  removeToast: (id) =>
    set((state) => ({
      toasts: state.toasts.filter(toast => toast.id !== id)
    })),

  clearToasts: () =>
    set({ toasts: [] }),

  // Modal actions
  showModal: (modal) =>
    set((state) => ({
      modal: { ...state.modal, ...modal, isOpen: true }
    })),

  hideModal: () =>
    set((state) => ({
      modal: { ...state.modal, isOpen: false }
    })),

  // Theme actions
  setTheme: (theme) =>
    set((state) => ({
      theme: { ...state.theme, ...theme }
    })),

  // Utility methods
  showSuccessToast: (title, message) =>
    get().addToast({
      type: 'success',
      title,
      message
    }),

  showErrorToast: (title, message) =>
    get().addToast({
      type: 'error',
      title,
      message
    }),

  showWarningToast: (title, message) =>
    get().addToast({
      type: 'warning',
      title,
      message
    }),

  showInfoToast: (title, message) =>
    get().addToast({
      type: 'info',
      title,
      message
    }),

  showConfirmationModal: (title, message, onConfirm, confirmText, cancelText) =>
    get().showModal({
      type: 'confirmation',
      title,
      message,
      onConfirm,
      confirmText,
      cancelText
    })
}));
