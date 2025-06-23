
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
    console.log('Initializing client store with static data:', clientsData.length, 'clients');
    set({
      sessionClients: [...clientsData],
      isInitialized: true
    });
  },
  
  clearAllClients: () => {
    set({
      sessionClients: [],
      isInitialized: false
    });
  },
  
  addSessionClient: (client) => {
    console.log('Adding client to store:', client);
    set((state) => {
      const newState = { 
        sessionClients: [...state.sessionClients, client] 
      };
      console.log('New store state after adding client:', newState);
      return newState;
    });
  },
  
  removeSessionClient: (id) =>
    set((state) => ({
      sessionClients: state.sessionClients.filter(c => c.id !== id)
    })),
  
  updateSessionClient: (id, updates) =>
    set((state) => ({
      sessionClients: state.sessionClients.map(c => 
        c.id === id ? { ...c, ...updates } : c
      )
    })),
  
  getSessionClient: (id) => 
    get().sessionClients.find(c => c.id === id),
}));
