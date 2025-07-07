
import { Quote } from '@/types/Quote';
import { Request } from '@/types/Request';

export const createMinimalRequestForQuote = (quote: Quote): Request => {
  const requestId = `auto-request-${quote.id}`;
  
  return {
    id: requestId,
    clientId: quote.clientId,
    title: `Quote Request - ${quote.quoteNumber}`,
    serviceDetails: quote.notes || 'Auto-generated request for quote',
    requestDate: quote.createdDate,
    status: 'New',
    notes: `Auto-generated request for quote ${quote.quoteNumber}`,
  };
};

export const generateRequestIdForQuote = (quoteId: string): string => {
  return `auto-request-${quoteId}`;
};
