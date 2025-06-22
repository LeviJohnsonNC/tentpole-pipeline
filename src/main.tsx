
import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import { useQuoteStore } from './store/quoteStore'

// Initialize the quote store with static data on app startup
const initializeStores = () => {
  const { initializeWithStaticData } = useQuoteStore.getState();
  initializeWithStaticData();
};

// Initialize stores before rendering
initializeStores();

createRoot(document.getElementById("root")!).render(<App />);
