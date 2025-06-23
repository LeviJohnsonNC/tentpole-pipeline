
import { useState, useMemo } from "react";
import { ChevronDown, Plus, MoreHorizontal, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useNavigate } from "react-router-dom";
import CommonHeader from "@/components/CommonHeader";
import Sidebar from "@/components/Sidebar";
import ClientsOverviewCards from "@/components/ClientsOverviewCards";
import ClientsTable from "@/components/ClientsTable";
import { getAllClients } from "@/utils/dataHelpers";
import { useClientStore } from "@/store/clientStore";

const Clients = () => {
  const navigate = useNavigate();
  const { sessionClients } = useClientStore();
  const [searchTerm, setSearchTerm] = useState("");
  
  const totalClients = useMemo(() => {
    return getAllClients(sessionClients).length;
  }, [sessionClients]);

  return (
    <div className="min-h-screen bg-gray-50 flex w-full">
      <Sidebar />
      
      <div className="flex-1 flex flex-col">
        <CommonHeader />
        
        {/* Main Content */}
        <main className="flex-1 p-6">
          <div className="mb-6">
            <div className="flex items-center justify-between mb-6">
              <h1 className="text-2xl font-semibold text-gray-900">Clients</h1>
              <div className="flex items-center space-x-3">
                <Button 
                  className="bg-[#0B6839] hover:bg-[#0B6839]/90 text-white"
                  onClick={() => navigate('/clients/new')}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  New Client
                </Button>
                <Button variant="ghost" size="sm">
                  <MoreHorizontal className="h-4 w-4" />
                  More Actions
                </Button>
              </div>
            </div>
            
            <ClientsOverviewCards />
          </div>
          
          {/* Filtered Clients Section */}
          <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-medium text-gray-900">
                  Filtered clients <span className="text-gray-500 font-normal">({totalClients} results)</span>
                </h2>
              </div>
              
              {/* Filters */}
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center space-x-3">
                  <div className="flex items-center space-x-2">
                    <span className="text-sm text-gray-600">Tags</span>
                    <Button variant="outline" size="sm" className="h-8">
                      <Plus className="h-3 w-3" />
                    </Button>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="text-sm text-gray-600">Status</span>
                    <Badge variant="outline" className="bg-gray-100 text-gray-700 border-gray-300">
                      Leads and Active
                    </Badge>
                  </div>
                </div>
                
                <div className="flex-1 max-w-xs ml-4">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                    <Input 
                      placeholder="Search filtered client..." 
                      className="pl-10 h-9 text-sm"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </div>
                </div>
              </div>
              
              <ClientsTable searchTerm={searchTerm} onSearchChange={setSearchTerm} />
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default Clients;
