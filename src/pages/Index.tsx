import { useState, useMemo, useEffect } from "react";
import { ChevronDown, Plus, MoreHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import CommonHeader from "@/components/CommonHeader";
import Sidebar from "@/components/Sidebar";
import OverviewCards from "@/components/OverviewCards";
import RequestsTable from "@/components/RequestsTable";
import SalesPipeline from "@/components/SalesPipeline";
import { getRequestsWithClientInfo } from "@/utils/dataHelpers";
import { useRequestStore } from "@/store/requestStore";
import { useClientStore } from "@/store/clientStore";
import { useLocation, useNavigate } from "react-router-dom";

const Index = () => {
  const [activeTab, setActiveTab] = useState("all-requests");
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

  // Handle returning from EditStages with tab state
  useEffect(() => {
    if (location.state && location.state.activeTab) {
      setActiveTab(location.state.activeTab);
      // Clear the state so it doesn't persist on refresh
      window.history.replaceState({}, document.title);
    }
  }, [location.state]);

  const handleEditStages = () => {
    navigate('/requests/edit-stages', { 
      state: { fromTab: activeTab }
    });
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
            
            {activeTab === "all-requests" && (
              <OverviewCards 
                onStatusFilter={handleStatusFilter}
                activeStatusFilter={statusFilter}
                requests={allRequests}
              />
            )}
          </div>
          
          {/* Tabs and Content */}
          <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
            <div className="border-b border-gray-200">
              <div className="flex items-center justify-between p-4">
                <div className="flex items-center space-x-6">
                  <button
                    onClick={() => setActiveTab("all-requests")}
                    className={`pb-2 border-b-2 font-medium text-sm ${
                      activeTab === "all-requests"
                        ? "border-[#0B6839] text-[#0B6839]"
                        : "border-transparent text-gray-500 hover:text-gray-700"
                    }`}
                  >
                    All requests <span className="text-gray-400">({totalRequests} results)</span>
                  </button>
                  <button
                    onClick={() => setActiveTab("sales-pipeline")}
                    className={`pb-2 border-b-2 font-medium text-sm ${
                      activeTab === "sales-pipeline"
                        ? "border-[#0B6839] text-[#0B6839]"
                        : "border-transparent text-gray-500 hover:text-gray-700"
                    }`}
                  >
                    Sales Pipeline
                  </button>
                </div>
              </div>
              
              {activeTab === "all-requests" && (
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
              )}
            </div>
            
            {/* Content */}
            <div className="p-4">
              {activeTab === "all-requests" ? (
                <RequestsTable 
                  requests={allRequests} 
                  statusFilter={statusFilter}
                  searchTerm={searchTerm}
                  onSearchChange={setSearchTerm}
                />
              ) : activeTab === "sales-pipeline" ? (
                <SalesPipeline />
              ) : (
                <div className="text-center py-12">
                  <div className="text-gray-500 text-lg">Coming soon</div>
                  <div className="text-gray-400 text-sm mt-2">This functionality will be available here</div>
                </div>
              )}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default Index;
