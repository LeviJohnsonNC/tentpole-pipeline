
import { useEffect, useState } from "react";
import Sidebar from "@/components/Sidebar";
import QuotesOverviewCards from "@/components/QuotesOverviewCards";
import QuotesTable from "@/components/QuotesTable";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useClientStore } from "@/store/clientStore";
import { useRequestStore } from "@/store/requestStore";
import { useQuoteStore } from "@/store/quoteStore";
import { getQuotesWithClientInfo, getAllQuotes } from "@/utils/dataHelpers";
import { Search, Plus, Filter, MoreHorizontal } from "lucide-react";
import { Link } from "react-router-dom";

const Quotes = () => {
  const { sessionClients } = useClientStore();
  const { sessionRequests } = useRequestStore();
  const { sessionQuotes } = useQuoteStore();
  
  const quotesWithClients = getQuotesWithClientInfo(sessionClients, sessionQuotes);
  const allQuotes = getAllQuotes(sessionQuotes);

  return (
    <div className="min-h-screen flex w-full">
      <Sidebar />
      
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <header className="bg-white border-b border-gray-200 px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-semibold text-gray-900">Quotes</h1>
              <p className="text-sm text-gray-600 mt-1">
                Manage and track your quotes
              </p>
            </div>
            
            <div className="flex items-center space-x-3">
              <Button variant="outline" size="sm">
                <MoreHorizontal className="h-4 w-4" />
                More Actions
              </Button>
              
              <Button asChild className="bg-green-600 hover:bg-green-700">
                <Link to="/quotes/new">
                  <Plus className="h-4 w-4 mr-2" />
                  New Quote
                </Link>
              </Button>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="flex-1 p-6">
          <QuotesOverviewCards quotes={allQuotes} />
          
          {/* Search and Filter Controls moved to main content area */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Search quotes..."
                  className="pl-10 w-64"
                />
              </div>
              
              <Button variant="outline" size="sm">
                <Filter className="h-4 w-4 mr-2" />
                Filter
              </Button>
            </div>
            
            <Button asChild className="bg-green-600 hover:bg-green-700">
              <Link to="/quotes/new">
                <Plus className="h-4 w-4 mr-2" />
                New Quote
              </Link>
            </Button>
          </div>
          
          <QuotesTable quotes={quotesWithClients} />
        </main>
      </div>
    </div>
  );
};

export default Quotes;
