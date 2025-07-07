import { getRequestsWithClientInfo, RequestWithClient, getQuotesWithClientInfo, QuoteWithClient, getAllQuotes } from '@/utils/dataHelpers';
import { toast } from 'sonner';
import { createMinimalRequestForQuote } from '@/utils/autoRequestHelpers';

interface Deal {
  id: string;
  client: string;
  title: string;
  property: string;
  contact: string;
  requested: string;
  amount?: number; // Made optional - only present when there's a quote
  status: string; // Can be either Request status or pipeline stage ID
  type: 'request' | 'quote'; // New field to distinguish between requests and quotes
  quoteId?: string; // Optional field for quote-based deals
  createdAt: string; // Enhanced creation date tracking
  stageEnteredDate: string; // New field to track when deal entered current stage
}

// JOBBER STAGE ID MAPPING - Centralized mapping of Jobber stage titles to their IDs
const JOBBER_STAGE_IDS = {
  'Draft Quote': 'draft-quote',
  'Quote Awaiting Response': 'quote-awaiting-response', 
  'Unscheduled Assessment': 'jobber-unscheduled-assessment',
  'Overdue Assessment': 'jobber-overdue-assessment',
  'Assessment Completed': 'jobber-assessment-completed',
  'Quote Changes Requested': 'jobber-quote-changes-requested'
} as const;

// Helper function to check if a stage ID is a Jobber stage
const isJobberStageId = (stageId: string): boolean => {
  return Object.values(JOBBER_STAGE_IDS).includes(stageId as any);
};

// Helper function to generate dates for new deals (5-7 hours ago)
const generateNewDealDate = (): string => {
  const now = new Date();
  const hoursAgo = 5 + Math.random() * 2; // 5-7 hours ago
  const newDealDate = new Date(now.getTime() - (hoursAgo * 60 * 60 * 1000));
  return newDealDate.toISOString();
};

// Helper function to generate dates for other deals (1-60 days ago)
const generateOtherDealDate = (): string => {
  const now = new Date();
  const daysAgo = 1 + Math.random() * 59; // 1-60 days ago
  const otherDealDate = new Date(now.getTime() - (daysAgo * 24 * 60 * 60 * 1000));
  return otherDealDate.toISOString();
};

// Helper function to generate stage entered date that respects time limits with specific overdue deals
const generateStageEnteredDate = (createdAt: string, stageId: string, dealId: string): string => {
  const createdDate = new Date(createdAt);
  const now = new Date();
  
  // Define which specific deals should be overdue
  const overdueDeals = [
    { id: 'request-10', stage: 'followup' },
    { id: 'request-4', stage: 'quote-awaiting-response' }
  ];
  
  // Check if this deal should be overdue
  const shouldBeOverdue = overdueDeals.some(od => od.id === dealId && od.stage === stageId);
  
  if (shouldBeOverdue) {
    // Make this deal overdue by setting stage entered date well before the time limit
    let daysOverdue: number;
    if (stageId === 'followup') {
      daysOverdue = 10; // 10 days ago (limit is 7 days)
    } else if (stageId === 'quote-awaiting-response') {
      daysOverdue = 10; // 10 days ago (limit is 7 days)
    } else {
      daysOverdue = 5; // Default overdue amount
    }
    
    const overdueDate = new Date(now.getTime() - (daysOverdue * 24 * 60 * 60 * 1000));
    console.log(`Making deal ${dealId} in stage ${stageId} overdue: ${overdueDate.toISOString()}`);
    return overdueDate.toISOString();
  }
  
  // For all other deals, ensure they are within time limits
  let maxDaysInStage: number;
  
  // Set conservative limits to ensure deals stay within bounds
  switch (stageId) {
    case 'new-deals':
      maxDaysInStage = 0.1; // Stay well within 3 hours (convert to days)
      break;
    case 'contacted':
      maxDaysInStage = 2; // Stay within 3 day limit
      break;
    case 'draft-quote':
      maxDaysInStage = 0.8; // Stay within 1 day limit
      break;
    case 'quote-awaiting-response':
      maxDaysInStage = 5; // Stay within 7 day limit
      break;
    case 'followup':
      maxDaysInStage = 5; // Stay within 7 day limit
      break;
    default:
      maxDaysInStage = 1; // Conservative default
  }
  
  // Generate a random time within the safe limit
  const maxTimeInStage = maxDaysInStage * 24 * 60 * 60 * 1000; // Convert to milliseconds
  const randomTimeInStage = Math.random() * maxTimeInStage;
  const stageEnteredDate = new Date(now.getTime() - randomTimeInStage);
  
  // Ensure stage entered date is not before creation date
  const finalStageDate = stageEnteredDate < createdDate ? createdDate : stageEnteredDate;
  
  return finalStageDate.toISOString();
};

