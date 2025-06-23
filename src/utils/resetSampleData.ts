
import { useRequestStore } from '@/store/requestStore';
import { useClientStore } from '@/store/clientStore';
import { useQuoteStore } from '@/store/quoteStore';
import { requestsData } from '@/data/requestsData';
import { clientsData } from '@/data/clientsData';
import { quotesData } from '@/data/quotesData';

export const resetToSampleData = () => {
  console.log('Resetting all data to original sample data...');
  
  // Get store actions
  const { sessionRequests, removeSessionRequest, addSessionRequest } = useRequestStore.getState();
  const { sessionClients, removeSessionClient, addSessionClient } = useClientStore.getState();
  const { sessionQuotes, removeSessionQuote, addSessionQuote } = useQuoteStore.getState();
  
  // Clear all existing data
  sessionRequests.forEach(request => removeSessionRequest(request.id));
  sessionClients.forEach(client => removeSessionClient(client.id));
  sessionQuotes.forEach(quote => removeSessionQuote(quote.id));
  
  // Repopulate with original sample data
  clientsData.forEach(client => addSessionClient(client));
  requestsData.forEach(request => addSessionRequest(request));
  quotesData.forEach(quote => addSessionQuote(quote));
  
  console.log('Sample data reset complete');
};
