
import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import { useQuoteStore } from './store/quoteStore'
import { useRequestStore } from './store/requestStore'
import { useClientStore } from './store/clientStore'

// Initialize all stores with static data on app startup
const initializeStores = () => {
  const { initializeWithStaticData: initQuotes } = useQuoteStore.getState();
  const { initializeWithStaticData: initRequests } = useRequestStore.getState();
  const { initializeWithStaticData: initClients } = useClientStore.getState();
  
  console.log('Initializing all stores with sample data...');
  initClients();
  initRequests();
  initQuotes();
  console.log('All stores initialized');
};

// Initialize stores before rendering
initializeStores();

createRoot(document.getElementById("root")!).render(<App />);
