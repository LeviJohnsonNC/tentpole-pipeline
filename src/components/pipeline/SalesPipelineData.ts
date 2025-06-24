import { getRequestsWithClientInfo, RequestWithClient, getQuotesWithClientInfo, QuoteWithClient, getAllQuotes } from '@/utils/dataHelpers';

interface Deal {
  id: string;
  client: string;
  title: string;
  property: string;
  contact: string;
  requested: string;
  amount?: number; // Made optional - only present when there's a quote
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

// NEW: Helper function to find matching Jobber stage based on exact rules
const findMatchingJobberStage = (request: any, newestQuote: any | null, stages: any[]): string | null => {
  console.log(`Finding matching Jobber stage for request ${request?.id}, quote status: ${newestQuote?.status}, request status: ${request?.status}`);
  
  const jobberStages = stages.filter(stage => stage.isJobberStage);
  console.log('Available Jobber stages:', jobberStages.map(s => ({ id: s.id, title: s.title, order: s.order })));
  
  let matchingStages: any[] = [];
  
  // Rule 1: Request "Unscheduled" status -> "Unscheduled Assessment" Jobber Stage
  if (request && request.status === 'Unscheduled') {
    const unscheduledStages = jobberStages.filter(stage => 
      stage.title.toLowerCase().includes('unscheduled') && 
      stage.title.toLowerCase().includes('assessment')
    );
    matchingStages.push(...unscheduledStages);
    console.log(`Request ${request.id} is Unscheduled, found ${unscheduledStages.length} matching unscheduled assessment stages`);
  }
  
  // Rule 2: Request "Overdue" status -> "Overdue Assessment" Jobber Stage
  if (request && request.status === 'Overdue') {
    const overdueStages = jobberStages.filter(stage => 
      stage.title.toLowerCase().includes('overdue') && 
      stage.title.toLowerCase().includes('assessment')
    );
    matchingStages.push(...overdueStages);
    console.log(`Request ${request.id} is Overdue, found ${overdueStages.length} matching overdue assessment stages`);
  }
  
  // Rule 3: Request "Assessment complete" status -> "Assessment Completed" Jobber Stage
  if (request && request.status === 'Assessment complete') {
    const assessmentStages = jobberStages.filter(stage => 
      stage.title.toLowerCase().includes('assessment') && 
      (stage.title.toLowerCase().includes('completed') || stage.title.toLowerCase().includes('complete'))
    );
    matchingStages.push(...assessmentStages);
    console.log(`Request ${request.id} is Assessment complete, found ${assessmentStages.length} matching assessment completed stages`);
  }
  
  // Rule 4: Quote "Changes Requested" status -> "Quote Changes Requested" Jobber Stage
  if (newestQuote && newestQuote.status === 'Changes Requested') {
    const changesStages = jobberStages.filter(stage => 
      stage.title.toLowerCase().includes('quote') && 
      stage.title.toLowerCase().includes('changes') && 
      stage.title.toLowerCase().includes('requested')
    );
    matchingStages.push(...changesStages);
    console.log(`Quote ${newestQuote.id} has Changes Requested, found ${changesStages.length} matching quote changes stages`);
  }
  
  // If multiple matching stages, select the rightmost one (highest order)
  if (matchingStages.length > 0) {
    const rightmostStage = matchingStages.reduce((prev, current) => 
      (current.order > prev.order) ? current : prev
    );
    console.log(`Selected rightmost matching Jobber stage: ${rightmostStage.id} (${rightmostStage.title}) with order ${rightmostStage.order}`);
    return rightmostStage.id;
  }
  
  console.log('No matching Jobber stages found');
  return null;
};

// ENHANCED: Enhanced mapping function to check Jobber stages first
const assignPipelineStage = (request: any, newestQuote: any | null, stages: any[]): string | null => {
  console.log(`\n--- Assigning pipeline stage for request ${request.id} ---`);
  console.log(`Request status: ${request.status}, Newest quote: ${newestQuote?.id || 'none'}, Quote status: ${newestQuote?.status || 'N/A'}`);
  
  // STEP 1: Check for Jobber stage matches first (NEW LOGIC)
  const jobberStageMatch = findMatchingJobberStage(request, newestQuote, stages);
  if (jobberStageMatch) {
    console.log(`✅ Request ${request.id} matched to Jobber stage: ${jobberStageMatch}`);
    return jobberStageMatch;
  }
  
  // STEP 2: CRITICAL - If there's a newest quote, use its status to determine stage
  if (newestQuote) {
    console.log(`Request ${request.id} has newest quote ${newestQuote.id} with status: ${newestQuote.status}`);
    
    // ENHANCED AUTO CLOSED-WON: Approved and Converted quotes should NOT be in pipeline (closed won)
    if (newestQuote.status === 'Approved' || newestQuote.status === 'Converted') {
      console.log(`Request ${request.id} EXCLUDED from pipeline - quote ${newestQuote.id} is ${newestQuote.status} (AUTO CLOSED-WON)`);
      return null; // Don't include in pipeline - this is the key fix!
    }
    
    // Only allow quote stages if there's actually a valid quote with amount
    if (typeof newestQuote.amount === 'number' && newestQuote.amount > 0) {
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
      
      // Changes Requested is now handled by Jobber stage matching above
    } else {
      console.log(`Request ${request.id} has quote but invalid amount, placing in contacted stage`);
      return 'contacted'; // If quote exists but amount is invalid, place in contacted stage
    }
    
    // Archived quotes should also be excluded
    if (newestQuote.status === 'Archived') {
      console.log(`Request ${request.id} EXCLUDED from pipeline - quote ${newestQuote.id} is archived`);
      return null;
    }
  }
  
  // STEP 3: Handle requests without quotes - they can NEVER go to quote stages
  // All requests without quotes should only be in pre-quote stages
  if (request.status === 'Assessment complete') {
    // Assessment complete but no quote - should be in contacted, ready for quote creation
    return 'contacted';
  }
  
  if (request.status === 'Overdue') {
    return 'followup'; // Overdue requests go to followup (unless Jobber stage matched above)
  }
  
  if (request.status === 'Unscheduled') {
    return 'contacted'; // Unscheduled requests go to contacted (unless Jobber stage matched above)
  }
  
  // STEP 4: Handle new requests and others
  if (request.status === 'New') {
    // Distribute new requests between new-deals and contacted for realistic pipeline
    const distributionMapping: Record<string, string> = {
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
    
    return distributionMapping[request.id] || 'new-deals';
  }
  
  // Default fallback for any other status
  console.log(`Request ${request.id} using default fallback: new-deals`);
  return 'new-deals';
};

// Function to determine pipeline stage for standalone quotes
const assignQuotePipelineStage = (quote: any, stages: any[]): string | null => {
  console.log(`Assigning stage for standalone quote ${quote.id} with status: ${quote.status}`);
  
  // Check for Jobber stage matches first
  const jobberStageMatch = findMatchingJobberStage(null, quote, stages);
  if (jobberStageMatch) {
    console.log(`✅ Standalone quote ${quote.id} matched to Jobber stage: ${jobberStageMatch}`);
    return jobberStageMatch;
  }
  
  // ENHANCED AUTO CLOSED-WON: Approved and Converted quotes shouldn't be in pipeline (closed won)
  if (quote.status === 'Approved' || quote.status === 'Converted') {
    console.log(`Standalone quote ${quote.id} EXCLUDED from pipeline - status is ${quote.status} (AUTO CLOSED-WON)`);
    return null; // Don't include in pipeline - this is the key fix!
  }
  
  // VALIDATION: Only quotes with valid amounts should be in quote stages
  if (typeof quote.amount !== 'number' || quote.amount <= 0) {
    console.log(`Standalone quote ${quote.id} has invalid amount, excluding from pipeline`);
    return null;
  }
  
  if (quote.status === 'Draft') {
    const draftStage = stages.find(stage => 
      stage.title.toLowerCase().includes('draft') && stage.title.toLowerCase().includes('quote')
    );
    if (draftStage) {
      console.log(`Standalone quote ${quote.id} assigned to stage: ${draftStage.id}`);
      return draftStage.id;
    }
    console.log(`Standalone quote ${quote.id} using fallback draft-quote stage`);
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
  
  // Changes Requested is now handled by Jobber stage matching above
  
  // Archived quotes should also be excluded
  if (quote.status === 'Archived') {
    console.log(`Standalone quote ${quote.id} EXCLUDED from pipeline - status is archived`);
    return null;
  }
  
  // Fallback to "draft-quote" for other statuses
  return 'draft-quote';
};

// Convert requests to deals for the pipeline (with newest quote logic)
const createDealsFromRequests = (sessionClients: any[] = [], sessionRequests: any[] = [], sessionQuotes: any[] = [], stages: any[] = []): Deal[] => {
  console.log('Creating deals from requests. Session requests:', sessionRequests.length);
  const requestsWithClients = getRequestsWithClientInfo(sessionClients, sessionRequests);
  console.log('Requests with client info:', requestsWithClients.length);
  
  // Include requests with statuses that should appear in pipeline
  const openRequests = requestsWithClients.filter(request => {
    console.log(`Request ${request.id} has status: ${request.status}`);
    return ['New', 'Assessment complete', 'Overdue', 'Unscheduled'].includes(request.status);
  });
  console.log('Open requests for pipeline:', openRequests.length);
  
  const deals = openRequests.map((request) => {
    // Find the newest quote for this request
    const newestQuote = getNewestQuoteForRequest(request.id, sessionQuotes);
    console.log(`Request ${request.id} newest quote:`, newestQuote?.id || 'none');
    
    // ENHANCED AUTO CLOSED-WON LOGIC: Exclude deals with approved/converted quotes
    if (newestQuote && (newestQuote.status === 'Approved' || newestQuote.status === 'Converted')) {
      console.log(`Request ${request.id} EXCLUDED from pipeline - newest quote ${newestQuote.id} is ${newestQuote.status} (AUTO CLOSED-WON)`);
      return null; // This ensures the deal won't appear in the pipeline
    }
    
    // Determine pipeline stage based on newest quote or request alone (ENHANCED WITH JOBBER MATCHING)
    const pipelineStage = assignPipelineStage(request, newestQuote, stages);
    
    // If pipeline stage is null (closed won or excluded), don't include in pipeline
    if (!pipelineStage) {
      console.log(`Request ${request.id} EXCLUDED from pipeline - no valid stage`);
      return null;
    }
    
    // FIXED: Only include amount if there's a quote with valid numeric amount
    const amount = newestQuote && typeof newestQuote.amount === 'number' && newestQuote.amount > 0 ? newestQuote.amount : undefined;
    
    return {
      id: request.id,
      client: request.client.name,
      title: request.title || 'Service Request',
      property: request.client.primaryAddress,
      contact: [request.client.phone, request.client.email].filter(Boolean).join('\n'),
      requested: request.requestDate,
      amount: amount, // Only present if there's a valid quote amount
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
  console.log('Session clients available:', sessionClients.length);
  
  // Enhanced logging to debug quote-12 specifically
  const quote12 = sessionQuotes.find(q => q.id === 'quote-12');
  if (quote12) {
    console.log('Found quote-12 in session quotes:', quote12);
    console.log('Quote-12 details - requestId:', quote12.requestId, 'status:', quote12.status, 'amount:', quote12.amount, 'clientId:', quote12.clientId);
    
    // Check if client exists
    const client = sessionClients.find(c => c.id === quote12.clientId);
    console.log('Client for quote-12:', client ? 'FOUND' : 'NOT FOUND', client?.name);
  } else {
    console.log('Quote-12 NOT found in session quotes!');
  }
  
  // Get quotes with client info, but handle missing clients gracefully
  const quotesWithClients = sessionQuotes.map(quote => {
    const client = sessionClients.find(c => c.id === quote.clientId);
    if (!client) {
      console.warn(`Client not found for quote ${quote.id}, skipping quote`);
      return null;
    }
    return {
      ...quote,
      client
    };
  }).filter(Boolean); // Remove null entries
  
  console.log('All quotes with client info:', quotesWithClients.length);
  
  // Only include standalone quotes (no requestId) with active statuses
  const standaloneQuotes = quotesWithClients.filter(quote => {
    console.log(`Quote ${quote.id} has requestId: ${quote.requestId}, status: ${quote.status}, amount: ${quote.amount}`);
    
    // Must be standalone (no requestId)
    if (quote.requestId) {
      console.log(`Quote ${quote.id} EXCLUDED - has requestId: ${quote.requestId}`);
      return false;
    }
    
    // ENHANCED AUTO CLOSED-WON LOGIC: Exclude approved/converted quotes
    if (quote.status === 'Approved' || quote.status === 'Converted') {
      console.log(`Standalone quote ${quote.id} EXCLUDED from pipeline - status is ${quote.status} (AUTO CLOSED-WON)`);
      return false; // This ensures approved/converted quotes won't appear in pipeline
    }
    
    // Must have active status (not archived) and valid amount
    const isValidStatus = (quote.status === 'Draft' || quote.status === 'Awaiting Response' || quote.status === 'Changes Requested');
    const hasValidAmount = typeof quote.amount === 'number' && quote.amount > 0;
    
    console.log(`Quote ${quote.id} validation - validStatus: ${isValidStatus}, validAmount: ${hasValidAmount}`);
    
    return isValidStatus && hasValidAmount;
  });
  console.log('Standalone quotes for pipeline:', standaloneQuotes.length);
  standaloneQuotes.forEach(q => console.log(`- Standalone quote: ${q.id} (${q.status}, $${q.amount})`));
  
  const deals = standaloneQuotes.map((quote) => {
    const pipelineStage = assignQuotePipelineStage(quote, stages);
    
    // If pipelineStage is null, don't include this quote
    if (!pipelineStage) {
      console.log(`Standalone quote ${quote.id} EXCLUDED from pipeline (closed won)`);
      return null;
    }
    
    console.log(`Creating deal for standalone quote ${quote.id} in stage ${pipelineStage}`);
    
    return {
      id: `quote-${quote.id}`, // Prefix to avoid ID conflicts with requests
      client: quote.client.name,
      title: quote.title || 'Quote',
      property: quote.property,
      contact: [quote.client.phone, quote.client.email].filter(Boolean).join('\n'),
      requested: quote.createdDate,
      amount: quote.amount, // Always present for quotes and validated above
      status: pipelineStage,
      type: 'quote' as const,
      quoteId: quote.id
    };
  }).filter(Boolean); // Remove null entries
  
  console.log('Final deals from standalone quotes:', deals.length);
  deals.forEach(d => console.log(`- Deal created: ${d.id} (${d.status}, $${d.amount})`));
  return deals;
};

export const createInitialDeals = (sessionClients: any[] = [], sessionRequests: any[] = [], sessionQuotes: any[] = [], stages: any[] = []): Deal[] => {
  console.log('\n=== ENHANCED PIPELINE DATA CREATION (WITH JOBBER STAGE MATCHING) ===');
  console.log('Input data - Clients:', sessionClients.length, 'Requests:', sessionRequests.length, 'Quotes:', sessionQuotes.length);
  console.log('Available stages:', stages.map(s => ({ id: s.id, title: s.title, isJobberStage: s.isJobberStage, order: s.order })));
  
  // Create deals from open requests (using newest quote logic with JOBBER STAGE MATCHING)
  const requestDeals = createDealsFromRequests(sessionClients, sessionRequests, sessionQuotes, stages);
  
  // Create deals from standalone quotes only (with JOBBER STAGE MATCHING)
  const standaloneQuoteDeals = createDealsFromStandaloneQuotes(sessionClients, sessionQuotes, stages);
  
  const totalDeals = [...requestDeals, ...standaloneQuoteDeals];
  console.log('Total pipeline deals created:', totalDeals.length);
  console.log('Request deals:', requestDeals.length, 'Standalone quote deals:', standaloneQuoteDeals.length);
  console.log('Pipeline deals by status:', totalDeals.reduce((acc, deal) => {
    acc[deal.status] = (acc[deal.status] || 0) + 1;
    return acc;
  }, {} as Record<string, number>));
  console.log('=== END ENHANCED PIPELINE DATA CREATION ===\n');
  
  return totalDeals;
};

// Enhanced action handlers that update source data instead of just local state
export const handleDeleteAction = (
  dealId: string, 
  deals: Deal[], 
  setDeals: (deals: Deal[]) => void,
  updateSessionRequest: (id: string, updates: Partial<any>) => void,
  updateSessionQuote: (id: string, updates: Partial<any>) => void
) => {
  console.log('Deleting deal:', dealId);
  
  const deal = deals.find(d => d.id === dealId);
  if (!deal) return;
  
  // Update source data to archived status
  if (deal.type === 'request') {
    updateSessionRequest(dealId, { status: 'Archived' });
  } else if (deal.type === 'quote' && deal.quoteId) {
    updateSessionQuote(deal.quoteId, { status: 'Archived' });
  }
  
  // Local state will be updated by the pipeline regeneration
  console.log('Deal archived in source data, pipeline will regenerate');
};

export const handleLostAction = (
  dealId: string, 
  deals: Deal[], 
  setDeals: (deals: Deal[]) => void,
  updateSessionRequest: (id: string, updates: Partial<any>) => void,
  updateSessionQuote: (id: string, updates: Partial<any>) => void
) => {
  console.log('Marking deal as lost:', dealId);
  
  const deal = deals.find(d => d.id === dealId);
  if (!deal) return;
  
  // Update source data to archived status (lost deals are archived)
  if (deal.type === 'request') {
    updateSessionRequest(dealId, { status: 'Archived' });
  } else if (deal.type === 'quote' && deal.quoteId) {
    updateSessionQuote(deal.quoteId, { status: 'Archived' });
  }
  
  console.log('Deal marked as lost in source data, pipeline will regenerate');
};

export const handleWonAction = (
  dealId: string, 
  deals: Deal[], 
  setDeals: (deals: Deal[]) => void,
  updateSessionRequest: (id: string, updates: Partial<any>) => void,
  updateSessionQuote: (id: string, updates: Partial<any>) => void,
  updateSessionClient: (id: string, updates: Partial<any>) => void,
  sessionClients: any[]
) => {
  console.log('Marking deal as won:', dealId);
  
  const deal = deals.find(d => d.id === dealId);
  if (!deal) return;
  
  // Update source data to converted/approved status
  if (deal.type === 'request') {
    updateSessionRequest(dealId, { status: 'Converted' });
  } else if (deal.type === 'quote' && deal.quoteId) {
    updateSessionQuote(deal.quoteId, { status: 'Approved' });
  }
  
  // Update client status to Active if they're currently a Lead
  const client = sessionClients.find(c => c.name === deal.client);
  if (client && client.status === 'Lead') {
    console.log('Updating client status from Lead to Active:', client.id);
    updateSessionClient(client.id, { status: 'Active' });
  }
  
  console.log('Deal marked as won in source data, pipeline will regenerate');
};

export type { Deal };

export const pipelineColumns = [
  { id: "new-deals", title: "New Deals" },
  { id: "contacted", title: "Contacted" },
  { id: "draft-quote", title: "Draft Quote" },
  { id: "quote-awaiting-response", title: "Quote Awaiting Response" },
  { id: "followup", title: "Followup" }
];
