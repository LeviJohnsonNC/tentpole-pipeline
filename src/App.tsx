
import React from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import Clients from "./pages/Clients";
import NewClient from "./pages/NewClient";
import NewRequest from "./pages/NewRequest";
import RequestDetails from "./pages/RequestDetails";
import EditStages from "./pages/EditStages";
import NotFound from "./pages/NotFound";
import Sales from "./pages/Sales";
import Quotes from "./pages/Quotes";
import NewQuote from "./pages/NewQuote";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <Toaster />
    <Sonner />
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Index />} />
        <Route path="/clients" element={<Clients />} />
        <Route path="/clients/new" element={<NewClient />} />
        <Route path="/requests/new" element={<NewRequest />} />
        <Route path="/requests/:id" element={<RequestDetails />} />
        <Route path="/requests/edit-stages" element={<EditStages />} />
        <Route path="/sales" element={<Sales />} />
        <Route path="/quotes" element={<Quotes />} />
        <Route path="/quotes/new" element={<NewQuote />} />
        {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  </QueryClientProvider>
);

export default App;
