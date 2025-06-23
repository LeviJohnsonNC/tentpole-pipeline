
import { create } from 'zustand';
import { Request } from '@/types/Request';
import { requestsData } from '@/data/requestsData';

interface RequestStore {
  sessionRequests: Request[];
  isInitialized: boolean;
  addSessionRequest: (request: Request) => void;
  removeSessionRequest: (id: string) => void;
  updateSessionRequest: (id: string, updates: Partial<Request>) => void;
  initializeWithStaticData: () => void;
  clearAllRequests: () => void;
}

export const useRequestStore = create<RequestStore>((set, get) => ({
  sessionRequests: [],
  isInitialized: false,
  
  initializeWithStaticData: () => {
    console.log('Initializing request store with static data:', requestsData.length, 'requests');
    set({
      sessionRequests: [...requestsData],
      isInitialized: true
    });
  },
  
  clearAllRequests: () => {
    set({
      sessionRequests: [],
      isInitialized: false
    });
  },
  
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
