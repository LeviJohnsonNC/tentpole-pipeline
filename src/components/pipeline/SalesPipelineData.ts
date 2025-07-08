import { Request } from '@/types/Request';
import { Quote } from '@/types/Quote';
import { Client } from '@/types/Client';
import { Stage } from '@/store/stagesStore';

export interface Deal {
  id: string;
  client: string;
  property: string;
  title: string;
  status: string;
  requested: string;
  amount?: number;
  salesperson: string;
  type: 'request' | 'quote';
  quoteId?: string;
  priority?: 'High' | 'Medium' | 'Low';
  notes?: string;
}

const mapRequestStatusToDealStatus = (requestStatus: string): string => {
  switch (requestStatus.toLowerCase()) {
    case 'new':
      return 'New Opportunities';
    case 'in progress':
    case 'contacted':
      return 'Contacted';
    case 'assessment complete':
      return 'Contacted';
    case 'converted':
      return 'Closed Won';
    case 'closed lost':
      return 'Closed Lost';
    case 'archived':
      return 'Closed Lost';
    case 'overdue':
      return 'Contacted';
    case 'unscheduled':
      return 'New Opportunities';
    default:
      return 'New Opportunities';
  }
};

const mapQuoteStatusToDealStatus = (quoteStatus: string): string => {
  switch (quoteStatus.toLowerCase()) {
    case 'draft':
      return 'Draft Quote';
    case 'sent':
    case 'awaiting response':
      return 'Quote Awaiting Response';
    case 'approved':
      return 'Quote Awaiting Response';
    case 'converted':
      return 'Closed Won';
    case 'closed lost':
      return 'Closed Lost';
    case 'changes requested':
      return 'Contacted';
    default:
      return 'Draft Quote';
  }
};

const createDealsFromRequests = (requests: Request[], clients: Client[]): Deal[] => {
  console.log('🎯 Creating deals from requests. Total requests:', requests.length);
  
  return requests
    .map(request => {
      const client = clients.find(c => c.id === request.clientId);
      if (!client) {
        console.log(`⚠️ No client found for request ${request.id} with clientId ${request.clientId}`);
        return null;
      }

      const dealStatus = mapRequestStatusToDealStatus(request.status);
      console.log(`📋 Request ${request.id}: ${request.status} → ${dealStatus}`);

      return {
        id: request.id,
        client: client.name,
        property: client.primaryAddress,
        title: request.title,
        status: dealStatus,
        requested: request.requestDate,
        salesperson: request.assignedTo || 'Unassigned',
        type: 'request' as const,
        priority: request.urgency,
        notes: request.notes
      };
    })
    .filter((deal): deal is Deal => deal !== null);
};

const createDealsFromStandaloneQuotes = (quotes: Quote[], clients: Client[], existingRequestIds: Set<string>): Deal[] => {
  console.log('💰 Creating deals from standalone quotes. Total quotes:', quotes.length);
  
  return quotes
    .filter(quote => !quote.requestId || !existingRequestIds.has(quote.requestId))
    .map(quote => {
      const client = clients.find(c => c.id === quote.clientId);
      if (!client) {
        console.log(`⚠️ No client found for quote ${quote.id} with clientId ${quote.clientId}`);
        return null;
      }

      const dealStatus = mapQuoteStatusToDealStatus(quote.status);
      console.log(`💵 Quote ${quote.id}: ${quote.status} → ${dealStatus}`);

      return {
        id: `quote-${quote.id}`,
        client: client.name,
        property: client.primaryAddress,
        title: quote.title,
        status: dealStatus,
        requested: quote.createdDate,
        amount: quote.amount,
        salesperson: quote.salesperson || 'Unassigned',
        type: 'quote' as const,
        quoteId: quote.id,
        notes: `Quote #${quote.quoteNumber}`
      };
    })
    .filter((deal): deal is Deal => deal !== null);
};

export const createAllDeals = (requests: Request[], quotes: Quote[], clients: Client[]): Deal[] => {
  console.log('\n=== 🚀 CREATING ALL DEALS WITH COMPREHENSIVE DEBUGGING ===');
  console.log(`Input data - Requests: ${requests.length}, Quotes: ${quotes.length}, Clients: ${clients.length}`);

  const requestDeals = createDealsFromRequests(requests, clients);
  console.log(`✅ Created ${requestDeals.length} deals from requests`);

  const existingRequestIds = new Set(requests.map(r => r.id));
  const quoteDeals = createDealsFromStandaloneQuotes(quotes, clients, existingRequestIds);
  console.log(`✅ Created ${quoteDeals.length} deals from standalone quotes`);

  const allDeals = [...requestDeals, ...quoteDeals];
  console.log(`🎯 Total deals created: ${allDeals.length}`);

  // Debug status distribution
  const statusCounts = allDeals.reduce((acc, deal) => {
    acc[deal.status] = (acc[deal.status] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);
  
  console.log('📊 Deal status distribution:', statusCounts);
  
  // Specifically check for closed deals
  const closedWonDeals = allDeals.filter(deal => deal.status === 'Closed Won');
  const closedLostDeals = allDeals.filter(deal => deal.status === 'Closed Lost');
  
  console.log(`🏆 Closed Won deals: ${closedWonDeals.length}`);
  console.log(`❌ Closed Lost deals: ${closedLostDeals.length}`);
  
  if (closedWonDeals.length > 0) {
    console.log('🏆 Sample Closed Won deals:', closedWonDeals.slice(0, 3).map(d => ({ id: d.id, client: d.client, status: d.status })));
  }
  
  if (closedLostDeals.length > 0) {
    console.log('❌ Sample Closed Lost deals:', closedLostDeals.slice(0, 3).map(d => ({ id: d.id, client: d.client, status: d.status })));
  }

  return allDeals;
};

export const createInitialDeals = (requests: Request[], quotes: Quote[], clients: Client[], stages: Stage[]): Deal[] => {
  console.log('\n🚀 PIPELINE INIT: Creating initial deals for pipeline');
  
  const allDeals = createAllDeals(requests, quotes, clients);
  
  // Filter out closed deals for the pipeline view (keep only open deals)
  const openDeals = allDeals.filter(deal => 
    deal.status !== 'Closed Won' && 
    deal.status !== 'Closed Lost'
  );
  
  console.log(`📈 Pipeline deals (open): ${openDeals.length}`);
  console.log(`📊 Total deals (including closed): ${allDeals.length}`);
  
  return openDeals;
};