// Helper to check if a quote was just created (within last 5 minutes)
const isRecentlyCreatedQuote = (quoteCreatedDate: string): boolean => {
  const createdTime = new Date(quoteCreatedDate).getTime();
  const fiveMinutesAgo = new Date().getTime() - (5 * 60 * 1000);
  const isRecent = createdTime > fiveMinutesAgo;
  console.log(`🕐 RECENT QUOTE CHECK: Quote created at ${quoteCreatedDate}, is recent: ${isRecent}`);
  return isRecent;
};

// Helper function to find the newest quote for a request
const getNewestQuoteForRequest = (requestId: string, sessionQuotes: any[]): any | null => {
  const requestQuotes = sessionQuotes.filter(quote => quote.requestId === requestId);
  if (requestQuotes.length === 0) return null;
  
  // Sort by created date (newest first) and return the first one
  return requestQuotes.sort((a, b) => new Date(b.createdDate).getTime() - new Date(a.createdDate).getTime())[0];
};

// Priority-based Jobber stage assignment with ID-based detection
const findJobberStageByPriority = (request: any, newestQuote: any | null, stages: any[]): string | null => {
  console.log(`🎯 PRIORITY ASSIGNMENT: Checking Jobber stages for request ${request?.id || 'standalone'}, quote status: ${newestQuote?.status || 'N/A'}`);
  
  // Priority 1: Quote "Changes Requested" → jobber-quote-changes-requested
  if (newestQuote && newestQuote.status === 'Changes Requested') {
    const stageId = JOBBER_STAGE_IDS['Quote Changes Requested'];
    if (stages.some(s => s.id === stageId)) {
      console.log(`✅ PRIORITY 1: Found Changes Requested stage: ${stageId}`);
      return stageId;
    }
  }
  
  // Priority 2: Quote "Awaiting Response" → quote-awaiting-response
  if (newestQuote && newestQuote.status === 'Awaiting Response') {
    const stageId = JOBBER_STAGE_IDS['Quote Awaiting Response'];
    if (stages.some(s => s.id === stageId)) {
      console.log(`✅ PRIORITY 2: Found Awaiting Response stage: ${stageId}`);
      return stageId;
    }
  }
  
  // Priority 3: Quote "Draft" → draft-quote
  if (newestQuote && newestQuote.status === 'Draft') {
    const stageId = JOBBER_STAGE_IDS['Draft Quote'];
    if (stages.some(s => s.id === stageId)) {
      console.log(`✅ PRIORITY 3: Found Draft Quote stage: ${stageId}`);
      return stageId;
    }
  }
  
  // Priority 4: Request "Assessment complete" → jobber-assessment-completed
  if (request && request.status === 'Assessment complete') {
    const stageId = JOBBER_STAGE_IDS['Assessment Completed'];
    if (stages.some(s => s.id === stageId)) {
      console.log(`✅ PRIORITY 4: Found Assessment Completed stage: ${stageId}`);
      return stageId;
    }
  }
  
  // Priority 5: Request "Overdue" → jobber-overdue-assessment
  if (request && request.status === 'Overdue') {
    const stageId = JOBBER_STAGE_IDS['Overdue Assessment'];
    if (stages.some(s => s.id === stageId)) {
      console.log(`✅ PRIORITY 5: Found Overdue Assessment stage: ${stageId}`);
      return stageId;
    }
  }
  
  // Priority 6: Request "Unscheduled" → jobber-unscheduled-assessment
  if (request && request.status === 'Unscheduled') {
    const stageId = JOBBER_STAGE_IDS['Unscheduled Assessment'];
    if (stages.some(s => s.id === stageId)) {
      console.log(`✅ PRIORITY 6: Found Unscheduled Assessment stage: ${stageId}`);
      return stageId;
    }
  }
  
  console.log('❌ No matching Jobber stages found');
  return null;
};

