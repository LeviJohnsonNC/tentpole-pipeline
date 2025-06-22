
import { create } from 'zustand';
import { Quote } from '@/types/Quote';

interface QuoteStore {
  sessionQuotes: Quote[];
  addSessionQuote: (quote: Quote) => void;
  removeSessionQuote: (id: string) => void;
  updateSessionQuote: (id: string, updates: Partial<Quote>) => void;
  updateQuoteStatus: (id: string, status: Quote['status']) => void;
}

export const useQuoteStore = create<QuoteStore>((set, get) => ({
  sessionQuotes: [],
  
  addSessionQuote: (quote) =>
    set((state) => ({
      sessionQuotes: [...state.sessionQuotes, quote],
    })),
  
  removeSessionQuote: (id) =>
    set((state) => ({
      sessionQuotes: state.sessionQuotes.filter((q) => q.id !== id),
    })),
  
  updateSessionQuote: (id, updates) =>
    set((state) => ({
      sessionQuotes: state.sessionQuotes.map((q) =>
        q.id === id ? { ...q, ...updates } : q
      ),
    })),
    
  updateQuoteStatus: (id, status) => {
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
  },
}));
