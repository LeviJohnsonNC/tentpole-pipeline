
import { getRequestsWithClientInfo, RequestWithClient } from '@/utils/dataHelpers';

interface Deal {
  id: string;
  client: string;
  title: string;
  property: string;
  contact: string;
  requested: string;
  amount: number;
  status: string; // Pipeline status, not request status
}

// Mapping function to assign pipeline stages to "New" requests
const assignPipelineStage = (requestId: string): string => {
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
const createDealsFromRequests = (): Deal[] => {
  const requestsWithClients = getRequestsWithClientInfo();
  
  // Only include requests with status 'New' (open requests for pipeline)
  const openRequests = requestsWithClients.filter(request => request.status === 'New');
  
  return openRequests.map((request) => ({
    id: request.id,
    client: request.client.name,
    title: request.title || 'Service Request',
    property: request.client.primaryAddress,
    contact: [request.client.phone, request.client.email].filter(Boolean).join('\n'),
    requested: request.requestDate,
    amount: getEstimatedAmount(request.serviceDetails, request.title),
    status: assignPipelineStage(request.id) // Pipeline status mapping
  }));
};

export const initialDeals: Deal[] = createDealsFromRequests();

export const pipelineColumns = [
  { id: "new-deals", title: "New Deals" },
  { id: "contacted", title: "Contacted" },
  { id: "quote-sent", title: "Quote Sent" },
  { id: "followup", title: "Followup" }
];

export type { Deal };
