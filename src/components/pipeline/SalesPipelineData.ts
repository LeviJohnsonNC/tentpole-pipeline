import { getRequestsWithClientInfo, RequestWithClient, getQuotesWithClientInfo, QuoteWithClient, getAllQuotes } from '@/utils/dataHelpers';

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

// Mapping function to assign pipeline stages to "New" requests that DON'T have quotes
const assignPipelineStage = (requestId: string, sessionQuotes: any[], stages: any[]): string => {
  // Check if this request has any quote - if so, don't put the request in pipeline
  const requestQuote = sessionQuotes.find(quote => quote.requestId === requestId);
  if (requestQuote) {
    return null; // Don't include this request in pipeline since its quote will be shown instead
  }
  
  // All new session requests should go to 'new-deals'
  if (requestId.startsWith('request-' + Date.now().toString().slice(0, 8))) {
    return 'new-deals';
  }
  
  // Map specific requests to pipeline stages for realistic distribution
  const stageMapping: Record<string, string> = {
    // New deals (just received) - only those without quotes
    'request-1': 'new-deals',
    'request-2': 'new-deals', 
    'request-3': 'new-deals',
    'request-4': 'new-deals',
    
    // Contacted (initial contact made) - only those without quotes
    'request-5': 'contacted',
    'request-6': 'contacted',
    'request-7': 'contacted',
    
    // Follow-up (awaiting decisions) - only those without quotes
    'request-12': 'followup',
    'request-15': 'followup',
    'request-16': 'followup'
  };
  
  return stageMapping[requestId] || 'new-deals';
};

// Function to determine pipeline stage for quotes (including those linked to requests)
const assignQuotePipelineStage = (quote: any, stages: any[]): string => {
  // Map quote status directly to pipeline stages
  if (quote.status === 'Awaiting Response') {
    const awaitingStage = stages.find(stage => 
      stage.title.toLowerCase().includes('quote') && stage.title.toLowerCase().includes('awaiting')
    );
    if (awaitingStage) {
      return awaitingStage.id;
    }
  }
  
  if (quote.status === 'Draft') {
    const draftQuoteStage = stages.find(stage => 
      stage.title.toLowerCase().includes('draft') && stage.title.toLowerCase().includes('quote')
    );
    if (draftQuoteStage) {
      return draftQuoteStage.id;
    }
  }
  
  // Approved and Converted quotes shouldn't be in pipeline
  if (quote.status === 'Approved' || quote.status === 'Converted') {
    return null;
  }
  
  // Fallback to "New Deals"
  return 'new-deals';
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

// Convert requests to deals for the pipeline (ONLY those without quotes)
const createDealsFromRequests = (sessionClients: any[] = [], sessionRequests: any[] = [], sessionQuotes: any[] = [], stages: any[] = []): Deal[] => {
  console.log('Creating deals from requests. Session requests:', sessionRequests.length);
  const requestsWithClients = getRequestsWithClientInfo(sessionClients, sessionRequests);
  console.log('Requests with client info:', requestsWithClients.length);
  
  // Only include requests with status 'New' AND no associated quotes
  const openRequestsWithoutQuotes = requestsWithClients.filter(request => {
    console.log(`Request ${request.id} has status: ${request.status}`);
    if (request.status !== 'New') return false;
    
    // Check if this request has any quote
    const hasQuote = sessionQuotes.some(quote => quote.requestId === request.id);
    console.log(`Request ${request.id} has quote: ${hasQuote}`);
    return !hasQuote;
  });
  console.log('Open requests without quotes for pipeline:', openRequestsWithoutQuotes.length);
  
  const deals = openRequestsWithoutQuotes.map((request) => {
    const pipelineStage = assignPipelineStage(request.id, sessionQuotes, stages);
    
    // If pipelineStage is null, don't include this request
    if (!pipelineStage) return null;
    
    const amount = getEstimatedAmount(request.serviceDetails, request.title);
    
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
  }).filter(Boolean); // Remove null entries
  
  console.log('Final deals from requests:', deals.length);
  return deals;
};

// Convert ALL quotes (both linked and standalone) to deals for the pipeline
const createDealsFromAllQuotes = (sessionClients: any[] = [], sessionQuotes: any[] = [], stages: any[] = []): Deal[] => {
  console.log('Creating deals from all quotes. Session quotes:', sessionQuotes.length);
  
  // Get all quotes using the same data source as the quotes table
  const allQuotes = getAllQuotes(sessionQuotes);
  const quotesWithClients = getQuotesWithClientInfo(sessionClients, sessionQuotes);
  console.log('All quotes with client info:', quotesWithClients.length);
  
  // Only include quotes with status 'Draft' or 'Awaiting Response' (active quotes in pipeline)
  const activeQuotes = quotesWithClients.filter(quote => {
    console.log(`Quote ${quote.id} has status: ${quote.status}`);
    return quote.status === 'Draft' || quote.status === 'Awaiting Response';
  });
  console.log('Active quotes for pipeline:', activeQuotes.length);
  
  const deals = activeQuotes.map((quote) => {
    const pipelineStage = assignQuotePipelineStage(quote, stages);
    
    // If pipelineStage is null, don't include this quote
    if (!pipelineStage) return null;
    
    return {
      id: `quote-${quote.id}`, // Prefix to avoid ID conflicts with requests
      client: quote.client.name,
      title: quote.title || 'Quote',
      property: quote.property,
      contact: [quote.client.phone, quote.client.email].filter(Boolean).join('\n'),
      requested: quote.createdDate,
      amount: quote.amount,
      status: pipelineStage,
      type: 'quote' as const,
      quoteId: quote.id
    };
  }).filter(Boolean); // Remove null entries
  
  console.log('Final deals from quotes:', deals.length);
  return deals;
};

export const createInitialDeals = (sessionClients: any[] = [], sessionRequests: any[] = [], sessionQuotes: any[] = [], stages: any[] = []): Deal[] => {
  console.log('\n=== PIPELINE DATA CREATION ===');
  console.log('Input data - Clients:', sessionClients.length, 'Requests:', sessionRequests.length, 'Quotes:', sessionQuotes.length);
  
  // Create deals from requests that don't have quotes
  const requestDeals = createDealsFromRequests(sessionClients, sessionRequests, sessionQuotes, stages);
  
  // Create deals from ALL quotes (this will include both standalone and request-linked quotes)
  const quoteDeals = createDealsFromAllQuotes(sessionClients, sessionQuotes, stages);
  
  const totalDeals = [...requestDeals, ...quoteDeals];
  console.log('Total pipeline deals created:', totalDeals.length);
  console.log('Request deals:', requestDeals.length, 'Quote deals:', quoteDeals.length);
  console.log('Pipeline deals by status:', totalDeals.reduce((acc, deal) => {
    acc[deal.status] = (acc[deal.status] || 0) + 1;
    return acc;
  }, {} as Record<string, number>));
  console.log('=== END PIPELINE DATA CREATION ===\n');
  
  return totalDeals;
};

// ... keep existing code (pipelineColumns export and action handlers)

export const pipelineColumns = [
  { id: "new-deals", title: "New Deals" },
  { id: "contacted", title: "Contacted" },
  { id: "quote-awaiting-response", title: "Quote Awaiting Response" },
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
