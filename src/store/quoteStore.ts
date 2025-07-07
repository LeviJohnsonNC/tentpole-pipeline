
import { create } from 'zustand';
import { Quote } from '@/types/Quote';
import { quotesData } from '@/data/quotesData';
import { createMinimalRequestForQuote } from '@/utils/autoRequestHelpers';

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
    console.log('🎯 QUOTE STORE: Quote details:', { 
      clientId: quote.clientId, 
      requestId: quote.requestId || 'NONE (standalone)',
      amount: quote.amount, 
      property: quote.property,
      status: quote.status,
      createdDate: quote.createdDate
    });
    
    // ENHANCED: Ensure standalone quotes have "Draft" status if not specified
    const enhancedQuote = {
      ...quote,
      status: quote.status || 'Draft' as Quote['status'], // Default to Draft for new quotes
      createdDate: quote.createdDate || new Date().toISOString() // Ensure createdDate exists
    };
    
    // NEW: Auto-create request for standalone quotes
    if (!enhancedQuote.requestId) {
      console.log('🎯 QUOTE STORE: Standalone quote detected, creating auto-request');
      const autoRequest = createMinimalRequestForQuote(enhancedQuote);
      
      // Add the request to the request store
      try {
        const { useRequestStore } = require('@/store/requestStore');
        const requestStore = useRequestStore.getState();
        requestStore.addSessionRequest(autoRequest);
        
        // Link the quote to the auto-generated request
        enhancedQuote.requestId = autoRequest.id;
        console.log('🎯 QUOTE STORE: Auto-request created with ID:', autoRequest.id);
      } catch (error) {
        console.error('🎯 QUOTE STORE: Failed to create auto-request:', error);
        // Continue without request linking if there's an error
      }
    }
    
    console.log('🎯 QUOTE STORE: Enhanced quote before adding:', {
      id: enhancedQuote.id,
      status: enhancedQuote.status,
      amount: enhancedQuote.amount,
      createdDate: enhancedQuote.createdDate,
      requestId: enhancedQuote.requestId,
      isStandalone: !enhancedQuote.requestId
    });
    
    set((state) => {
      const newState = {
        sessionQuotes: [...state.sessionQuotes, enhancedQuote],
      };
      
      console.log('🎯 QUOTE STORE: New state will have', newState.sessionQuotes.length, 'quotes');
      console.log('🎯 QUOTE STORE: Latest quotes:', newState.sessionQuotes.slice(-3).map(q => ({ 
        id: q.id, 
        status: q.status, 
        clientId: q.clientId, 
        amount: q.amount,
        requestId: q.requestId,
        isStandalone: !q.requestId
      })));
      
      return newState;
    });
    
    // Force a small delay to ensure state propagation
    setTimeout(() => {
      const currentState = get();
      console.log('🎯 QUOTE STORE VERIFICATION: Current quotes after add:', currentState.sessionQuotes.length);
      const addedQuote = currentState.sessionQuotes.find(q => q.id === enhancedQuote.id);
      console.log('🎯 QUOTE STORE VERIFICATION: Added quote exists:', !!addedQuote);
      if (addedQuote) {
        console.log('🎯 QUOTE STORE VERIFICATION: Added quote details:', {
          id: addedQuote.id,
          status: addedQuote.status,
          amount: addedQuote.amount,
          requestId: addedQuote.requestId,
          isStandalone: !addedQuote.requestId,
          createdDate: addedQuote.createdDate
        });
      }
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
