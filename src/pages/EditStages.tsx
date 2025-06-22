
import { Search, Bell, MessageCircle, Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import Sidebar from "@/components/Sidebar";

const EditStages = () => {
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
            <h1 className="text-2xl font-semibold text-gray-900">Edit Stages</h1>
          </div>
          
          {/* Blank content area for future instructions */}
          <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6">
            <div className="text-center py-12">
              <div className="text-gray-500 text-lg">Edit Stages Content</div>
              <div className="text-gray-400 text-sm mt-2">Content will be added here based on your instructions</div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default EditStages;
