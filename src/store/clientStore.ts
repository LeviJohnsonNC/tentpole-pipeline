
import { create } from 'zustand';
import { Client } from '@/types/Client';
import { clientsData } from '@/data/clientsData';

interface ClientStore {
  sessionClients: Client[];
  isInitialized: boolean;
  addSessionClient: (client: Client) => void;
  removeSessionClient: (id: string) => void;
  updateSessionClient: (id: string, updates: Partial<Client>) => void;
  getSessionClient: (id: string) => Client | undefined;
  initializeWithStaticData: () => void;
  clearAllClients: () => void;
}

export const useClientStore = create<ClientStore>((set, get) => ({
  sessionClients: [],
  isInitialized: false,
  
  initializeWithStaticData: () => {
    const { isInitialized, sessionClients } = get();
    
    // Always log the current state for debugging
    console.log('Client store initialization check:', {
      isInitialized,
      currentClientsCount: sessionClients.length,
      staticDataCount: clientsData.length
    });
    
    // Only initialize if store is completely empty (no clients at all)
    if (sessionClients.length > 0) {
      console.log('Client store has existing clients, skipping static data initialization');
      // Ensure we mark as initialized if we have clients
      if (!isInitialized) {
        set({ isInitialized: true });
      }
      return;
    }
    
    console.log('Initializing client store with static data:', clientsData.length, 'clients');
    set({
      sessionClients: [...clientsData],
      isInitialized: true
    });
    
    // Log final state after initialization
    const finalState = get();
    console.log('Client store initialized - final state:', {
      clientsCount: finalState.sessionClients.length,
      isInitialized: finalState.isInitialized
    });
  },
  
  clearAllClients: () => {
    console.log('Clearing all clients from store');
    set({
      sessionClients: [],
      isInitialized: false
    });
  },
  
  addSessionClient: (client) => {
    console.log('Adding client to store:', client);
    set((state) => {
      const newState = { 
        sessionClients: [...state.sessionClients, client],
        isInitialized: true // Ensure we stay initialized when adding clients
      };
      console.log('New store state after adding client:', {
        clientsCount: newState.sessionClients.length,
        newClientId: client.id,
        newClientName: client.name,
        isInitialized: newState.isInitialized
      });
      return newState;
    });
  },
  
  removeSessionClient: (id) => {
    console.log('Removing client from store:', id);
    set((state) => ({
      sessionClients: state.sessionClients.filter(c => c.id !== id),
      isInitialized: true // Maintain initialized state
    }));
  },
  
  updateSessionClient: (id, updates) => {
    console.log('Updating client in store:', id, updates);
    set((state) => ({
      sessionClients: state.sessionClients.map(c => 
        c.id === id ? { ...c, ...updates } : c
      ),
      isInitialized: true // Maintain initialized state
    }));
  },
  
  getSessionClient: (id) => 
    get().sessionClients.find(c => c.id === id),
}));
