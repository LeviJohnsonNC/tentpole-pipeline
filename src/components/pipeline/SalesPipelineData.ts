import { getRequestsWithClientInfo, RequestWithClient, getQuotesWithClientInfo, QuoteWithClient } from '@/utils/dataHelpers';

interface Deal {
  id: string;
  client: string;
  title: string;
  property: string;
  contact: string;
  requested: string;
  amount: number;
  status: string; // Pipeline status, not request status
  type: 'request' | 'quote'; // New field to distinguish between requests and quotes
  quoteId?: string; // Optional field for quote-based deals
}

// Mapping function to assign pipeline stages to "New" requests
const assignPipelineStage = (requestId: string): string => {
  // All new session requests should go to 'new-deals'
  if (requestId.startsWith('request-' + Date.now().toString().slice(0, 8))) {
    return 'new-deals';
  }
  
  // Map specific requests to pipeline stages for realistic distribution
  const stageMapping: Record<string, string> = {
    // New deals (just received)
    'request-1': 'new-deals',
    'request-2': 'new-deals', 
    'request-3': 'new-deals',
    'request-4': 'new-deals',
    
    // Contacted (initial contact made)
    'request-5': 'contacted',
    'request-6': 'contacted',
    'request-7': 'contacted',
    
    // Quote sent (quotes provided)
    'request-8': 'quote-sent',
    'request-9': 'quote-sent',
    'request-10': 'quote-sent',
    'request-11': 'quote-sent',
    
    // Follow-up (awaiting decisions)
    'request-12': 'followup',
    'request-13': 'followup',
    'request-14': 'followup'
  };
  
  return stageMapping[requestId] || 'new-deals';
};

// Function to determine pipeline stage for quotes
const assignQuotePipelineStage = (stages: any[]): string => {
  // Check if "Draft Quote" stage exists
  const draftQuoteStage = stages.find(stage => 
    stage.title.toLowerCase().includes('draft') && stage.title.toLowerCase().includes('quote')
  );
  
  if (draftQuoteStage) {
    return draftQuoteStage.id;
  }
  
  // Fallback to "New Deals"
  return 'new-deals';
};

// Function to find the most recent quote for a request
const getMostRecentQuoteForRequest = (requestId: string, quotes: any[]): any | null => {
  const requestQuotes = quotes.filter(quote => quote.requestId === requestId);
  if (requestQuotes.length === 0) return null;
  
  // Sort by creation date and return the most recent
  return requestQuotes.sort((a, b) => new Date(b.createdDate).getTime() - new Date(a.createdDate).getTime())[0];
};

// Function to determine if a request should be moved to draft quote stage
const shouldMoveRequestToDraftQuote = (requestId: string, sessionQuotes: any[], stages: any[]): string | null => {
  const mostRecentQuote = getMostRecentQuoteForRequest(requestId, sessionQuotes);
  if (!mostRecentQuote) return null;
  
  // Check if "Draft Quote" stage exists
  const draftQuoteStage = stages.find(stage => 
    stage.title.toLowerCase().includes('draft') && stage.title.toLowerCase().includes('quote')
  );
  
  return draftQuoteStage ? draftQuoteStage.id : null;
};

// Sample pricing based on service type
const getEstimatedAmount = (serviceDetails: string, title: string): number => {
  const details = serviceDetails.toLowerCase();
  const titleLower = title.toLowerCase();
  
  if (details.includes('tree removal') || titleLower.includes('tree removal')) return 2500;
  if (details.includes('landscaping') || details.includes('renovation')) return 4500;
  if (details.includes('deck') && details.includes('restoration')) return 3200;
  if (details.includes('pressure wash') && details.includes('building')) return 1800;
  if (details.includes('parking lot')) return 2200;
  if (details.includes('playground')) return 950;
  if (details.includes('garden') && details.includes('renovation')) return 5500;
  if (details.includes('hedge trimming')) return 350;
  if (details.includes('fence')) return 420;
  if (details.includes('sprinkler')) return 280;
  if (details.includes('pool deck')) return 1600;
  if (details.includes('flower bed')) return 850;
  if (details.includes('cleanup')) return 650;
  
  return 800; // Default amount
};

