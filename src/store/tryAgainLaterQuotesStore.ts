import { create } from 'zustand';

interface TryAgainLaterQuote {
  id: string;
  clientId: string;
  quoteNumber: string;
  title: string;
  property: string;
  amount: number;
  salesperson: string;
  notes: string;
  lastContactDate: string;
  nextFollowUpDate: string;
}

interface TryAgainLaterQuotesState {
  quotes: TryAgainLaterQuote[];
  addQuote: (quote: TryAgainLaterQuote) => void;
  removeQuote: (id: string) => void;
  updateQuote: (id: string, updates: Partial<TryAgainLaterQuote>) => void;
}

const defaultTryAgainLaterQuotes: TryAgainLaterQuote[] = [
  {
    id: 'quote-9',
    clientId: 'client-8',
    quoteNumber: 'Q-2025-009',
    title: 'Hedge Trimming and Shaping',
    property: '3421 Hillview Crescent NW',
    amount: 425.00,
    salesperson: 'Lisa Chen',
    notes: 'Client requested modifications to trimming approach. Follow up in 2 weeks.',
    lastContactDate: '2025-06-05',
    nextFollowUpDate: '2025-06-19'
  },
  {
    id: 'quote-14',
    clientId: 'client-9',
    quoteNumber: 'Q-2025-014',
    title: 'Playground Safety Surface Cleaning - Updated',
    property: '725 School Avenue NE',
    amount: 1150.00,
    salesperson: 'Lisa Chen',
    notes: 'Updated quote with additional sanitization. School board reviewing budget.',
    lastContactDate: '2025-06-13',
    nextFollowUpDate: '2025-06-27'
  }
];

export const useTryAgainLaterQuotesStore = create<TryAgainLaterQuotesState>((set) => ({
  quotes: defaultTryAgainLaterQuotes,
  
  addQuote: (quote) => set((state) => ({
    quotes: [...state.quotes, quote]
  })),
  
  removeQuote: (id) => set((state) => ({
    quotes: state.quotes.filter(quote => quote.id !== id)
  })),
  
  updateQuote: (id, updates) => set((state) => ({
    quotes: state.quotes.map(quote => 
      quote.id === id ? { ...quote, ...updates } : quote
    )
  }))
}));