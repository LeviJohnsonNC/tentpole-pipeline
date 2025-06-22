
import { Request } from '@/types/Request';
import { getRequestsWithClientInfo, RequestWithClient } from '@/utils/dataHelpers';

interface Deal extends RequestWithClient {
  amount: number;
  status: string;
}

// Convert requests to deals for the pipeline
const createDealsFromRequests = (): Deal[] => {
  const requestsWithClients = getRequestsWithClientInfo();
  
  return requestsWithClients.map((request, index) => ({
    ...request,
    amount: [45000, 25000, 5000, 18000, 15000, 15000][index] || 10000, // Sample amounts
    status: "new-deals" // All start in new deals column
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
