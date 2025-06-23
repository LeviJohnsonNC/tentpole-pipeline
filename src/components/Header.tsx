
import { Search, Bell, MessageCircle, Settings, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { resetToSampleData } from "@/utils/resetSampleData";
import { toast } from "sonner";

const Header = () => {
  const handleResetSampleData = () => {
    resetToSampleData();
    toast.success("Sample data has been reset to original state");
  };

  return (
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
          <Button 
            variant="outline" 
            size="sm" 
            onClick={handleResetSampleData}
            className="flex items-center gap-2"
          >
            <RotateCcw className="h-4 w-4" />
            Reset Sample Data
          </Button>
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
  );
};

export default Header;
