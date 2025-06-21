
import { useState } from "react";
import { Search, Bell, MessageCircle, Settings, ChevronDown, Plus, MoreHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import Sidebar from "@/components/Sidebar";
import OverviewCards from "@/components/OverviewCards";
import RequestsTable from "@/components/RequestsTable";
import SalesPipeline from "@/components/SalesPipeline";

const Index = () => {
  const [activeTab, setActiveTab] = useState("all-requests");

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
          <div className="mb-6">
            <div className="flex items-center justify-between mb-6">
              <h1 className="text-2xl font-semibold text-gray-900">Requests</h1>
              <div className="flex items-center space-x-3">
                <Button className="bg-[#0B6839] hover:bg-[#0B6839]/90 text-white">
                  <Plus className="h-4 w-4 mr-2" />
                  New Request
                </Button>
                <Button variant="ghost" size="sm">
                  <MoreHorizontal className="h-4 w-4" />
                  More Actions
                </Button>
              </div>
            </div>
            
            {activeTab === "all-requests" && <OverviewCards />}
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
                    All requests <span className="text-gray-400">(97 results)</span>
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
                        All <ChevronDown className="h-3 w-3 ml-1" />
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
                <RequestsTable />
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
