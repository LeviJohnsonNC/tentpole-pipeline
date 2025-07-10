
import { useRequestStore } from '@/store/requestStore';
import { useClientStore } from '@/store/clientStore';
import { useQuoteStore } from '@/store/quoteStore';
import { useStagesStore } from '@/store/stagesStore';

export const resetToSampleData = () => {
  console.log('Resetting all data to original sample data...');
  
  // Clear localStorage for manual deal positions
  localStorage.removeItem('manualDealPositions');
  console.log('Cleared localStorage for manual deal positions');
  
  // Get store actions
  const { clearAllRequests, initializeWithStaticData: initRequests } = useRequestStore.getState();
  const { clearAllClients, initializeWithStaticData: initClients } = useClientStore.getState();
  const { clearAllQuotes, initializeWithStaticData: initQuotes } = useQuoteStore.getState();
  const { updateStages } = useStagesStore.getState();
  
  // Clear all existing data first
  clearAllRequests();
  clearAllClients();
  clearAllQuotes();
  
  // Reset stages to default state with time limit properties
  const defaultStages = [
    { 
      id: "new-opportunities", 
      title: "New Opportunities", 
      order: 1, 
      isImmutable: true,
      timeLimitEnabled: true,
      timeLimitDays: 0,
      timeLimitHours: 3
    },
    { 
      id: "contacted", 
      title: "Contacted", 
      order: 2,
      timeLimitEnabled: true,
      timeLimitDays: 3,
      timeLimitHours: 0
    },
    { 
      id: "draft-quote", 
      title: "Draft Quote", 
      order: 3, 
      isJobberStage: true,
      timeLimitEnabled: true,
      timeLimitDays: 1,
      timeLimitHours: 0
    },
    { 
      id: "quote-awaiting-response", 
      title: "Quote Awaiting Response", 
      order: 4, 
      isJobberStage: true,
      timeLimitEnabled: true,
      timeLimitDays: 7,
      timeLimitHours: 0
    },
    { 
      id: "followup", 
      title: "Followup", 
      order: 5,
      timeLimitEnabled: true,
      timeLimitDays: 7,
      timeLimitHours: 0
    }
  ];
  updateStages(defaultStages);
  
  // Reinitialize with original sample data
  initClients();
  initRequests();
  initQuotes();
  
  console.log('Sample data reset complete');
};
