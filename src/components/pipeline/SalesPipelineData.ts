import { getRequestsWithClientInfo, RequestWithClient, getQuotesWithClientInfo, QuoteWithClient, getAllQuotes } from '@/utils/dataHelpers';
import { toast } from 'sonner';

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

// NEW: Helper function to check if a deal meets the conditions for a specific Jobber stage
const checkJobberStageCondition = (
  deal: Deal, 
  stageId: string, 
  sessionRequests: any[] = [], 
  sessionQuotes: any[] = []
): { allowed: boolean; message?: string } => {
  console.log(`🔍 JOBBER CONDITION CHECK: Deal ${deal.id} for stage ${stageId}`);
  
  let request = null;
  let quote = null;
  
  // Get the associated request and quote data
  if (deal.type === 'request') {
    request = sessionRequests.find(r => r.id === deal.id);
    if (deal.quoteId) {
      quote = sessionQuotes.find(q => q.id === deal.quoteId);
    }
  } else if (deal.type === 'quote' && deal.quoteId) {
    quote = sessionQuotes.find(q => q.id === deal.quoteId);
    if (quote && quote.requestId) {
      request = sessionRequests.find(r => r.id === quote.requestId);
    }
  }
  
  console.log(`🔍 CONDITION CHECK: Request status: ${request?.status || 'N/A'}, Quote status: ${quote?.status || 'N/A'}`);
  
  switch (stageId) {
    case 'draft-quote':
      if (quote && quote.status === 'Draft') {
        console.log(`✅ CONDITION MET: Deal has Draft quote`);
        return { allowed: true };
      }
      console.log(`❌ CONDITION NOT MET: Deal does not have Draft quote`);
      return { allowed: false, message: "Deal must have a Draft quote to be placed in this stage" };
      
    case 'quote-awaiting-response':
      if (quote && quote.status === 'Awaiting Response') {
        console.log(`✅ CONDITION MET: Deal has Awaiting Response quote`);
        return { allowed: true };
      }
      console.log(`❌ CONDITION NOT MET: Deal does not have Awaiting Response quote`);
      return { allowed: false, message: "Deal must have a quote awaiting response to be placed in this stage" };
      
    case 'jobber-quote-changes-requested':
      if (quote && quote.status === 'Changes Requested') {
        console.log(`✅ CONDITION MET: Deal has Changes Requested quote`);
        return { allowed: true };
      }
      console.log(`❌ CONDITION NOT MET: Deal does not have Changes Requested quote`);
      return { allowed: false, message: "Deal must have a quote with changes requested to be placed in this stage" };
      
    case 'jobber-assessment-completed':
      if (request && request.status === 'Assessment complete') {
        console.log(`✅ CONDITION MET: Deal has Assessment complete request`);
        return { allowed: true };
      }
      console.log(`❌ CONDITION NOT MET: Deal does not have Assessment complete request`);
      return { allowed: false, message: "Deal must have a completed assessment to be placed in this stage" };
      
    case 'jobber-overdue-assessment':
      if (request && request.status === 'Overdue') {
        console.log(`✅ CONDITION MET: Deal has Overdue request`);
        return { allowed: true };
      }
      console.log(`❌ CONDITION NOT MET: Deal does not have Overdue request`);
      return { allowed: false, message: "Deal must have an overdue assessment to be placed in this stage" };
      
    case 'jobber-unscheduled-assessment':
      if (request && request.status === 'Unscheduled') {
        console.log(`✅ CONDITION MET: Deal has Unscheduled request`);
        return { allowed: true };
      }
      console.log(`❌ CONDITION NOT MET: Deal does not have Unscheduled request`);
      return { allowed: false, message: "Deal must have an unscheduled assessment to be placed in this stage" };
      
    default:
      console.log(`❌ UNKNOWN JOBBER STAGE: ${stageId}`);
      return { allowed: false, message: "Unknown Jobber stage" };
  }
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

// FIXED: Helper function to generate stage entered date that respects time limits with specific overdue deals
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

// NEW: Helper to determine if a quote was just created (within last 5 minutes)
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

// UPDATED: Pipeline stage assignment with manual movement tracking
const assignPipelineStage = (
  request: any, 
  newestQuote: any | null, 
  stages: any[], 
  isManuallyMovedFn?: (dealId: string) => boolean,
  getCurrentPositionFn?: (dealId: string) => string | null
): string | null => {
  console.log(`\n--- Assigning pipeline stage for request ${request.id} ---`);
  console.log(`Request status: ${request.status}, Newest quote: ${newestQuote?.id || 'none'}, Quote status: ${newestQuote?.status || 'N/A'}`);
  
  // STEP 0: Check if deal was manually moved and still meets conditions
  if (isManuallyMovedFn && getCurrentPositionFn && isManuallyMovedFn(request.id)) {
    const currentPosition = getCurrentPositionFn(request.id);
    const originalJobberStage = findJobberStageByPriority(request, newestQuote, stages);
    
    console.log(`🎯 MANUAL MOVEMENT CHECK: Deal ${request.id} was manually moved, current: ${currentPosition}, original would be: ${originalJobberStage}`);
    
    // If still meets original Jobber condition and is in a non-Jobber stage, respect manual position
    if (originalJobberStage && currentPosition && !isJobberStageId(currentPosition)) {
      console.log(`✅ RESPECTING MANUAL POSITION: Deal ${request.id} staying in ${currentPosition}`);
      return currentPosition;
    }
  }
  
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

// UPDATED: Quote pipeline stage assignment with manual movement tracking
const assignQuotePipelineStage = (
  quote: any, 
  stages: any[], 
  isManuallyMovedFn?: (dealId: string) => boolean,
  getCurrentPositionFn?: (dealId: string) => string | null
): string | null => {
  const quoteBasedDealId = `quote-${quote.id}`;
  console.log(`\n🔍 STANDALONE QUOTE STAGE ASSIGNMENT: Starting for quote ${quote.id}`);
  console.log(`📋 Quote details: status="${quote.status}", amount=${quote.amount}, clientId="${quote.clientId}", requestId="${quote.requestId || 'NONE'}"`);
  
  // STEP 0: Check if deal was manually moved and still meets conditions
  if (isManuallyMovedFn && getCurrentPositionFn && isManuallyMovedFn(quoteBasedDealId)) {
    const currentPosition = getCurrentPositionFn(quoteBasedDealId);
    const originalJobberStage = findJobberStageByPriority(null, quote, stages);
    
    console.log(`🎯 MANUAL MOVEMENT CHECK: Quote ${quote.id} was manually moved, current: ${currentPosition}, original would be: ${originalJobberStage}`);
    
    // If still meets original Jobber condition and is in a non-Jobber stage, respect manual position
    if (originalJobberStage && currentPosition && !isJobberStageId(currentPosition)) {
      console.log(`✅ RESPECTING MANUAL POSITION: Quote ${quote.id} staying in ${currentPosition}`);
      return currentPosition;
    }
  }
  
  // Check for priority-based Jobber stage matches
  console.log(`🎯 PRIORITY CHECK: Looking for Jobber stage matches for status "${quote.status}"`);
  const jobberStageMatch = findJobberStageByPriority(null, quote, stages);
  if (jobberStageMatch) {
    console.log(`✅ JOBBER STAGE MATCH: Standalone quote ${quote.id} matched to Jobber stage: ${jobberStageMatch}`);
    return jobberStageMatch;
  }
  
  console.log(`❌ NO JOBBER STAGE MATCH: No priority-based match found for status "${quote.status}"`);
  
  // AUTO CLOSED-WON: Approved and Converted quotes shouldn't be in pipeline
  if (quote.status === 'Approved' || quote.status === 'Converted') {
    console.log(`❌ AUTO CLOSED-WON: Standalone quote ${quote.id} EXCLUDED from pipeline - status is ${quote.status}`);
    return null;
  }
  
  // Archived quotes should also be excluded
  if (quote.status === 'Archived') {
    console.log(`❌ ARCHIVED: Standalone quote ${quote.id} EXCLUDED from pipeline - status is archived`);
    return null;
  }
  
  // RESTORED: Original fallback logic - use new-deals for standalone quotes that don't match Jobber stages
  console.log(`✅ FALLBACK ASSIGNMENT: Standalone quote ${quote.id} using fallback new-deals stage for status: ${quote.status}`);
  return 'new-deals';
};

// SIMPLIFIED: Convert requests to deals for the pipeline
const createDealsFromRequests = (
  sessionClients: any[] = [], 
  sessionRequests: any[] = [], 
  sessionQuotes: any[] = [], 
  stages: any[] = [],
  isManuallyMovedFn?: (dealId: string) => boolean,
  getCurrentPositionFn?: (dealId: string) => string | null
): Deal[] => {
  console.log('Creating deals from requests. Session requests:', sessionRequests.length);
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
    const newestQuote = getNewestQuoteForRequest(request.id, sessionQuotes);
    console.log(`Request ${request.id} newest quote:`, newestQuote?.id || 'none', 'amount:', newestQuote?.amount);
    
    // ENHANCED AUTO CLOSED-WON LOGIC: Exclude deals with approved/converted quotes
    if (newestQuote && (newestQuote.status === 'Approved' || newestQuote.status === 'Converted')) {
      console.log(`Request ${request.id} EXCLUDED from pipeline - newest quote ${newestQuote.id} is ${newestQuote.status} (AUTO CLOSED-WON)`);
      return null; // This ensures the deal won't appear in the pipeline
    }
    
    // Determine pipeline stage with manual movement tracking
    const pipelineStage = assignPipelineStage(request, newestQuote, stages, isManuallyMovedFn, getCurrentPositionFn);
    
    // If pipeline stage is null (closed won or excluded), don't include in pipeline
    if (!pipelineStage) {
      console.log(`Request ${request.id} EXCLUDED from pipeline - no valid stage`);
      return null;
    }
    
    // FIXED: Only include amount if there's a quote with valid numeric amount
    const amount = newestQuote && typeof newestQuote.amount === 'number' && newestQuote.amount > 0 ? newestQuote.amount : undefined;
    console.log(`Request ${request.id} final amount:`, amount);
    
    // UPDATED: Generate realistic dates using the improved function
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

const createAllDealsFromRequests = (
  sessionClients: any[] = [], 
  sessionRequests: any[] = [], 
  sessionQuotes: any[] = [], 
  stages: any[] = []
): Deal[] => {
  console.log('Creating ALL deals from requests (including closed). Session requests:', sessionRequests.length);
  const requestsWithClients = getRequestsWithClientInfo(sessionClients, sessionRequests);
  console.log('Requests with client info:', requestsWithClients.length);
  
  // ALIGNED: Use same filtering logic as createDealsFromRequests for active deals
  const activeRequests = requestsWithClients.filter(request => {
    console.log(`Request ${request.id} has status: ${request.status}`);
    // Include requests with statuses that should appear in pipeline
    return ['New', 'Assessment complete', 'Overdue', 'Unscheduled'].includes(request.status) &&
           !['Archived', 'Closed Lost', 'Closed Won'].includes(request.status);
  });
  
  // SEPARATE: Also get explicitly closed deals for list view reporting
  const closedRequests = requestsWithClients.filter(request => {
    return ['Closed Won', 'Closed Lost'].includes(request.status);
  });
  
  const allRequests = [...activeRequests, ...closedRequests];
  console.log('Active requests for list view:', activeRequests.length, 'Closed requests:', closedRequests.length, 'Total:', allRequests.length);
  
  const deals = allRequests.map((request) => {
    // Find the newest quote for this request
    const newestQuote = getNewestQuoteForRequest(request.id, sessionQuotes);
    console.log(`Request ${request.id} newest quote:`, newestQuote?.id || 'none', 'amount:', newestQuote?.amount);
    
    // ALIGNED: Apply same exclusion logic for approved/converted quotes
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
    
    // FIXED: Only include amount if there's a quote with valid numeric amount
    const amount = newestQuote && typeof newestQuote.amount === 'number' && newestQuote.amount > 0 ? newestQuote.amount : undefined;
    console.log(`Request ${request.id} final amount:`, amount);
    
    // UPDATED: Generate realistic dates using the improved function
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

// RESTORED: Original comprehensive standalone quote processing
const createDealsFromStandaloneQuotes = (
  sessionClients: any[] = [], 
  sessionQuotes: any[] = [], 
  stages: any[] = [],
  isManuallyMovedFn?: (dealId: string) => boolean,
  getCurrentPositionFn?: (dealId: string) => string | null
): Deal[] => {
  console.log('\n🚀 STANDALONE QUOTE PROCESSING: Starting conversion to deals');
  console.log(`📊 Input: ${sessionQuotes.length} quotes, ${sessionClients.length} clients, ${stages.length} stages`);
  
  // Enhanced validation and error handling
  if (!sessionQuotes || sessionQuotes.length === 0) {
    console.log('⚠️ NO QUOTES: No session quotes available');
    return [];
  }
  
  if (!sessionClients || sessionClients.length === 0) {
    console.log('⚠️ NO CLIENTS: No session clients available');
    return [];
  }
  
  if (!stages || stages.length === 0) {
    console.log('⚠️ NO STAGES: No stages available');
    return [];
  }
  
  // Log all quotes for debugging
  console.log('\n📋 ALL QUOTES ANALYSIS:');
  sessionQuotes.forEach((quote, index) => {
    console.log(`  Quote ${index + 1}: id="${quote.id}", status="${quote.status}", amount=${quote.amount} (type: ${typeof quote.amount}), clientId="${quote.clientId}", requestId="${quote.requestId || 'NONE'}", createdDate="${quote.createdDate}"`);
  });
  
  // SIMPLIFIED: Filter to just standalone quotes with basic validation
  console.log('\n🔍 STANDALONE QUOTE FILTERING:');
  const standaloneQuotes = sessionQuotes.filter(quote => {
    console.log(`\n--- Filtering quote ${quote.id} ---`);
    console.log(`  requestId: ${quote.requestId || 'NONE (standalone)'}`);
    console.log(`  status: ${quote.status}`);
    console.log(`  amount: ${quote.amount} (type: ${typeof quote.amount})`);
    console.log(`  clientId: ${quote.clientId}`);
    
    // Must be standalone (no requestId)
    if (quote.requestId) {
      console.log(`❌ HAS REQUEST ID: Quote ${quote.id} EXCLUDED - linked to request: ${quote.requestId}`);
      return false;
    }
    
    // AUTO CLOSED-WON LOGIC: Exclude approved/converted quotes from pipeline
    if (quote.status === 'Approved' || quote.status === 'Converted') {
      console.log(`❌ AUTO CLOSED-WON: Quote ${quote.id} EXCLUDED from pipeline - status is ${quote.status}`);
      return false;
    }
    
    // Must not be archived, closed lost, or closed won for pipeline
    if (['Archived', 'Closed Lost', 'Closed Won'].includes(quote.status)) {
      console.log(`❌ EXCLUDED STATUS: Quote ${quote.id} EXCLUDED from pipeline - status is ${quote.status}`);
      return false;
    }
    
    console.log(`💰 AMOUNT VALIDATION: Original amount: ${quote.amount} (type: ${typeof quote.amount})`);
    const numericAmount = typeof quote.amount === 'string' ? parseFloat(quote.amount) : quote.amount;
    console.log(`💰 AMOUNT VALIDATION: Converted amount: ${numericAmount} (type: ${typeof numericAmount})`);
    
    const hasValidAmount = typeof numericAmount === 'number' && !isNaN(numericAmount) && numericAmount > 0;
    const hasValidClient = !!quote.clientId;
    
    if (!hasValidAmount) {
      console.log(`❌ INVALID AMOUNT: Quote ${quote.id} EXCLUDED - amount: ${quote.amount} -> ${numericAmount} (valid: ${hasValidAmount})`);
      return false;
    }
    
    if (!hasValidClient) {
      console.log(`❌ INVALID CLIENT: Quote ${quote.id} EXCLUDED - missing clientId`);
      return false;
    }
    
    console.log(`✅ QUOTE PASSED FILTERING: ${quote.id} is a valid standalone quote`);
    return true;
  });
  
  console.log(`\n📊 FILTERING RESULTS: ${standaloneQuotes.length} standalone quotes passed filtering`);
  standaloneQuotes.forEach(q => console.log(`  ✅ Standalone: ${q.id} (${q.status}, $${q.amount}) for client ${q.clientId}`));
  
  // Create deals with enhanced client lookup
  console.log('\n🔧 DEAL CREATION: Converting standalone quotes to deals');
  const deals = standaloneQuotes.map((quote) => {
    console.log(`\n--- Creating deal for quote ${quote.id} ---`);
    
    // Find client for this quote
    const client = sessionClients.find(c => c.id === quote.clientId);
    if (!client) {
      console.log(`❌ CLIENT NOT FOUND: Quote ${quote.id} references missing client ${quote.clientId}, SKIPPING`);
      return null;
    }
    
    console.log(`✅ CLIENT FOUND: ${client.name} for quote ${quote.id}`);
    
    const pipelineStage = assignQuotePipelineStage(quote, stages, isManuallyMovedFn, getCurrentPositionFn);
    
    // If pipelineStage is null, don't include this quote
    if (!pipelineStage) {
      console.log(`❌ NO STAGE ASSIGNED: Quote ${quote.id} EXCLUDED - no valid pipeline stage`);
      return null;
    }
    
    console.log(`✅ STAGE ASSIGNED: Quote ${quote.id} will be placed in stage: ${pipelineStage}`);
    
    const finalAmount = typeof quote.amount === 'string' ? parseFloat(quote.amount) : quote.amount;
    console.log(`💰 DEAL CREATION: Final amount for deal: ${finalAmount} (type: ${typeof finalAmount})`);
    
    // UPDATED: Generate realistic dates using the improved function
    let createdAt: string;
    let stageEnteredDate: string;
    
    if (isRecentlyCreatedQuote(quote.createdDate)) {
      console.log(`🕐 RECENT QUOTE: Using current timestamps for quote ${quote.id}`);
      createdAt = quote.createdDate;
      stageEnteredDate = new Date().toISOString(); // Current time for stage entry
    } else {
      console.log(`🕐 OLDER QUOTE: Using generated timestamps for quote ${quote.id}`);
      createdAt = generateOtherDealDate();
      stageEnteredDate = generateStageEnteredDate(createdAt, pipelineStage, `quote-${quote.id}`);
    }
    
    // Enhanced validation for deal creation
    const dealData = {
      id: `quote-${quote.id}`, // Prefix to avoid ID conflicts with requests
      client: client.name,
      title: quote.quoteNumber, // Use quote number as title for standalone quotes
      property: quote.property || client.primaryAddress || 'Property not specified',
      contact: [client.phone, client.email].filter(Boolean).join('\n') || 'No contact info',
      requested: quote.createdDate || new Date().toISOString(),
      amount: finalAmount, // Always present for quotes and validated above
      status: pipelineStage,
      type: 'quote' as const,
      quoteId: quote.id,
      createdAt,
      stageEnteredDate
    };
    
    console.log(`✅ DEAL CREATED: ${dealData.id}`);
    console.log(`  - Client: ${dealData.client}`);
    console.log(`  - Status: ${dealData.status}`);
    console.log(`  - Amount: $${dealData.amount} (type: ${typeof dealData.amount})`);
    console.log(`  - Title: ${dealData.title}`);
    console.log(`  - Stage entered: ${dealData.stageEnteredDate}`);
    
    return dealData;
  }).filter(Boolean); // Remove null entries
  
  console.log(`\n📊 FINAL RESULTS: ${deals.length} deals created from standalone quotes`);
  deals.forEach(d => console.log(`  📋 Deal: ${d.id} (${d.status}, $${d.amount}) for ${d.client}`));
  console.log('🏁 STANDALONE QUOTE PROCESSING: Complete\n');
  
  return deals;
};

const createAllDealsFromStandaloneQuotes = (
  sessionClients: any[] = [], 
  sessionQuotes: any[] = [], 
  stages: any[] = []
): Deal[] => {
  console.log('\n🚀 ALL STANDALONE QUOTE PROCESSING: Starting conversion to deals (including closed)');
  console.log(`📊 Input: ${sessionQuotes.length} quotes, ${sessionClients.length} clients, ${stages.length} stages`);
  
  // Enhanced validation and error handling
  if (!sessionQuotes || sessionQuotes.length === 0) {
    console.log('⚠️ NO QUOTES: No session quotes available');
    return [];
  }
  
  if (!sessionClients || sessionClients.length === 0) {
    console.log('⚠️ NO CLIENTS: No session clients available');
    return [];
  }
  
  if (!stages || stages.length === 0) {
    console.log('⚠️ NO STAGES: No stages available');
    return [];
  }
  
  // Log all quotes for debugging
  console.log('\n📋 ALL QUOTES ANALYSIS:');
  sessionQuotes.forEach((quote, index) => {
    console.log(`  Quote ${index + 1}: id="${quote.id}", status="${quote.status}", amount=${quote.amount} (type: ${typeof quote.amount}), clientId="${quote.clientId}", requestId="${quote.requestId || 'NONE'}", createdDate="${quote.createdDate}"`);
  });
  
  // SIMPLIFIED: Filter to just standalone quotes with basic validation (including closed statuses)
  console.log('\n🔍 ALL STANDALONE QUOTE FILTERING:');
  const standaloneQuotes = sessionQuotes.filter(quote => {
    console.log(`\n--- Filtering quote ${quote.id} ---`);
    console.log(`  requestId: ${quote.requestId || 'NONE (standalone)'}`);
    console.log(`  status: ${quote.status}`);
    console.log(`  amount: ${quote.amount} (type: ${typeof quote.amount})`);
    console.log(`  clientId: ${quote.clientId}`);
    
    // Must be standalone (no requestId)
    if (quote.requestId) {
      console.log(`❌ HAS REQUEST ID: Quote ${quote.id} EXCLUDED - linked to request: ${quote.requestId}`);
      return false;
    }
    
    // Only exclude archived quotes from list view
    if (quote.status === 'Archived') {
      console.log(`❌ ARCHIVED: Quote ${quote.id} EXCLUDED from list - status is archived`);
      return false;
    }
    
    // PHASE 2: Add Defensive Type Handling in Pipeline Logic
    console.log(`💰 AMOUNT VALIDATION: Original amount: ${quote.amount} (type: ${typeof quote.amount})`);
    const numericAmount = typeof quote.amount === 'string' ? parseFloat(quote.amount) : quote.amount;
    console.log(`💰 AMOUNT VALIDATION: Converted amount: ${numericAmount} (type: ${typeof numericAmount})`);
    
    const hasValidAmount = typeof numericAmount === 'number' && !isNaN(numericAmount) && numericAmount > 0;
    const hasValidClient = !!quote.clientId;
    
    if (!hasValidAmount) {
      console.log(`❌ INVALID AMOUNT: Quote ${quote.id} EXCLUDED - amount: ${quote.amount} -> ${numericAmount} (valid: ${hasValidAmount})`);
      return false;
    }
    
    if (!hasValidClient) {
      console.log(`❌ INVALID CLIENT: Quote ${quote.id} EXCLUDED - missing clientId`);
      return false;
    }
    
    console.log(`✅ QUOTE PASSED FILTERING: ${quote.id} is a valid standalone quote`);
    return true;
  });
  
  console.log(`\n📊 FILTERING RESULTS: ${standaloneQuotes.length} standalone quotes passed filtering`);
  standaloneQuotes.forEach(q => console.log(`  ✅ Standalone: ${q.id} (${q.status}, $${q.amount}) for client ${q.clientId}`));
  
  // Create deals with enhanced client lookup
  console.log('\n🔧 DEAL CREATION: Converting standalone quotes to deals');
  const deals = standaloneQuotes.map((quote) => {
    console.log(`\n--- Creating deal for quote ${quote.id} ---`);
    
    // Find client for this quote
    const client = sessionClients.find(c => c.id === quote.clientId);
    if (!client) {
      console.log(`❌ CLIENT NOT FOUND: Quote ${quote.id} references missing client ${quote.clientId}, SKIPPING`);
      return null;
    }
    
    console.log(`✅ CLIENT FOUND: ${client.name} for quote ${quote.id}`);
    
    // For closed won/lost/approved/converted quotes, use those statuses directly
    let finalStatus = quote.status;
    if (quote.status === 'Approved' || quote.status === 'Converted') {
      finalStatus = 'Closed Won';
    } else if (!['Closed Won', 'Closed Lost'].includes(quote.status)) {
      // For open quotes, determine pipeline stage
      const pipelineStage = assignQuotePipelineStage(quote, stages);
      if (pipelineStage) {
        finalStatus = pipelineStage;
      }
    }
    
    console.log(`✅ STAGE ASSIGNED: Quote ${quote.id} will have status: ${finalStatus}`);
    
    // PHASE 2: Ensure proper amount handling in deal creation
    const finalAmount = typeof quote.amount === 'string' ? parseFloat(quote.amount) : quote.amount;
    console.log(`💰 DEAL CREATION: Final amount for deal: ${finalAmount} (type: ${typeof finalAmount})`);
    
    // UPDATED: Generate realistic dates using the improved function
    let createdAt: string;
    let stageEnteredDate: string;
    
    if (isRecentlyCreatedQuote(quote.createdDate)) {
      console.log(`🕐 RECENT QUOTE: Using current timestamps for quote ${quote.id}`);
      createdAt = quote.createdDate;
      stageEnteredDate = new Date().toISOString(); // Current time for stage entry
    } else {
      console.log(`🕐 OLDER QUOTE: Using generated timestamps for quote ${quote.id}`);
      createdAt = generateOtherDealDate();
      stageEnteredDate = generateStageEnteredDate(createdAt, finalStatus, `quote-${quote.id}`);
    }
    
    // Enhanced validation for deal creation
    const dealData = {
      id: `quote-${quote.id}`, // Prefix to avoid ID conflicts with requests
      client: client.name,
      title: quote.quoteNumber, // Use quote number as title for standalone quotes
      property: quote.property || client.primaryAddress || 'Property not specified',
      contact: [client.phone, client.email].filter(Boolean).join('\n') || 'No contact info',
      requested: quote.createdDate || new Date().toISOString(),
      amount: finalAmount, // Always present for quotes and validated above
      status: finalStatus,
      type: 'quote' as const,
      quoteId: quote.id,
      createdAt,
      stageEnteredDate
    };
    
    console.log(`✅ DEAL CREATED: ${dealData.id}`);
    console.log(`  - Client: ${dealData.client}`);
    console.log(`  - Status: ${dealData.status}`);
    console.log(`  - Amount: $${dealData.amount} (type: ${typeof dealData.amount})`);
    console.log(`  - Title: ${dealData.title}`);
    console.log(`  - Stage entered: ${dealData.stageEnteredDate}`);
    
    return dealData;
  }).filter(Boolean); // Remove null entries
  
  console.log(`\n📊 FINAL RESULTS: ${deals.length} deals created from standalone quotes`);
  deals.forEach(d => console.log(`  📋 Deal: ${d.id} (${d.status}, $${d.amount}) for ${d.client}`));
  console.log('🏁 ALL STANDALONE QUOTE PROCESSING: Complete\n');
  
  return deals;
};

// UPDATED: Main function with manual movement tracking support
export const createInitialDeals = (
  sessionClients: any[] = [], 
  sessionRequests: any[] = [], 
  sessionQuotes: any[] = [], 
  stages: any[] = [],
  isManuallyMovedFn?: (dealId: string) => boolean,
  getCurrentPositionFn?: (dealId: string) => string | null
): Deal[] => {
  console.log('\n=== 🚀 SIMPLIFIED PIPELINE DATA CREATION WITH COMPREHENSIVE DEBUGGING ===');
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
  
  // Create deals from open requests
  const requestDeals = createDealsFromRequests(sessionClients, sessionRequests, sessionQuotes, stages, isManuallyMovedFn, getCurrentPositionFn);
  
  // Create deals from standalone quotes
  const standaloneQuoteDeals = createDealsFromStandaloneQuotes(sessionClients, sessionQuotes, stages, isManuallyMovedFn, getCurrentPositionFn);
  
  const totalDeals = [...requestDeals, ...standaloneQuoteDeals];
  console.log('✅ Total pipeline deals created:', totalDeals.length);
  console.log('  - Request deals:', requestDeals.length);
  console.log('  - Standalone quote deals:', standaloneQuoteDeals.length);
  console.log('📊 Pipeline deals by status:', totalDeals.reduce((acc, deal) => {
    acc[deal.status] = (acc[deal.status] || 0) + 1;
    return acc;
  }, {} as Record<string, number>));
  console.log('=== 🏁 END SIMPLIFIED PIPELINE DATA CREATION ===\n');
  
  return totalDeals;
};

// NEW: Main function for creating ALL deals (including closed won/lost)
export const createAllDeals = (
  sessionClients: any[] = [], 
  sessionRequests: any[] = [], 
  sessionQuotes: any[] = [], 
  stages: any[] = []
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
  const requestDeals = createAllDealsFromRequests(sessionClients, sessionRequests, sessionQuotes, stages);
  
  // Create deals from standalone quotes (including closed)
  const standaloneQuoteDeals = createAllDealsFromStandaloneQuotes(sessionClients, sessionQuotes, stages);
  
  const totalDeals = [...requestDeals, ...standaloneQuoteDeals];
  console.log('✅ Total ALL deals created:', totalDeals.length);
  console.log('  - Request deals:', requestDeals.length);
  console.log('  - Standalone quote deals:', standaloneQuoteDeals.length);
  console.log('📊 All deals by status:', totalDeals.reduce((acc, deal) => {
    acc[deal.status] = (acc[deal.status] || 0) + 1;
    return acc;
  }, {} as Record<string, number>));
  console.log('=== 🏁 END ALL DEALS CREATION ===\n');
  
  return totalDeals;
};

// UPDATED: Enhanced validation function - no longer blocks drag FROM any stage
export const canDragFromJobberStage = (dealId: string, sourceStageId: string): {
  allowed: boolean;
  message?: string;
} => {
  console.log('✅ DRAG FROM VALIDATION: Always allowing drag from any stage (including Jobber stages)');
  return { allowed: true };
};

// UPDATED: Enhanced validation function with conditional Jobber stage drops
export const canDropInJobberStage = (
  dealId: string, 
  targetStageId: string,
  deals: Deal[] = [],
  sessionRequests: any[] = [],
  sessionQuotes: any[] = []
): {
  allowed: boolean;
  message?: string;
} => {
  console.log('🔍 DRAG VALIDATION: Checking drop for deal:', dealId, 'to stage:', targetStageId);
  
  // If not a Jobber stage, allow the drop
  if (!isJobberStageId(targetStageId)) {
    console.log('✅ DRAG ALLOWED: Target is not a Jobber stage');
    return { allowed: true };
  }
  
  // Find the deal
  const deal = deals.find(d => d.id === dealId);
  if (!deal) {
    console.log('❌ DRAG BLOCKED: Deal not found');
    return { allowed: false, message: "Deal not found" };
  }
  
  // Check if deal meets the condition for this Jobber stage
  const conditionCheck = checkJobberStageCondition(deal, targetStageId, sessionRequests, sessionQuotes);
  
  if (!conditionCheck.allowed) {
    console.log('🚫 DRAG BLOCKED: Condition not met for Jobber stage:', conditionCheck.message);
  } else {
    console.log('✅ DRAG ALLOWED: Deal meets Jobber stage condition');
  }
  
  return conditionCheck;
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
