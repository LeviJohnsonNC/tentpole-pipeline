
import { create } from 'zustand';
import { Quote } from '@/types/Quote';
import { quotesData } from '@/data/quotesData';

interface QuoteStore {
  sessionQuotes: Quote[];
  isInitialized: boolean;
  addSessionQuote: (quote: Quote) => void;
  removeSessionQuote: (id: string) => void;
  updateSessionQuote: (id: string, updates: Partial<Quote>) => void;
  updateQuoteStatus: (id: string, status: Quote['status']) => void;
  initializeWithStaticData: () => void;
  clearAllQuotes: () => void;
}

export const useQuoteStore = create<QuoteStore>((set, get) => ({
  sessionQuotes: [],
  isInitialized: false,
  
  initializeWithStaticData: () => {
    console.log('Initializing quote store with static data:', quotesData.length, 'quotes');
    set({
      sessionQuotes: [...quotesData],
      isInitialized: true
    });
  },
  
  clearAllQuotes: () => {
    set({
      sessionQuotes: [],
      isInitialized: false
    });
  },
  
  addSessionQuote: (quote) =>
    set((state) => ({
      sessionQuotes: [...state.sessionQuotes, quote],
    })),
  
  removeSessionQuote: (id) =>
    set((state) => ({
      sessionQuotes: state.sessionQuotes.filter((q) => q.id !== id),
    })),
  
  updateSessionQuote: (id, updates) =>
    set((state) => {
      console.log('Updating quote:', id, 'with updates:', updates);
      const updatedQuotes = state.sessionQuotes.map((q) =>
        q.id === id ? { ...q, ...updates } : q
      );
      console.log('Updated quote in store:', updatedQuotes.find(q => q.id === id));
      return {
        sessionQuotes: updatedQuotes
      };
    }),
    
  updateQuoteStatus: (id, status) => {
    console.log('Updating quote status:', id, 'to:', status);
    const { updateSessionQuote } = get();
    const updates: Partial<Quote> = { status };
    
    // Add timestamps based on status
    const now = new Date().toISOString();
    if (status === 'Awaiting Response') {
      updates.sentDate = now;
    } else if (status === 'Approved') {
      updates.approvedDate = now;
    } else if (status === 'Converted') {
      updates.convertedDate = now;
    }
    
    updateSessionQuote(id, updates);
    
    // Note: Business rule handling (updating requests/clients) should be done 
    // by the component that calls this, using handleQuoteStatusChange from dataHelpers
  },
}));
