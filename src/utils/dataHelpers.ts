import { Client } from '@/types/Client';
import { Request } from '@/types/Request';
import { Quote } from '@/types/Quote';
import { clientsData } from '@/data/clientsData';
import { requestsData } from '@/data/requestsData';
import { quotesData } from '@/data/quotesData';

// Client operations
export const getClientById = (id: string, sessionClients: Client[] = []): Client | undefined => {
  // Check session clients first
  const sessionClient = sessionClients.find(client => client.id === id);
  if (sessionClient) return sessionClient;
  
  return clientsData.find(client => client.id === id);
};

export const getAllClients = (sessionClients: Client[] = []): Client[] => {
  return [...clientsData, ...sessionClients];
};

// Request operations
export const getRequestById = (id: string, sessionRequests: Request[] = []): Request | undefined => {
  // Check session requests first
  const sessionRequest = sessionRequests.find(request => request.id === id);
  if (sessionRequest) return sessionRequest;
  
  return requestsData.find(request => request.id === id);
};

export const getAllRequests = (sessionRequests: Request[] = []): Request[] => {
  return [...requestsData, ...sessionRequests];
};

export const getRequestsByClientId = (clientId: string, sessionRequests: Request[] = []): Request[] => {
  const allRequests = getAllRequests(sessionRequests);
  return allRequests.filter(request => request.clientId === clientId);
};

export const getClientByRequestId = (requestId: string, sessionClients: Client[] = [], sessionRequests: Request[] = []): Client | undefined => {
  const request = getRequestById(requestId, sessionRequests);
  if (!request) return undefined;
  return getClientById(request.clientId, sessionClients);
};

// Quote operations
export const getQuoteById = (id: string, sessionQuotes: Quote[] = []): Quote | undefined => {
  // Check session quotes first - they override static data
  const sessionQuote = sessionQuotes.find(quote => quote.id === id);
  if (sessionQuote) return sessionQuote;
  
  return quotesData.find(quote => quote.id === id);
};

export const getAllQuotes = (sessionQuotes: Quote[] = []): Quote[] => {
  // Create a map of session quotes for efficient lookup
  const sessionQuoteMap = new Map(sessionQuotes.map(quote => [quote.id, quote]));
  
  // Start with static quotes but replace any that exist in session
  const staticQuotesFiltered = quotesData.filter(quote => !sessionQuoteMap.has(quote.id));
  
  // Combine: session quotes take priority, then non-overridden static quotes
  return [...sessionQuotes, ...staticQuotesFiltered];
};

export const getQuotesByClientId = (clientId: string, sessionQuotes: Quote[] = []): Quote[] => {
  const allQuotes = getAllQuotes(sessionQuotes);
  return allQuotes.filter(quote => quote.clientId === clientId);
};

export const getQuotesByRequestId = (requestId: string, sessionQuotes: Quote[] = []): Quote[] => {
  const allQuotes = getAllQuotes(sessionQuotes);
  return allQuotes.filter(quote => quote.requestId === requestId);
};

// Combined operations for table display
export interface RequestWithClient extends Request {
  client: Client;
}

export const getRequestsWithClientInfo = (sessionClients: Client[] = [], sessionRequests: Request[] = []): RequestWithClient[] => {
  const allRequests = getAllRequests(sessionRequests);
  return allRequests.map(request => {
    const client = getClientById(request.clientId, sessionClients);
    if (!client) {
      throw new Error(`Client not found for request ${request.id}`);
    }
    return {
      ...request,
      client
    };
  });
};

export interface QuoteWithClient extends Quote {
  client: Client;
}

export const getQuotesWithClientInfo = (sessionClients: Client[] = [], sessionQuotes: Quote[] = []): QuoteWithClient[] => {
  const allQuotes = getAllQuotes(sessionQuotes);
  return allQuotes.map(quote => {
    const client = getClientById(quote.clientId, sessionClients);
    if (!client) {
      throw new Error(`Client not found for quote ${quote.id}`);
    }
    return {
      ...quote,
      client
    };
  });
};

// Enhanced business logic for quote status changes with new rules
export const handleQuoteStatusChange = (
  quoteId: string, 
  newStatus: Quote['status'],
  sessionQuotes: Quote[] = [],
  sessionRequests: Request[] = [],
  sessionClients: Client[] = [],
  updateQuote: (id: string, updates: Partial<Quote>) => void,
  updateRequest: (id: string, updates: Partial<Request>) => void,
  updateClient: (id: string, updates: Partial<Client>) => void
) => {
  const quote = getQuoteById(quoteId, sessionQuotes);
  if (!quote) return false;

  console.log('Processing quote status change:', quoteId, 'to:', newStatus);

  // If quote is being approved or converted, handle business rules
  if (newStatus === 'Approved' || newStatus === 'Converted') {
    console.log('Quote approved/converted - applying business rules');
    
    // 1. Update linked request to 'Converted' if it exists
    if (quote.requestId) {
      const request = getRequestById(quote.requestId, sessionRequests);
      if (request && request.status !== 'Converted') {
        console.log('Updating linked request to Converted:', quote.requestId);
        updateRequest(quote.requestId, { status: 'Converted' });
      }
    }

    // 2. Update client to 'Active' if they're currently a 'Lead'
    const client = getClientById(quote.clientId, sessionClients);
    if (client && client.status === 'Lead') {
      console.log('Updating client from Lead to Active:', quote.clientId);
      updateClient(quote.clientId, { status: 'Active' });
    }
  }

  // Update the quote status with appropriate timestamps
  const updates: Partial<Quote> = { status: newStatus };
  const now = new Date().toISOString();
  
  if (newStatus === 'Awaiting Response' && !quote.sentDate) {
    updates.sentDate = now;
  } else if (newStatus === 'Approved' && !quote.approvedDate) {
    updates.approvedDate = now;
  } else if (newStatus === 'Converted' && !quote.convertedDate) {
    updates.convertedDate = now;
  }

  updateQuote(quoteId, updates);
  console.log('Quote status updated successfully');
  return true;
};

// Quote metrics calculations
export const calculateQuoteMetrics = (quotes: Quote[]) => {
  const total = quotes.length;
  const draft = quotes.filter(q => q.status === 'Draft').length;
  const awaitingResponse = quotes.filter(q => q.status === 'Awaiting Response').length;
  const approved = quotes.filter(q => q.status === 'Approved').length;
  const converted = quotes.filter(q => q.status === 'Converted').length;
  const sent = quotes.filter(q => q.sentDate).length;
  
  const conversionRate = sent > 0 ? Math.round(((approved + converted) / sent) * 100) : 0;
  
  return {
    total,
    draft,
    awaitingResponse,
    approved,
    converted,
    sent,
    conversionRate
  };
};

// Validation functions
export const validateRequestHasClient = (request: Partial<Request>, sessionClients: Client[] = []): boolean => {
  if (!request.clientId) return false;
  return !!getClientById(request.clientId, sessionClients);
};

export const canDeleteClient = (clientId: string, sessionRequests: Request[] = []): boolean => {
  const clientRequests = getRequestsByClientId(clientId, sessionRequests);
  return clientRequests.length === 0;
};
