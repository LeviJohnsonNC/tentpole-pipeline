
import { useRequestStore } from '@/store/requestStore';
import { useClientStore } from '@/store/clientStore';
import { useQuoteStore } from '@/store/quoteStore';

export const resetToSampleData = () => {
  console.log('Resetting all data to original sample data...');
  
  // Get store actions
  const { clearAllRequests, initializeWithStaticData: initRequests } = useRequestStore.getState();
  const { clearAllClients, initializeWithStaticData: initClients } = useClientStore.getState();
  const { clearAllQuotes, initializeWithStaticData: initQuotes } = useQuoteStore.getState();
  
  // Clear all existing data first
  clearAllRequests();
  clearAllClients();
  clearAllQuotes();
  
  // Reinitialize with original sample data
  initClients();
  initRequests();
  initQuotes();
  
  console.log('Sample data reset complete');
};
