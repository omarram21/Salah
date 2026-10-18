import { create } from 'zustand';

import type { PermissionStatus } from '../services/notification-service';

/** In-memory only: the OS is the source of truth and is re-checked on every app open. */
export const useNotificationPermission = create<{
  status: PermissionStatus | null;
  setStatus: (status: PermissionStatus) => void;
}>()((set) => ({
  status: null,
  setStatus: (status) => set({ status }),
}));
