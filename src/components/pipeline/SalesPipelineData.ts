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

// Helper function to find the newest quote for a request
const getNewestQuoteForRequest = (requestId: string, sessionQuotes: any[]): any | null => {
  const requestQuotes = sessionQuotes.filter(quote => quote.requestId === requestId);
  if (requestQuotes.length === 0) return null;
  
  // Sort by created date (newest first) and return the first one
  return requestQuotes.sort((a, b) => new Date(b.createdDate).getTime() - new Date(a.createdDate).getTime())[0];
};

// Mapping function to assign pipeline stages based on quote status or request state
const assignPipelineStage = (request: any, newestQuote: any | null, stages: any[]): string => {
  // If there's a newest quote, use its status to determine stage
  if (newestQuote) {
    console.log(`Request ${request.id} has newest quote ${newestQuote.id} with status: ${newestQuote.status}`);
    
    if (newestQuote.status === 'Draft') {
      const draftStage = stages.find(stage => 
        stage.title.toLowerCase().includes('draft') && stage.title.toLowerCase().includes('quote')
      );
      if (draftStage) {
        return draftStage.id;
      }
      return 'draft-quote'; // Fallback to default draft quote stage ID
    }
    
    if (newestQuote.status === 'Awaiting Response') {
      const awaitingStage = stages.find(stage => 
        stage.title.toLowerCase().includes('quote') && stage.title.toLowerCase().includes('awaiting')
      );
      if (awaitingStage) {
        return awaitingStage.id;
      }
    }
    
    if (newestQuote.status === 'Changes Requested') {
      return 'followup'; // Changes requested goes to followup
    }
    
    // Approved and Converted quotes shouldn't be in pipeline (closed won)
    if (newestQuote.status === 'Approved' || newestQuote.status === 'Converted') {
      return null; // Don't include in pipeline
    }
  }
  
  // If no quote, use original mapping for realistic distribution
  const stageMapping: Record<string, string> = {
    'request-1': 'new-deals',
    'request-2': 'new-deals', 
    'request-4': 'new-deals',
    'request-6': 'new-deals',
    'request-7': 'contacted',
    'request-8': 'contacted',
    'request-9': 'contacted',
    'request-10': 'followup',
    'request-11': 'followup',
    'request-12': 'followup'
  };
  
  return stageMapping[request.id] || 'new-deals';
};

// Function to determine pipeline stage for standalone quotes
const assignQuotePipelineStage = (quote: any, stages: any[]): string => {
  console.log(`Standalone quote ${quote.id} has status: ${quote.status}`);
  
  if (quote.status === 'Draft') {
    const draftStage = stages.find(stage => 
      stage.title.toLowerCase().includes('draft') && stage.title.toLowerCase().includes('quote')
    );
    if (draftStage) {
      return draftStage.id;
    }
    return 'draft-quote'; // Fallback to default draft quote stage ID
  }
  
  if (quote.status === 'Awaiting Response') {
    const awaitingStage = stages.find(stage => 
      stage.title.toLowerCase().includes('quote') && stage.title.toLowerCase().includes('awaiting')
    );
    if (awaitingStage) {
      return awaitingStage.id;
    }
  }
  
  if (quote.status === 'Changes Requested') {
    return 'followup'; // Changes requested goes to followup
  }
  
  // Approved and Converted quotes shouldn't be in pipeline (closed won)
  if (quote.status === 'Approved' || quote.status === 'Converted') {
    return null;
  }
  
  // Fallback to "draft-quote" for draft-like quotes
  return 'draft-quote';
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

// Convert requests to deals for the pipeline (with newest quote logic)
const createDealsFromRequests = (sessionClients: any[] = [], sessionRequests: any[] = [], sessionQuotes: any[] = [], stages: any[] = []): Deal[] => {
  console.log('Creating deals from requests. Session requests:', sessionRequests.length);
  const requestsWithClients = getRequestsWithClientInfo(sessionClients, sessionRequests);
  console.log('Requests with client info:', requestsWithClients.length);
  
  // Only include requests with status 'New'
  const openRequests = requestsWithClients.filter(request => {
    console.log(`Request ${request.id} has status: ${request.status}`);
    return request.status === 'New';
  });
  console.log('Open requests for pipeline:', openRequests.length);
  
  const deals = openRequests.map((request) => {
    // Find the newest quote for this request
    const newestQuote = getNewestQuoteForRequest(request.id, sessionQuotes);
    console.log(`Request ${request.id} newest quote:`, newestQuote?.id || 'none');
    
    // Determine pipeline stage based on newest quote or request alone
    const pipelineStage = assignPipelineStage(request, newestQuote, stages);
    
    // If pipeline stage is null (closed won), don't include in pipeline
    if (!pipelineStage) {
      console.log(`Request ${request.id} excluded from pipeline (closed won)`);
      return null;
    }
    
    // Use quote amount if available, otherwise estimate from request
    const amount = newestQuote ? newestQuote.amount : getEstimatedAmount(request.serviceDetails, request.title);
    
    return {
      id: request.id,
      client: request.client.name,
      title: request.title || 'Service Request',
      property: request.client.primaryAddress,
      contact: [request.client.phone, request.client.email].filter(Boolean).join('\n'),
      requested: request.requestDate,
      amount: amount,
      status: pipelineStage,
      type: 'request' as const,
      quoteId: newestQuote?.id
    };
  }).filter(Boolean); // Remove null entries
  
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
    
    // Must have active status (not closed won or archived)
    return quote.status === 'Draft' || quote.status === 'Awaiting Response' || quote.status === 'Changes Requested';
  });
  console.log('Standalone quotes for pipeline:', standaloneQuotes.length);
  
  const deals = standaloneQuotes.map((quote) => {
    const pipelineStage = assignQuotePipelineStage(quote, stages);
    
    // If pipelineStage is null, don't include this quote
    if (!pipelineStage) {
      console.log(`Standalone quote ${quote.id} excluded from pipeline (closed won)`);
      return null;
    }
    
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
  
  // Create deals from open requests (using newest quote logic)
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
  { id: "draft-quote", title: "Draft Quote" },
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
