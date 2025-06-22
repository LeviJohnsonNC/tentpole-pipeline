
import { getRequestsWithClientInfo, RequestWithClient } from '@/utils/dataHelpers';

interface Deal {
  id: string; // Changed from number to string to match our data model
  client: string;
  title: string;
  property: string;
  contact: string;
  requested: string;
  amount: number;
  status: string; // Pipeline status, not request status
}

// Convert requests to deals for the pipeline
const createDealsFromRequests = (): Deal[] => {
  const requestsWithClients = getRequestsWithClientInfo();
  
  return requestsWithClients.map((request, index) => ({
    id: request.id, // Use string ID from request
    client: request.client.name,
    title: request.title || 'Service Request',
    property: request.client.primaryAddress,
    contact: [request.client.phone, request.client.email].filter(Boolean).join('\n'),
    requested: request.requestDate,
    amount: [45000, 25000, 5000, 18000, 15000, 15000][index] || 10000, // Sample amounts
    status: "new-deals" // Pipeline status, different from request status
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
