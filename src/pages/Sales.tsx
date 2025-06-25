
import { MoreHorizontal, ChartColumn } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import CommonHeader from "@/components/CommonHeader";
import Sidebar from "@/components/Sidebar";
import SalesPipeline from "@/components/SalesPipeline";
import PipelineInsights from "@/components/insights/PipelineInsights";
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import { Deal } from "@/components/pipeline/SalesPipelineData";
import PipelineViewToggle from "@/components/pipeline/PipelineViewToggle";
import PipelineListView from "@/components/pipeline/PipelineListView";

const Sales = () => {
  const navigate = useNavigate();
  const [isInsightsOpen, setIsInsightsOpen] = useState(false);
  const [deals, setDeals] = useState<Deal[]>([]);
  const [pipelineView, setPipelineView] = useState<'kanban' | 'list'>('kanban');

  const handleEditStages = () => {
    navigate('/requests/edit-stages');
  };

  const handleOpenInsights = () => {
    setIsInsightsOpen(true);
  };

  const handleCloseInsights = () => {
    setIsInsightsOpen(false);
  };

  const handleDealsChange = (newDeals: Deal[]) => {
    setDeals(newDeals);
  };

  return (
    <SidebarProvider>
      <div className="min-h-screen bg-gray-50 flex w-full">
        <Sidebar />
        
        <SidebarInset>
          <CommonHeader showResetButton={true} />
          
          {/* Main Content */}
          <main className="flex-1 p-6">
            <div className="mb-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex flex-col gap-3">
                  <h1 className="text-2xl font-semibold text-gray-900">
                    {pipelineView === 'kanban' ? 'Sales Pipeline' : 'Sales List'}
                  </h1>
                  <PipelineViewToggle 
                    view={pipelineView}
                    onViewChange={setPipelineView}
                  />
                </div>
                <div className="flex items-center space-x-3">
                  <Button 
                    variant="outline" 
                    onClick={handleOpenInsights}
                    className="flex items-center gap-2"
                  >
                    <ChartColumn className="h-4 w-4" />
                    Insights
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
            </div>
            
            {/* Conditional rendering based on view */}
            {pipelineView === 'kanban' ? (
              <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
                <div className="p-4">
                  <SalesPipeline onDealsChange={handleDealsChange} />
                </div>
              </div>
            ) : (
              <PipelineListView deals={deals} />
            )}
          </main>
        </SidebarInset>
      </div>
      
      <PipelineInsights 
        isOpen={isInsightsOpen}
        onClose={handleCloseInsights}
        deals={deals}
      />
    </SidebarProvider>
  );
};

export default Sales;
