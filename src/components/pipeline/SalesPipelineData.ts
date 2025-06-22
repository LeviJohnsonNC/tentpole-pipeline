
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

// Mapping function to assign pipeline stages to "New" requests
const assignPipelineStage = (requestId: string, stages: any[]): string => {
  // Map specific requests to pipeline stages for realistic distribution
  const stageMapping: Record<string, string> = {
    // New deals (just received)
    'request-1': 'new-deals',
    'request-2': 'new-deals', 
    'request-4': 'new-deals',
    'request-6': 'new-deals',
    
    // Contacted (initial contact made)
    'request-7': 'contacted',
    'request-8': 'contacted',
    'request-9': 'contacted',
    
    // Follow-up (awaiting decisions)
    'request-10': 'followup',
    'request-11': 'followup',
    'request-12': 'followup'
  };
  
  return stageMapping[requestId] || 'new-deals';
};

// Function to determine pipeline stage for standalone quotes
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
    return 'new-deals'; // Draft quotes start in new deals
  }
  
  // Approved and Converted quotes shouldn't be in pipeline (closed won)
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

// Check if a request has any approved/converted quotes (closed won)
const isRequestClosedWon = (requestId: string, sessionQuotes: any[]): boolean => {
  const requestQuotes = sessionQuotes.filter(quote => quote.requestId === requestId);
  return requestQuotes.some(quote => quote.status === 'Approved' || quote.status === 'Converted');
};

// Convert requests to deals for the pipeline (ONLY open requests without closed quotes)
const createDealsFromRequests = (sessionClients: any[] = [], sessionRequests: any[] = [], sessionQuotes: any[] = [], stages: any[] = []): Deal[] => {
  console.log('Creating deals from requests. Session requests:', sessionRequests.length);
  const requestsWithClients = getRequestsWithClientInfo(sessionClients, sessionRequests);
  console.log('Requests with client info:', requestsWithClients.length);
  
  // Only include requests with status 'New' AND no closed quotes
  const openRequests = requestsWithClients.filter(request => {
    console.log(`Request ${request.id} has status: ${request.status}`);
    if (request.status !== 'New') return false;
    
    // Check if this request has any approved/converted quotes (closed won)
    const isClosedWon = isRequestClosedWon(request.id, sessionQuotes);
    console.log(`Request ${request.id} is closed won: ${isClosedWon}`);
    return !isClosedWon;
  });
  console.log('Open requests for pipeline:', openRequests.length);
  
  const deals = openRequests.map((request) => {
    const pipelineStage = assignPipelineStage(request.id, stages);
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
  });
  
  console.log('Final deals from requests:', deals.length);
  return deals;
};

// Convert ONLY standalone quotes (not linked to requests) to deals for the pipeline
const createDealsFromStandaloneQuotes = (sessionClients: any[] = [], sessionQuotes: any[] = [], stages: any[] = []): Deal[] => {
  console.log('Creating deals from standalone quotes. Session quotes:', sessionQuotes.length);
  
  const quotesWithClients = getQuotesWithClientInfo(sessionClients, sessionQuotes);
  console.log('All quotes with client info:', quotesWithClients.length);
  
  // Only include standalone quotes (no requestId) with active statuses
  const standaloneQuotes = quotesWithClients.filter(quote => {
    console.log(`Quote ${quote.id} has requestId: ${quote.requestId}, status: ${quote.status}`);
    
    // Must be standalone (no requestId)
    if (quote.requestId) return false;
    
    // Must have active status (not closed won)
    return quote.status === 'Draft' || quote.status === 'Awaiting Response';
  });
  console.log('Standalone quotes for pipeline:', standaloneQuotes.length);
  
  const deals = standaloneQuotes.map((quote) => {
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
  
  console.log('Final deals from standalone quotes:', deals.length);
  return deals;
};

export const createInitialDeals = (sessionClients: any[] = [], sessionRequests: any[] = [], sessionQuotes: any[] = [], stages: any[] = []): Deal[] => {
  console.log('\n=== PIPELINE DATA CREATION ===');
  console.log('Input data - Clients:', sessionClients.length, 'Requests:', sessionRequests.length, 'Quotes:', sessionQuotes.length);
  
  // Create deals from open requests (no closed quotes)
  const requestDeals = createDealsFromRequests(sessionClients, sessionRequests, sessionQuotes, stages);
  
  // Create deals from standalone quotes only
  const standaloneQuoteDeals = createDealsFromStandaloneQuotes(sessionClients, sessionQuotes, stages);
  
  const totalDeals = [...requestDeals, ...standaloneQuoteDeals];
  console.log('Total pipeline deals created:', totalDeals.length);
  console.log('Request deals:', requestDeals.length, 'Standalone quote deals:', standaloneQuoteDeals.length);
  console.log('Pipeline deals by status:', totalDeals.reduce((acc, deal) => {
    acc[deal.status] = (acc[deal.status] || 0) + 1;
    return acc;
  }, {} as Record<string, number>));
  console.log('=== END PIPELINE DATA CREATION ===\n');
  
  return totalDeals;
};

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
