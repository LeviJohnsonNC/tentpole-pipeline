
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
    // Optional fields can be undefined
    contactMethod: undefined,
    priority: undefined,
    estimatedValue: quote.amount,
    followUpDate: undefined,
    notes: `Auto-generated request for quote ${quote.quoteNumber}`,
    lastActivityDate: quote.createdDate,
    source: 'Quote Creation'
  };
};

export const generateRequestIdForQuote = (quoteId: string): string => {
  return `auto-request-${quoteId}`;
};