// SIMPLIFIED: Basic pipeline stage assignment
const assignPipelineStage = (request: any, newestQuote: any | null, stages: any[]): string | null => {
  console.log(`\n--- Assigning pipeline stage for request ${request.id} ---`);
  console.log(`Request status: ${request.status}, Newest quote: ${newestQuote?.id || 'none'}, Quote status: ${newestQuote?.status || 'N/A'}`);
  
  // STEP 1: Check for priority-based Jobber stage matches first
  const jobberStageMatch = findJobberStageByPriority(request, newestQuote, stages);
  if (jobberStageMatch) {
    console.log(`✅ Request ${request.id} matched to Jobber stage: ${jobberStageMatch}`);
    return jobberStageMatch;
  }
  
  // STEP 2: If there's a newest quote, check for exclusions
  if (newestQuote) {
    console.log(`Request ${request.id} has newest quote ${newestQuote.id} with status: ${newestQuote.status}`);
    
    // AUTO CLOSED-WON: Approved and Converted quotes should NOT be in pipeline
    if (newestQuote.status === 'Approved' || newestQuote.status === 'Converted') {
      console.log(`Request ${request.id} EXCLUDED from pipeline - quote ${newestQuote.id} is ${newestQuote.status} (AUTO CLOSED-WON)`);
      return null;
    }
    
    // Archived quotes should also be excluded
    if (newestQuote.status === 'Archived') {
      console.log(`Request ${request.id} EXCLUDED from pipeline - quote ${newestQuote.id} is archived`);
      return null;
    }
  }
  
  // STEP 3: Handle requests without quotes or non-Jobber stage quotes
  let assignedStage: string;
  
  if (request.status === 'Assessment complete') {
    assignedStage = 'contacted';
  } else if (request.status === 'Overdue') {
    assignedStage = 'followup';
  } else if (request.status === 'Unscheduled') {
    assignedStage = 'contacted';
  } else if (request.status === 'New') {
    // STEP 4: Handle new requests and others
    const distributionMapping: Record<string, string> = {
      'request-1': 'new-deals',
      'request-2': 'new-deals', 
      'request-4': 'quote-awaiting-response', // This one will be overdue
      'request-6': 'new-deals',
      'request-7': 'contacted',
      'request-8': 'contacted',
      'request-9': 'contacted',
      'request-10': 'followup', // This one will be overdue
      'request-11': 'followup',
      'request-12': 'followup'
    };
    
    assignedStage = distributionMapping[request.id] || 'new-deals';
  } else {
    console.log(`Request ${request.id} using default fallback: new-deals`);
    assignedStage = 'new-deals';
  }
  
  console.log(`Non-Jobber stage assigned: ${assignedStage}`);
  return assignedStage;
};

// SIMPLIFIED: Migrate standalone quotes to ensure all quotes have requests
const migrateStandaloneQuotes = (
  sessionClients: any[], 
  sessionQuotes: any[], 
  addSessionRequest?: (request: any) => void
): any[] => {
  // If no migration function provided, return quotes as-is
  if (!addSessionRequest) {
    console.log('🔄 MIGRATION: Skipping migration - no addSessionRequest function provided');
    return sessionQuotes;
  }

  console.log('\n🔄 MIGRATION: Checking for standalone quotes needing auto-requests');
  
  const migratedQuotes = sessionQuotes.map(quote => {
    if (!quote.requestId) {
      console.log(`🔄 MIGRATION: Found standalone quote ${quote.id}, creating auto-request`);
      
      const autoRequest = createMinimalRequestForQuote(quote);
      addSessionRequest(autoRequest);
      
      console.log(`🔄 MIGRATION: Auto-request ${autoRequest.id} created for quote ${quote.id}`);
      
      return {
        ...quote,
        requestId: autoRequest.id
      };
    }
    return quote;
  });
  
  console.log('🔄 MIGRATION: Migration complete');
  return migratedQuotes;
};