// Convert requests to deals for the pipeline
const createDealsFromRequests = (sessionClients: any[] = [], sessionRequests: any[] = [], sessionQuotes: any[] = [], stages: any[] = []): Deal[] => {
  console.log('Creating deals from requests. Session requests:', sessionRequests.length);
  const requestsWithClients = getRequestsWithClientInfo(sessionClients, sessionRequests);
  console.log('Requests with client info:', requestsWithClients.length);
  
  // Only include requests with status 'New' (open requests for pipeline)
  const openRequests = requestsWithClients.filter(request => {
    console.log(`Request ${request.id} has status: ${request.status}`);
    return request.status === 'New';
  });
  console.log('Open requests for pipeline:', openRequests.length);
  
  const deals = openRequests.map((request) => {
    // Check if this request should be moved to draft quote stage
    const draftQuoteStageId = shouldMoveRequestToDraftQuote(request.id, sessionQuotes, stages);
    const pipelineStage = draftQuoteStageId || assignPipelineStage(request.id);
    
    // If there's a quote for this request, use the most recent quote's amount
    const mostRecentQuote = getMostRecentQuoteForRequest(request.id, sessionQuotes);
    const amount = mostRecentQuote ? mostRecentQuote.amount : getEstimatedAmount(request.serviceDetails, request.title);
    
    return {
      id: request.id,
      client: request.client.name,
      title: request.title || 'Service Request',
      property: request.client.primaryAddress,
      contact: [request.client.phone, request.client.email].filter(Boolean).join('\n'),
      requested: request.requestDate,
      amount: amount,
      status: pipelineStage,
      type: 'request' as const
    };
  });
  
  console.log('Final deals from requests:', deals.length);
  return deals;
};

// Convert standalone quotes (not linked to requests) to deals for the pipeline
const createDealsFromStandaloneQuotes = (sessionClients: any[] = [], sessionQuotes: any[] = [], stages: any[] = []): Deal[] => {
  console.log('Creating deals from standalone quotes. Session quotes:', sessionQuotes.length);
  const quotesWithClients = getQuotesWithClientInfo(sessionClients, sessionQuotes);
  console.log('Quotes with client info:', quotesWithClients.length);
  
  // Only include quotes with status 'Draft' that are NOT linked to requests
  const standaloneQuotes = quotesWithClients.filter(quote => {
    console.log(`Quote ${quote.id} has status: ${quote.status}, requestId: ${quote.requestId}`);
    return quote.status === 'Draft' && !quote.requestId;
  });
  console.log('Standalone draft quotes for pipeline:', standaloneQuotes.length);
  
  const deals = standaloneQuotes.map((quote) => ({
    id: `quote-${quote.id}`, // Prefix to avoid ID conflicts with requests
    client: quote.client.name,
    title: quote.title || 'Quote',
    property: quote.property,
    contact: [quote.client.phone, quote.client.email].filter(Boolean).join('\n'),
    requested: quote.createdDate,
    amount: quote.amount,
    status: assignQuotePipelineStage(stages),
    type: 'quote' as const,
    quoteId: quote.id
  }));
  
  console.log('Final deals from standalone quotes:', deals.length);
  return deals;
};

export const createInitialDeals = (sessionClients: any[] = [], sessionRequests: any[] = [], sessionQuotes: any[] = [], stages: any[] = []): Deal[] => {
  const requestDeals = createDealsFromRequests(sessionClients, sessionRequests, sessionQuotes, stages);
  const standaloneQuoteDeals = createDealsFromStandaloneQuotes(sessionClients, sessionQuotes, stages);
  
  console.log('Total deals created:', requestDeals.length + standaloneQuoteDeals.length);
  return [...requestDeals, ...standaloneQuoteDeals];
};

// ... keep existing code (pipelineColumns export and action handlers)

export const pipelineColumns = [
  { id: "new-deals", title: "New Deals" },
  { id: "contacted", title: "Contacted" },
  { id: "quote-sent", title: "Quote Sent" },
  { id: "followup", title: "Followup" }
];

// Action handlers that work directly with deals state
export const handleDeleteAction = (dealId: string, deals: Deal[], setDeals: (deals: Deal[]) => void) => {
  console.log('Deleting deal:', dealId);
  const updatedDeals = deals.filter(deal => deal.id !== dealId);
  setDeals(updatedDeals);
};

export const handleLostAction = (dealId: string, deals: Deal[], setDeals: (deals: Deal[]) => void) => {
  console.log('Marking deal as lost:', dealId);
  const updatedDeals = deals.filter(deal => deal.id !== dealId);
  setDeals(updatedDeals);
};

export const handleWonAction = (dealId: string, deals: Deal[], setDeals: (deals: Deal[]) => void) => {
  console.log('Marking deal as won:', dealId);
  const updatedDeals = deals.filter(deal => deal.id !== dealId);
  setDeals(updatedDeals);
};

export type { Deal };
