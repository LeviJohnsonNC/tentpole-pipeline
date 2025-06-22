
import { create } from 'zustand';
import { Request } from '@/types/Request';

interface RequestStore {
  sessionRequests: Request[];
  addSessionRequest: (request: Request) => void;
  removeSessionRequest: (id: string) => void;
  updateSessionRequest: (id: string, updates: Partial<Request>) => void;
}

export const useRequestStore = create<RequestStore>((set) => ({
  sessionRequests: [],
  addSessionRequest: (request) =>
    set((state) => ({
      sessionRequests: [...state.sessionRequests, request],
    })),
  removeSessionRequest: (id) =>
    set((state) => ({
      sessionRequests: state.sessionRequests.filter((r) => r.id !== id),
    })),
  updateSessionRequest: (id, updates) =>
    set((state) => ({
      sessionRequests: state.sessionRequests.map((r) =>
        r.id === id ? { ...r, ...updates } : r
      ),
    })),
}));
