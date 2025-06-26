
import { Request } from '@/types/Request';
import { Quote } from '@/types/Quote';
import { Client } from '@/types/Client';

export interface AggregateMetrics {
  wonCount: number;
  wonValue: number;
  lostCount: number;
  lostValue: number;
}

export const calculateAggregateMetrics = (
  requests: Request[],
  quotes: Quote[],
  clients: Client[]
): AggregateMetrics => {
  let wonCount = 0;
  let wonValue = 0;
  let lostCount = 0;
  let lostValue = 0;

  // Count won deals from quotes that are Approved or Converted
  const wonQuotes = quotes.filter(quote => 
    quote.status === 'Approved' || quote.status === 'Converted'
  );
  wonCount += wonQuotes.length;
  wonValue += wonQuotes.reduce((sum, quote) => sum + (quote.amount || 0), 0);

  // Count won deals from requests that are Converted (requests marked as won)
  const wonRequests = requests.filter(request => request.status === 'Converted');
  wonCount += wonRequests.length;
  // Won requests don't add to value unless they have an associated quote (already counted above)

  // Count lost deals from requests with status 'Archived' (requests marked as lost)
  const lostRequests = requests.filter(request => request.status === 'Archived');
  lostCount += lostRequests.length;
  // Lost requests don't have values since they didn't convert to quotes

  // Count lost deals from quotes that are 'Archived' (quotes marked as lost)
  const lostQuotes = quotes.filter(quote => quote.status === 'Archived');
  lostCount += lostQuotes.length;
  lostValue += lostQuotes.reduce((sum, quote) => sum + (quote.amount || 0), 0);

  return {
    wonCount,
    wonValue,
    lostCount,
    lostValue
  };
};

export const formatAmount = (amount: number): string => {
  return `$${amount.toLocaleString()}.00`;
};
