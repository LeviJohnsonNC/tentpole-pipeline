
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
    const { isInitialized } = get();
    if (isInitialized) {
      console.log('Quote store already initialized, skipping static data initialization');
      return;
    }
    
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
  
  addSessionQuote: (quote) => {
    console.log('🎯 QUOTE STORE: Adding new quote:', quote.id, quote.title, 'status:', quote.status, 'amount:', quote.amount);
    console.log('🎯 QUOTE STORE: Quote details:', { clientId: quote.clientId, amount: quote.amount, property: quote.property });
    
    set((state) => {
      const newState = {
        sessionQuotes: [...state.sessionQuotes, quote],
      };
      
      console.log('🎯 QUOTE STORE: New state will have', newState.sessionQuotes.length, 'quotes');
      console.log('🎯 QUOTE STORE: Latest quotes:', newState.sessionQuotes.slice(-3).map(q => ({ id: q.id, status: q.status, clientId: q.clientId, amount: q.amount })));
      
      return newState;
    });
    
    // Force a small delay to ensure state propagation
    setTimeout(() => {
      const currentState = get();
      console.log('🎯 QUOTE STORE VERIFICATION: Current quotes after add:', currentState.sessionQuotes.length);
      console.log('🎯 QUOTE STORE VERIFICATION: Added quote exists:', !!currentState.sessionQuotes.find(q => q.id === quote.id));
    }, 100);
  },
  
  removeSessionQuote: (id) =>
    set((state) => ({
      sessionQuotes: state.sessionQuotes.filter((q) => q.id !== id),
    })),
  
  updateSessionQuote: (id, updates) => {
    console.log('🎯 QUOTE STORE: Updating quote:', id, 'with updates:', updates);
    set((state) => {
      const updatedQuotes = state.sessionQuotes.map((q) =>
        q.id === id ? { ...q, ...updates } : q
      );
      console.log('🎯 QUOTE STORE: Updated quote in store:', updatedQuotes.find(q => q.id === id));
      return {
        sessionQuotes: updatedQuotes
      };
    });
  },
    
  updateQuoteStatus: (id, status) => {
    console.log('🎯 QUOTE STORE: Updating quote status:', id, 'to:', status);
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
