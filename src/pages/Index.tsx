
import { useState, useMemo, useEffect } from "react";
import { ChevronDown, Plus, MoreHorizontal, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import CommonHeader from "@/components/CommonHeader";
import Sidebar from "@/components/Sidebar";
import OverviewCards from "@/components/OverviewCards";
import RequestsTable from "@/components/RequestsTable";
import { getRequestsWithClientInfo } from "@/utils/dataHelpers";
import { useRequestStore } from "@/store/requestStore";
import { useClientStore } from "@/store/clientStore";
import { useLocation, useNavigate } from "react-router-dom";

const Index = () => {
  const [statusFilter, setStatusFilter] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const { sessionRequests } = useRequestStore();
  const { sessionClients } = useClientStore();
  const location = useLocation();
  const navigate = useNavigate();
  
  const allRequests = useMemo(() => {
    return getRequestsWithClientInfo(sessionClients, sessionRequests);
  }, [sessionRequests, sessionClients]);

  const totalRequests = allRequests.length;

  const handleStatusFilter = (status: string | null) => {
    setStatusFilter(status);
  };

  const handleEditStages = () => {
    navigate('/requests/edit-stages');
  };

  const handleNewRequest = () => {
    navigate('/requests/new');
  };

  return (
    <div className="min-h-screen bg-gray-50 flex w-full">
      <Sidebar />
      
      <div className="flex-1 flex flex-col">
        <CommonHeader showResetButton={true} />
        
        {/* Main Content */}
        <main className="flex-1 p-6">
          <div className="mb-6">
            <div className="flex items-center justify-between mb-6">
              <h1 className="text-2xl font-semibold text-gray-900">Requests</h1>
              <div className="flex items-center space-x-3">
                <Button 
                  className="bg-[#0B6839] hover:bg-[#0B6839]/90 text-white"
                  onClick={handleNewRequest}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  New Request
                </Button>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm">
                      <MoreHorizontal className="h-4 w-4" />
                      More Actions
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={handleEditStages}>
                      Edit Stages
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
            
            <OverviewCards 
              onStatusFilter={handleStatusFilter}
              activeStatusFilter={statusFilter}
              requests={allRequests}
            />
          </div>
          
          {/* Content */}
          <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
            <div className="border-b border-gray-200">
              <div className="flex items-center justify-between p-4">
                <div className="flex items-center space-x-6">
                  <div className="pb-2 border-b-2 border-[#0B6839] text-[#0B6839] font-medium text-sm">
                    All requests <span className="text-gray-400">({totalRequests} results)</span>
                  </div>
                </div>
              </div>
              
              <div className="px-4 pb-4">
                <div className="flex items-center space-x-3">
                  <div className="flex items-center space-x-2">
                    <span className="text-sm text-gray-600">Status</span>
                    <Button variant="outline" size="sm" className="h-8">
                      {statusFilter || 'All'} <ChevronDown className="h-3 w-3 ml-1" />
                    </Button>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Button variant="outline" size="sm" className="h-8">
                      All <ChevronDown className="h-3 w-3 ml-1" />
                    </Button>
                  </div>
                  <div className="flex-1 max-w-xs">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-3 w-3" />
                      <Input 
                        placeholder="Search requests..." 
                        className="pl-9 h-8 text-sm"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="p-4">
              <RequestsTable 
                requests={allRequests} 
                statusFilter={statusFilter}
                searchTerm={searchTerm}
                onSearchChange={setSearchTerm}
              />
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default Index;