// SIMPLIFIED: Convert requests to deals for the pipeline
const createDealsFromRequests = (
  sessionClients: any[] = [], 
  sessionRequests: any[] = [], 
  sessionQuotes: any[] = [], 
  stages: any[] = [],
  addSessionRequest?: (request: any) => void
): Deal[] => {
  console.log('Creating deals from requests. Session requests:', sessionRequests.length);
  
  // Migrate standalone quotes first if addSessionRequest is provided
  let workingQuotes = sessionQuotes;
  if (addSessionRequest) {
    workingQuotes = migrateStandaloneQuotes(sessionClients, sessionQuotes, addSessionRequest);
  }
  
  const requestsWithClients = getRequestsWithClientInfo(sessionClients, sessionRequests);
  console.log('Requests with client info:', requestsWithClients.length);
  
  // Include requests with statuses that should appear in pipeline
  const openRequests = requestsWithClients.filter(request => {
    console.log(`Request ${request.id} has status: ${request.status}`);
    // Exclude archived, closed lost, and closed won requests from pipeline
    return ['New', 'Assessment complete', 'Overdue', 'Unscheduled'].includes(request.status) &&
           !['Archived', 'Closed Lost', 'Closed Won'].includes(request.status);
  });
  console.log('Open requests for pipeline:', openRequests.length);
  
  const deals = openRequests.map((request) => {
    // Find the newest quote for this request
    const newestQuote = getNewestQuoteForRequest(request.id, workingQuotes);
    console.log(`Request ${request.id} newest quote:`, newestQuote?.id || 'none', 'amount:', newestQuote?.amount);
    
    // ENHANCED AUTO CLOSED-WON LOGIC: Exclude deals with approved/converted quotes
    if (newestQuote && (newestQuote.status === 'Approved' || newestQuote.status === 'Converted')) {
      console.log(`Request ${request.id} EXCLUDED from pipeline - newest quote ${newestQuote.id} is ${newestQuote.status} (AUTO CLOSED-WON)`);
      return null; // This ensures the deal won't appear in the pipeline
    }
    
    // Determine pipeline stage
    const pipelineStage = assignPipelineStage(request, newestQuote, stages);
    
    // If pipeline stage is null (closed won or excluded), don't include in pipeline
    if (!pipelineStage) {
      console.log(`Request ${request.id} EXCLUDED from pipeline - no valid stage`);
      return null;
    }
    
    // Only include amount if there's a quote with valid numeric amount
    const amount = newestQuote && typeof newestQuote.amount === 'number' && newestQuote.amount > 0 ? newestQuote.amount : undefined;
    console.log(`Request ${request.id} final amount:`, amount);
    
    // Generate realistic dates using the improved function
    const isNewDeal = pipelineStage === 'new-deals';
    let createdAt: string;
    let stageEnteredDate: string;
    
    // If there's a recent quote that moved this to a Jobber stage, use current time
    if (newestQuote && isJobberStageId(pipelineStage) && isRecentlyCreatedQuote(newestQuote.createdDate)) {
      console.log(`🕐 Request ${request.id} using current timestamp due to recent quote ${newestQuote.id}`);
      createdAt = newestQuote.createdDate;
      stageEnteredDate = new Date().toISOString(); // Current time for stage entry
    } else {
      // Use existing logic for older deals
      createdAt = isNewDeal ? generateNewDealDate() : generateOtherDealDate();
      stageEnteredDate = generateStageEnteredDate(createdAt, pipelineStage, request.id);
    }
    
    return {
      id: request.id,
      client: request.client.name,
      title: request.title || 'Service Request', // Use request title for request-based deals
      property: request.client.primaryAddress,
      contact: [request.client.phone, request.client.email].filter(Boolean).join('\n'),
      requested: request.requestDate,
      amount: amount, // Only present if there's a valid quote amount
      status: pipelineStage,
      type: 'request' as const,
      quoteId: newestQuote?.id,
      createdAt,
      stageEnteredDate
    };
  }).filter(Boolean); // Remove null entries
  
  console.log('Final deals from requests:', deals.length);
  return deals;
};

