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

// JOBBER_STAGE_IDS - Centralized mapping of Jobber stage titles to their IDs
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
    case 'new-opportunities':
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

// NEW: Function to create deals from requests
const createAllDealsFromRequests = (
  sessionClients: any[] = [], 
  sessionRequests: any[] = [], 
  sessionQuotes: any[] = [], 
  stages: any[] = []
): Deal[] => {
  const requestsWithClients = getRequestsWithClientInfo(sessionRequests, sessionClients);
  const quotesWithClients = getQuotesWithClientInfo(sessionQuotes, sessionClients);
  
  return requestsWithClients.map(request => {
    const client = sessionClients.find(c => c.id === request.clientId);
    const relatedQuote = quotesWithClients.find(q => q.requestId === request.id);
    
    // Determine stage based on request status
    let stageId = request.status;
    if (request.status === 'New') {
      stageId = 'new-opportunities';
    } else if (request.status === 'Assessment complete') {
      stageId = 'jobber-assessment-completed';
    } else if (request.status === 'Unscheduled') {
      stageId = 'jobber-unscheduled-assessment';
    } else if (request.status === 'Overdue') {
      stageId = 'jobber-overdue-assessment';
    }
    
    const createdAt = stageId === 'new-opportunities' ? generateNewDealDate() : generateOtherDealDate();
    const stageEnteredDate = generateStageEnteredDate(createdAt, stageId, request.id);
    
    return {
      id: request.id,
      client: client?.name || 'Unknown Client',
      title: request.title,
      property: request.property,
      contact: client?.phone || 'No phone',
      requested: request.requestDate,
      amount: relatedQuote?.amount || request.estimatedValue,
      status: stageId,
      type: 'request' as const,
      quoteId: relatedQuote?.id,
      createdAt,
      stageEnteredDate
    };
  });
};

// NEW: Function to create deals from standalone quotes
const createAllDealsFromStandaloneQuotes = (
  sessionClients: any[] = [], 
  sessionQuotes: any[] = [], 
  stages: any[] = []
): Deal[] => {
  const quotesWithClients = getQuotesWithClientInfo(sessionQuotes, sessionClients);
  
  return quotesWithClients
    .filter(quote => !quote.requestId) // Only standalone quotes
    .map(quote => {
      const client = sessionClients.find(c => c.id === quote.clientId);
      
      // Determine stage based on quote status
      let stageId = quote.status;
      if (quote.status === 'Draft') {
        stageId = 'draft-quote';
      } else if (quote.status === 'Sent') {
        stageId = 'quote-awaiting-response';
      }
      
      const createdAt = generateOtherDealDate();
      const stageEnteredDate = generateStageEnteredDate(createdAt, stageId, quote.id);
      
      return {
        id: quote.id,
        client: client?.name || 'Unknown Client',
        title: quote.title,
        property: quote.property,
        contact: client?.phone || 'No phone',
        requested: quote.createdAt,
        amount: quote.amount,
        status: stageId,
        type: 'quote' as const,
        quoteId: quote.id,
        createdAt,
        stageEnteredDate
      };
    });
};

