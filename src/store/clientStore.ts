
import { create } from 'zustand';
import { Client } from '@/types/Client';

interface ClientStore {
  sessionClients: Client[];
  addSessionClient: (client: Client) => void;
  removeSessionClient: (id: string) => void;
  updateSessionClient: (id: string, updates: Partial<Client>) => void;
  getSessionClient: (id: string) => Client | undefined;
}

export const useClientStore = create<ClientStore>((set, get) => ({
  sessionClients: [],
  
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