// Create deals from requests including closed won/lost for list view
const createAllDealsFromRequests = (
  sessionClients: any[] = [], 
  sessionRequests: any[] = [], 
  sessionQuotes: any[] = [], 
  stages: any[] = [],
  addSessionRequest?: (request: any) => void
): Deal[] => {
  console.log('Creating ALL deals from requests (including closed). Session requests:', sessionRequests.length);
  
  // Migrate standalone quotes first if addSessionRequest is provided
  let workingQuotes = sessionQuotes;
  if (addSessionRequest) {
    workingQuotes = migrateStandaloneQuotes(sessionClients, sessionQuotes, addSessionRequest);
  }
  
  const requestsWithClients = getRequestsWithClientInfo(sessionClients, sessionRequests);
  console.log('Requests with client info:', requestsWithClients.length);
  
  // Use same filtering logic as createDealsFromRequests for active deals
  const activeRequests = requestsWithClients.filter(request => {
    console.log(`Request ${request.id} has status: ${request.status}`);
    // Include requests with statuses that should appear in pipeline
    return ['New', 'Assessment complete', 'Overdue', 'Unscheduled'].includes(request.status) &&
           !['Archived', 'Closed Lost', 'Closed Won'].includes(request.status);
  });
  
  // Also get explicitly closed deals for list view reporting
  const closedRequests = requestsWithClients.filter(request => {
    return ['Closed Won', 'Closed Lost'].includes(request.status);
  });
  
  const allRequests = [...activeRequests, ...closedRequests];
  console.log('Active requests for list view:', activeRequests.length, 'Closed requests:', closedRequests.length, 'Total:', allRequests.length);
  
  const deals = allRequests.map((request) => {
    // Find the newest quote for this request
    const newestQuote = getNewestQuoteForRequest(request.id, workingQuotes);
    console.log(`Request ${request.id} newest quote:`, newestQuote?.id || 'none', 'amount:', newestQuote?.amount);
    
    // Apply same exclusion logic for approved/converted quotes
    if (newestQuote && (newestQuote.status === 'Approved' || newestQuote.status === 'Converted')) {
      console.log(`Request ${request.id} EXCLUDED from list - newest quote ${newestQuote.id} is ${newestQuote.status} (AUTO CLOSED-WON)`);
      return null; // This ensures the deal won't appear in the list
    }
    
    // For closed won/lost deals, use the request status directly
    let finalStatus: string = request.status;
    
    // For open deals, determine pipeline stage
    if (!['Closed Won', 'Closed Lost'].includes(request.status)) {
      const pipelineStage = assignPipelineStage(request, newestQuote, stages);
      if (pipelineStage) {
        finalStatus = pipelineStage;
      }
      // If no pipeline stage assigned, keep the original request status
    }
    
    // Only include amount if there's a quote with valid numeric amount
    const amount = newestQuote && typeof newestQuote.amount === 'number' && newestQuote.amount > 0 ? newestQuote.amount : undefined;
    console.log(`Request ${request.id} final amount:`, amount);
    
    // Generate realistic dates using the improved function
    const isNewDeal = finalStatus === 'new-deals';
    let createdAt: string;
    let stageEnteredDate: string;
    
    // If there's a recent quote that moved this to a Jobber stage, use current time
    if (newestQuote && isJobberStageId(finalStatus) && isRecentlyCreatedQuote(newestQuote.createdDate)) {
      console.log(`🕐 Request ${request.id} using current timestamp due to recent quote ${newestQuote.id}`);
      createdAt = newestQuote.createdDate;
      stageEnteredDate = new Date().toISOString(); // Current time for stage entry
    } else {
      // Use existing logic for older deals
      createdAt = isNewDeal ? generateNewDealDate() : generateOtherDealDate();
      stageEnteredDate = generateStageEnteredDate(createdAt, finalStatus, request.id);
    }
    
    return {
      id: request.id,
      client: request.client.name,
      title: request.title || 'Service Request',
      property: request.client.primaryAddress,
      contact: [request.client.phone, request.client.email].filter(Boolean).join('\n'),
      requested: request.requestDate,
      amount: amount,
      status: finalStatus, // This can be either a Request status or a pipeline stage ID
      type: 'request' as const,
      quoteId: newestQuote?.id,
      createdAt,
      stageEnteredDate
    };
  }).filter(Boolean); // Remove null entries
  
  console.log('Final ALL deals from requests:', deals.length);
  return deals;
};