// NEW: Function to generate sample closed deals for realistic data
const generateClosedDeals = (wonCount: number, lostCount: number): Deal[] => {
  console.log(`🎲 GENERATING CLOSED DEALS: ${wonCount} won, ${lostCount} lost`);
  
  const sampleClients = [
    'Alpine Property Management', 'Bridgeland Dental Clinic', 'Cornerstone Retail Group',
    'Downtown Office Tower', 'Evergreen Landscaping Co', 'Foothills Medical Center',
    'Golden Triangle Restaurant', 'Heritage Park Condos', 'Inglewood Bakery & Cafe',
    'Kensington Hair Salon', 'Lynwood Community Center', 'Mission District Apartments',
    'Northland Village Mall', 'Olympic Plaza Hotel', 'Panorama Hills Daycare',
    'Quarry Park Dental', 'Ramsay Auto Repair', 'Sunalta Fitness Center',
    'Tuscany Golf Club', 'University Heights Clinic', 'Varsity Estates HOA',
    'Westbrook Shopping Plaza', 'Yorkville Luxury Condos', 'Zen Garden Spa'
  ];

  const sampleServices = [
    'Spring Lawn Care Package', 'Exterior Building Wash', 'Parking Lot Maintenance',
    'Garden Landscape Design', 'Pressure Washing Service', 'Tree Removal & Cleanup',
    'Deck Restoration Project', 'Commercial Window Cleaning', 'Driveway Sealing',
    'Flower Bed Installation', 'Hedge Trimming Service', 'Irrigation System Setup',
    'Patio Stone Cleaning', 'Roof Moss Removal', 'Sidewalk Power Washing',
    'Snow Removal Contract', 'Weed Control Treatment', 'Yard Debris Cleanup'
  ];

  const sampleAddresses = [
    '1234 Main Street SW, Calgary, AB', '5678 Centre Street NE, Calgary, AB',
    '9012 Bow Trail SE, Calgary, AB', '3456 Memorial Drive NW, Calgary, AB',
    '7890 Crowchild Trail SW, Calgary, AB', '2468 Macleod Trail SE, Calgary, AB',
    '1357 Kensington Road NW, Calgary, AB', '9753 17th Avenue SW, Calgary, AB',
    '8642 Edmonton Trail NE, Calgary, AB', '4321 Elbow Drive SW, Calgary, AB'
  ];

  const salespeople = ['Mike Johnson', 'Lisa Chen', 'David Park', 'Sarah Mitchell'];
  
  const deals: Deal[] = [];
  
  // Generate won deals
  for (let i = 0; i < wonCount; i++) {
    const clientName = sampleClients[Math.floor(Math.random() * sampleClients.length)];
    const serviceTitle = sampleServices[Math.floor(Math.random() * sampleServices.length)];
    const address = sampleAddresses[Math.floor(Math.random() * sampleAddresses.length)];
    const salesperson = salespeople[Math.floor(Math.random() * salespeople.length)];
    
    // Generate amounts between $200 and $5000
    const amount = Math.floor(Math.random() * 4800) + 200;
    
    // Generate dates from past 12 months
    const daysAgo = Math.floor(Math.random() * 365);
    const closedDate = new Date();
    closedDate.setDate(closedDate.getDate() - daysAgo);
    
    // Stage entered date (when deal was closed) - same as closed date
    const stageEnteredDate = closedDate.toISOString();
    
    // Created date (5-60 days before closed date)
    const createdDaysAgo = Math.floor(Math.random() * 55) + 5;
    const createdDate = new Date(closedDate);
    createdDate.setDate(createdDate.getDate() - createdDaysAgo);
    
    deals.push({
      id: `generated-won-${i + 1}`,
      client: clientName,
      title: serviceTitle,
      property: address,
      contact: `(403) 555-${String(Math.floor(Math.random() * 9000) + 1000)}`,
      requested: createdDate.toISOString().split('T')[0],
      amount: amount,
      status: 'Closed Won',
      type: Math.random() > 0.5 ? 'request' : 'quote',
      createdAt: createdDate.toISOString(),
      stageEnteredDate: stageEnteredDate
    });
  }
  
  // Generate lost deals
  for (let i = 0; i < lostCount; i++) {
    const clientName = sampleClients[Math.floor(Math.random() * sampleClients.length)];
    const serviceTitle = sampleServices[Math.floor(Math.random() * sampleServices.length)];
    const address = sampleAddresses[Math.floor(Math.random() * sampleAddresses.length)];
    const salesperson = salespeople[Math.floor(Math.random() * salespeople.length)];
    
    // Generate amounts between $150 and $3500 (slightly lower for lost deals)
    const amount = Math.floor(Math.random() * 3350) + 150;
    
    // Generate dates from past 12 months
    const daysAgo = Math.floor(Math.random() * 365);
    const closedDate = new Date();
    closedDate.setDate(closedDate.getDate() - daysAgo);
    
    // Stage entered date (when deal was lost) - same as closed date
    const stageEnteredDate = closedDate.toISOString();
    
    // Created date (5-60 days before closed date)
    const createdDaysAgo = Math.floor(Math.random() * 55) + 5;
    const createdDate = new Date(closedDate);
    createdDate.setDate(createdDate.getDate() - createdDaysAgo);
    
    deals.push({
      id: `generated-lost-${i + 1}`,
      client: clientName,
      title: serviceTitle,
      property: address,
      contact: `(403) 555-${String(Math.floor(Math.random() * 9000) + 1000)}`,
      requested: createdDate.toISOString().split('T')[0],
      amount: amount,
      status: 'Closed Lost',
      type: Math.random() > 0.5 ? 'request' : 'quote',
      createdAt: createdDate.toISOString(),
      stageEnteredDate: stageEnteredDate
    });
  }
  
  console.log(`✅ GENERATED: ${wonCount} won deals, ${lostCount} lost deals`);
  return deals;
};

