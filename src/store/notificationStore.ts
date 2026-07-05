import { create } from 'zustand';

export interface NotificationState {
  message: string;
  open: boolean;
  kind?: string;
}

const initialNotificationState: NotificationState = {
  message: '',
  open: false,
  kind: undefined,
};

export interface NotificationStore extends NotificationState {
  showNotification: (message: string, kind?: string) => void;
  hideNotification: () => void;
}

export const useNotificationStore = create<NotificationStore>()((set) => ({
  ...initialNotificationState,
  showNotification: (message, kind) => {
    set({
      message,
      open: true,
      kind,
    });
  },
  hideNotification: () => {
    set((state) => ({
      message: '',
      open: false,
      kind: state.kind,
    }));
  },
}));