// Main function for creating pipeline deals
export const createInitialDeals = (
  sessionClients: any[] = [], 
  sessionRequests: any[] = [], 
  sessionQuotes: any[] = [], 
  stages: any[] = [],
  addSessionRequest?: (request: any) => void
): Deal[] => {
  console.log('\n=== 🚀 UNIFIED PIPELINE DATA CREATION ===');
  console.log('Input data - Clients:', sessionClients.length, 'Requests:', sessionRequests.length, 'Quotes:', sessionQuotes.length);
  console.log('Available stages:', stages.map(s => ({ id: s.id, title: s.title, isJobberStage: s.isJobberStage, order: s.order })));
  
  // Enhanced error handling for missing data
  if (!sessionClients || sessionClients.length === 0) {
    console.warn('⚠️ No clients available - pipeline will be empty');
    return [];
  }
  
  if (!stages || stages.length === 0) {
    console.warn('⚠️ No stages available - pipeline will be empty');
    return [];
  }
  
  // Create deals from requests (now handles all quotes since they all have requests)
  const allDeals = createDealsFromRequests(sessionClients, sessionRequests, sessionQuotes, stages, addSessionRequest);
  
  console.log('✅ Total pipeline deals created:', allDeals.length);
  console.log('📊 Pipeline deals by status:', allDeals.reduce((acc, deal) => {
    acc[deal.status] = (acc[deal.status] || 0) + 1;
    return acc;
  }, {} as Record<string, number>));
  console.log('=== 🏁 END UNIFIED PIPELINE DATA CREATION ===\n');
  
  return allDeals;
};

// Main function for creating ALL deals (including closed won/lost)
export const createAllDeals = (
  sessionClients: any[] = [], 
  sessionRequests: any[] = [], 
  sessionQuotes: any[] = [], 
  stages: any[] = [],
  addSessionRequest?: (request: any) => void
): Deal[] => {
  console.log('\n=== 🚀 ALL DEALS CREATION (INCLUDING CLOSED) ===');
  console.log('Input data - Clients:', sessionClients.length, 'Requests:', sessionRequests.length, 'Quotes:', sessionQuotes.length);
  console.log('Available stages:', stages.map(s => ({ id: s.id, title: s.title, isJobberStage: s.isJobberStage, order: s.order })));
  
  // Enhanced error handling for missing data
  if (!sessionClients || sessionClients.length === 0) {
    console.warn('⚠️ No clients available - all deals will be empty');
    return [];
  }
  
  if (!stages || stages.length === 0) {
    console.warn('⚠️ No stages available - all deals will be empty');
    return [];
  }
  
  // Create deals from all requests (including closed)
  const allDeals = createAllDealsFromRequests(sessionClients, sessionRequests, sessionQuotes, stages, addSessionRequest);
  
  console.log('✅ Total ALL deals created:', allDeals.length);
  console.log('📊 All deals by status:', allDeals.reduce((acc, deal) => {
    acc[deal.status] = (acc[deal.status] || 0) + 1;
    return acc;
  }, {} as Record<string, number>));
  console.log('=== 🏁 END ALL DEALS CREATION ===\n');
  
  return allDeals;
};

