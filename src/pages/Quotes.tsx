
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
import { Search, Plus, Filter, MoreHorizontal, Calendar, MessageCircle, Bell, Settings } from "lucide-react";
import { Link } from "react-router-dom";
import { Badge } from "@/components/ui/badge";

const Quotes = () => {
  const { sessionClients } = useClientStore();
  const { sessionRequests } = useRequestStore();
  const { sessionQuotes } = useQuoteStore();
  const [statusFilter, setStatusFilter] = useState<string | null>(null);
  
  const quotesWithClients = getQuotesWithClientInfo(sessionClients, sessionQuotes);
  const allQuotes = getAllQuotes(sessionQuotes);

  // Filter quotes for display count
  const filteredQuotesCount = statusFilter 
    ? allQuotes.filter(quote => quote.status === statusFilter).length
    : allQuotes.length;

  const getFilterDisplayText = () => {
    if (statusFilter) {
      return `${statusFilter} quotes (${filteredQuotesCount} results)`;
    }
    return `All quotes (${allQuotes.length} results)`;
  };

  return (
    <div className="min-h-screen bg-gray-50 flex w-full">
      <Sidebar />
      
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <header className="bg-white border-b border-gray-200 px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="text-sm font-medium text-gray-600">GROW QA 1</div>
            </div>
            
            <div className="flex-1 max-w-md mx-8">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input 
                  placeholder="Search" 
                  className="pl-10 bg-gray-50 border-gray-200 focus:bg-white"
                />
                <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-xs text-gray-400">
                  /
                </div>
              </div>
            </div>
            
            <div className="flex items-center space-x-3">
              <Button variant="ghost" size="sm" className="p-2">
                <MessageCircle className="h-4 w-4 text-gray-600" />
              </Button>
              <Button variant="ghost" size="sm" className="p-2 relative">
                <Bell className="h-4 w-4 text-gray-600" />
                <Badge className="absolute -top-1 -right-1 h-5 w-5 text-xs bg-red-500 text-white rounded-full flex items-center justify-center p-0">
                  20
                </Badge>
              </Button>
              <Button variant="ghost" size="sm" className="p-2">
                <Settings className="h-4 w-4 text-gray-600" />
              </Button>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="flex-1 p-6">
          {/* Page Title and Actions */}
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-3xl font-bold text-gray-900">Quotes</h1>
            <div className="flex items-center space-x-3">
              <Button asChild className="bg-green-600 hover:bg-green-700">
                <Link to="/quotes/new">
                  New Quote
                </Link>
              </Button>
              <Button variant="outline">
                Templates
              </Button>
            </div>
          </div>

          {/* Overview Cards */}
          <QuotesOverviewCards 
            quotes={allQuotes} 
            onStatusFilter={setStatusFilter}
            activeFilter={statusFilter}
          />

          {/* All quotes section */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-gray-900">
                {getFilterDisplayText()}
                {statusFilter && (
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="ml-2 text-blue-600"
                    onClick={() => setStatusFilter(null)}
                  >
                    Clear filter
                  </Button>
                )}
              </h2>
            </div>
            
            {/* Filter and Search Controls */}
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-3">
                <div className="flex items-center space-x-2">
                  <span className="text-sm text-gray-700">Status</span>
                  <Button variant="outline" size="sm" className="bg-gray-100">
                    {statusFilter || 'All'}
                  </Button>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Calendar className="h-4 w-4 text-gray-500" />
                  <Button variant="outline" size="sm" className="bg-gray-100">
                    All
                  </Button>
                </div>
                
                <div className="flex items-center space-x-2">
                  <span className="text-sm text-gray-700">Salesperson</span>
                  <Button variant="outline" size="sm" className="bg-gray-100">
                    All
                  </Button>
                </div>
              </div>
              
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Search quotes..."
                  className="pl-10 w-64"
                />
              </div>
            </div>
          </div>
          
          <QuotesTable quotes={quotesWithClients} statusFilter={statusFilter} />
        </main>
      </div>
    </div>
  );
};

export default Quotes;