// NEW: Function to create initial pipeline deals (excluding closed deals)
export const createInitialDeals = (
  sessionClients: any[] = [], 
  sessionRequests: any[] = [], 
  sessionQuotes: any[] = [], 
  stages: any[] = []
): Deal[] => {
  console.log('\n=== 🚀 INITIAL PIPELINE DEALS CREATION ===');
  console.log('Input data - Clients:', sessionClients.length, 'Requests:', sessionRequests.length, 'Quotes:', sessionQuotes.length);
  
  if (!sessionClients || sessionClients.length === 0) {
    console.warn('⚠️ No clients available - pipeline will be empty');
    return [];
  }
  
  if (!stages || stages.length === 0) {
    console.warn('⚠️ No stages available - pipeline will be empty');
    return [];
  }
  
  // Create deals from requests
  const requestDeals = createAllDealsFromRequests(sessionClients, sessionRequests, sessionQuotes, stages);
  
  // Create deals from standalone quotes
  const standaloneQuoteDeals = createAllDealsFromStandaloneQuotes(sessionClients, sessionQuotes, stages);
  
  // Filter out closed deals for pipeline view
  const pipelineDeals = [...requestDeals, ...standaloneQuoteDeals].filter(deal => 
    !deal.status.includes('Closed') && !deal.status.includes('Archived')
  );
  
  console.log('✅ Pipeline deals created:', pipelineDeals.length);
  console.log('=== 🏁 END INITIAL PIPELINE DEALS CREATION ===\n');
  
  return pipelineDeals;
};

// NEW: Main function for creating ALL deals (including closed won/lost) - UPDATED to include generated data
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
  
  // Generate additional closed deals to reach target numbers
  const generatedClosedDeals = generateClosedDeals(119, 87);
  
  const totalDeals = [...requestDeals, ...standaloneQuoteDeals, ...generatedClosedDeals];
  console.log('✅ Total ALL deals created:', totalDeals.length);
  console.log('  - Request deals:', requestDeals.length);
  console.log('  - Standalone quote deals:', standaloneQuoteDeals.length);
  console.log('  - Generated closed deals:', generatedClosedDeals.length);
  console.log('📊 All deals by status:', totalDeals.reduce((acc, deal) => {
    acc[deal.status] = (acc[deal.status] || 0) + 1;
    return acc;
  }, {} as Record<string, number>));
  console.log('=== 🏁 END ALL DEALS CREATION ===\n');
  
  return totalDeals;
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
  { id: "new-opportunities", title: "New Opportunities" },
  { id: "contacted", title: "Contacted" },
  { id: "draft-quote", title: "Draft Quote" },
  { id: "quote-awaiting-response", title: "Quote Awaiting Response" },
  { id: "followup", title: "Followup" }
];