// Enhanced validation function with complete Jobber stage blocking
export const canDropInJobberStage = (dealId: string, targetStageId: string): {
  allowed: boolean;
  message?: string;
} => {
  console.log('🚫 DRAG VALIDATION: Checking drop for deal:', dealId, 'to stage:', targetStageId);
  
  // COMPLETE BLOCK: No manual drags into any Jobber stage
  if (isJobberStageId(targetStageId)) {
    console.log('🚫 DRAG BLOCKED: Cannot manually drag into Jobber stage:', targetStageId);
    return {
      allowed: false,
      message: "This stage is automatically managed. Deals are moved here based on their status."
    };
  }
  
  console.log('✅ DRAG ALLOWED: Target is not a Jobber stage');
  return {
    allowed: true
  };
};

// Function to check if dragging FROM a Jobber stage should be blocked
export const canDragFromJobberStage = (dealId: string, sourceStageId: string): {
  allowed: boolean;
  message?: string;
} => {
  console.log('🚫 DRAG FROM VALIDATION: Checking drag from stage:', sourceStageId);
  
  // COMPLETE BLOCK: No manual drags out of any Jobber stage
  if (isJobberStageId(sourceStageId)) {
    console.log('🚫 DRAG BLOCKED: Cannot manually drag from Jobber stage:', sourceStageId);
    return {
      allowed: false,
      message: "This stage is automatically managed. Deals cannot be manually moved from here."
    };
  }
  
  console.log('✅ DRAG ALLOWED: Source is not a Jobber stage');
  return {
    allowed: true
  };
};

// Enhanced action handlers that update source data and show toast notifications
export const handleArchiveAction = (
  dealId: string, 
  deals: Deal[], 
  setDeals: (deals: Deal[]) => void,
  updateSessionRequest: (id: string, updates: Partial<any>) => void,
  updateSessionQuote: (id: string, updates: Partial<any>) => void
) => {
  console.log('Archiving deal:', dealId);
  
  const deal = deals.find(d => d.id === dealId);
  if (!deal) return;
  
  // Update source data to archived status
  if (deal.type === 'request') {
    updateSessionRequest(dealId, { status: 'Archived' });
  } else if (deal.type === 'quote' && deal.quoteId) {
    updateSessionQuote(deal.quoteId, { status: 'Archived' });
  }
  
  toast.success(`Deal archived: ${deal.client}`);
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
  
  // Update source data to closed lost status
  if (deal.type === 'request') {
    updateSessionRequest(dealId, { status: 'Closed Lost' });
  } else if (deal.type === 'quote' && deal.quoteId) {
    updateSessionQuote(deal.quoteId, { status: 'Closed Lost' });
  }
  
  toast.error(`Deal marked as lost: ${deal.client}`);
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
  
  // Update source data to closed won status
  if (deal.type === 'request') {
    updateSessionRequest(dealId, { status: 'Closed Won' });
  } else if (deal.type === 'quote' && deal.quoteId) {
    updateSessionQuote(deal.quoteId, { status: 'Closed Won' });
  }
  
  // Update client status to Active if they're currently a Lead
  const client = sessionClients.find(c => c.name === deal.client);
  if (client && client.status === 'Lead') {
    console.log('Updating client status from Lead to Active:', client.id);
    updateSessionClient(client.id, { status: 'Active' });
  }
  
  toast.success(`Deal won: ${deal.client}!`);
  console.log('Deal marked as won in source data, pipeline will regenerate');
};

// Legacy function kept for compatibility (now calls handleArchiveAction)
export const handleDeleteAction = (
  dealId: string, 
  deals: Deal[], 
  setDeals: (deals: Deal[]) => void,
  updateSessionRequest: (id: string, updates: Partial<any>) => void,
  updateSessionQuote: (id: string, updates: Partial<any>) => void
) => {
  handleArchiveAction(dealId, deals, setDeals, updateSessionRequest, updateSessionQuote);
};

export type { Deal };

export const pipelineColumns = [
  { id: "new-deals", title: "New Deals" },
  { id: "contacted", title: "Contacted" },
  { id: "draft-quote", title: "Draft Quote" },
  { id: "quote-awaiting-response", title: "Quote Awaiting Response" },
  { id: "followup", title: "Followup" }
];
