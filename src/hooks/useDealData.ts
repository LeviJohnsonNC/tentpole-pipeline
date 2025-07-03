
import { useMemo } from 'react';
import { useClientStore } from '@/store/clientStore';
import { useRequestStore } from '@/store/requestStore';
import { useQuoteStore } from '@/store/quoteStore';
import { Deal } from '@/components/pipeline/SalesPipelineData';
import { Client } from '@/types/Client';
import { Request } from '@/types/Request';
import { Quote } from '@/types/Quote';

export interface DealData {
  deal: Deal;
  client: Client | null;
  request: Request | null;
  quote: Quote | null;
  hasRequest: boolean;
  hasQuote: boolean;
  dealType: 'request-only' | 'quote-only' | 'request-and-quote';
}

export const useDealData = (dealId: string | null, deals: Deal[]): DealData | null => {
  const { sessionClients } = useClientStore();
  const { sessionRequests } = useRequestStore();
  const { sessionQuotes } = useQuoteStore();

  return useMemo(() => {
    if (!dealId) return null;

    const deal = deals.find(d => d.id === dealId);
    if (!deal) return null;

    // Find client by name (as deals store client name, not ID)
    const client = sessionClients.find(c => c.name === deal.client) || null;

    let request: Request | null = null;
    let quote: Quote | null = null;

    // Resolve request and quote based on deal type
    if (deal.type === 'request') {
      request = sessionRequests.find(r => r.id === deal.id) || null;
      // Check if this request has an associated quote
      if (request) {
        quote = sessionQuotes.find(q => q.requestId === request!.id) || null;
      }
    } else if (deal.type === 'quote' && deal.quoteId) {
      quote = sessionQuotes.find(q => q.id === deal.quoteId) || null;
      // Check if this quote has an associated request
      if (quote && quote.requestId) {
        request = sessionRequests.find(r => r.id === quote!.requestId) || null;
      }
    }

    const hasRequest = !!request;
    const hasQuote = !!quote;

    let dealType: 'request-only' | 'quote-only' | 'request-and-quote';
    if (hasRequest && hasQuote) {
      dealType = 'request-and-quote';
    } else if (hasRequest) {
      dealType = 'request-only';
    } else {
      dealType = 'quote-only';
    }

    return {
      deal,
      client,
      request,
      quote,
      hasRequest,
      hasQuote,
      dealType
    };
  }, [dealId, deals, sessionClients, sessionRequests, sessionQuotes]);
};
