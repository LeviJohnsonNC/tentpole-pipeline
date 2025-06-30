
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
    const { isInitialized } = get();
    if (isInitialized) {
      console.log('Request store already initialized, skipping static data initialization');
      return;
    }
    
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
  
  addSessionRequest: (request) => {
    console.log('📝 REQUEST STORE: Adding new request:', request.id, 'status:', request.status);
    set((state) => ({
      sessionRequests: [...state.sessionRequests, request],
    }));
  },
    
  removeSessionRequest: (id) =>
    set((state) => ({
      sessionRequests: state.sessionRequests.filter((r) => r.id !== id),
    })),
    
  updateSessionRequest: (id, updates) => {
    console.log('📝 REQUEST STORE: Updating request:', id, 'with:', updates);
    set((state) => {
      const updatedRequests = state.sessionRequests.map((r) =>
        r.id === id ? { ...r, ...updates } : r
      );
      const updatedRequest = updatedRequests.find(r => r.id === id);
      console.log('📝 REQUEST STORE: Updated request:', updatedRequest ? { id: updatedRequest.id, status: updatedRequest.status, clientId: updatedRequest.clientId } : 'not found');
      return {
        sessionRequests: updatedRequests
      };
    });
  },
}));
