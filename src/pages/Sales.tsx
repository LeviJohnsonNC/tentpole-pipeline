import { ChartColumn, Edit } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import CommonHeader from "@/components/CommonHeader";
import Sidebar from "@/components/Sidebar";
import SalesPipeline from "@/components/SalesPipeline";
import PipelineInsights from "@/components/insights/PipelineInsights";
import DealDetailSidebar from "@/components/dealDetail/DealDetailSidebar";
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import { Deal } from "@/components/pipeline/SalesPipelineData";
import PipelineViewToggle from "@/components/pipeline/PipelineViewToggle";
import PipelineListView from "@/components/pipeline/PipelineListView";
import StageFilter from "@/components/pipeline/StageFilter";
import SearchBar from "@/components/pipeline/SearchBar";

const Sales = () => {
  const navigate = useNavigate();
  const [isInsightsOpen, setIsInsightsOpen] = useState(false);
  const [deals, setDeals] = useState<Deal[]>([]); // Pipeline deals
  const [allDeals, setAllDeals] = useState<Deal[]>([]); // All deals including closed
  const [pipelineView, setPipelineView] = useState<'kanban' | 'list'>('kanban');
  const [selectedStage, setSelectedStage] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState<string>('');
  
  // Add deal sidebar state
  const [isDealSidebarOpen, setIsDealSidebarOpen] = useState(false);
  const [selectedDealId, setSelectedDealId] = useState<string | null>(null);

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

  const handleAllDealsChange = (newAllDeals: Deal[]) => {
    setAllDeals(newAllDeals);
  };

  const handleStageChange = (stage: string) => {
    setSelectedStage(stage);
  };

  const handleSearchChange = (value: string) => {
    setSearchTerm(value);
  };

  const handleDealClick = (dealId: string) => {
    setSelectedDealId(dealId);
    setIsDealSidebarOpen(true);
  };

  const handleCloseDealSidebar = () => {
    setIsDealSidebarOpen(false);
    setSelectedDealId(null);
  };

  const handleAggregateColumnClick = (type: 'won' | 'lost') => {
    // Switch to list view
    setPipelineView('list');
    
    // Set the appropriate stage filter
    if (type === 'won') {
      setSelectedStage('closed-won');
    } else {
      setSelectedStage('closed-lost');
    }
    
    // Clear search to show all results for the selected stage
    setSearchTerm('');
  };

  const handleWonActionClick = () => {
    handleAggregateColumnClick('won');
  };

  const handleLostActionClick = () => {
    handleAggregateColumnClick('lost');
  };

  // Filter deals based on selected stage and search term - use allDeals for list view
  const filteredDeals = (pipelineView === 'list' ? allDeals : deals).filter(deal => {
    const matchesStage = selectedStage === 'all' || 
      deal.status.toLowerCase().replace(/\s+/g, '-') === selectedStage || 
      deal.status.toLowerCase() === selectedStage ||
      (selectedStage === 'closed-won' && deal.status === 'Closed Won') ||
      (selectedStage === 'closed-lost' && deal.status === 'Closed Lost');
    
    const matchesSearch = searchTerm === '' ||
      deal.client.toLowerCase().includes(searchTerm.toLowerCase()) ||
      deal.property.toLowerCase().includes(searchTerm.toLowerCase()) ||
      deal.title.toLowerCase().includes(searchTerm.toLowerCase());
    
    return matchesStage && matchesSearch;
  });

  return (
    <SidebarProvider>
      <div className="min-h-screen bg-gray-50 flex w-full">
        <Sidebar />
        
        <SidebarInset>
          <CommonHeader showResetButton={true} showAutoOnlyButton={true} />
          
          {/* Main Content */}
          <main className="flex-1 p-6">
            <div className="mb-4">
              <div className="flex items-center justify-between mb-3">
                <div className="flex flex-col gap-2">
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
                  <Button 
                    variant="outline" 
                    onClick={handleEditStages}
                    className="flex items-center gap-2"
                  >
                    <Edit className="h-4 w-4" />
                    Edit
                  </Button>
                </div>
              </div>
              
              {/* Conditional content based on view */}
              {pipelineView === 'kanban' ? (
                /* Search Bar only for kanban view */
                <div className="flex items-start justify-end mb-3">
                  <SearchBar 
                    searchTerm={searchTerm}
                    onSearchChange={handleSearchChange}
                  />
                </div>
              ) : (
                /* Stage Filter and Search Bar for list view */
                <div className="flex items-center justify-between mb-3">
                  <StageFilter 
                    selectedStage={selectedStage}
                    onStageChange={handleStageChange}
                    resultsCount={filteredDeals.length}
                  />
                  <SearchBar 
                    searchTerm={searchTerm}
                    onSearchChange={handleSearchChange}
                  />
                </div>
              )}
            </div>
            
            {/* Conditional rendering based on view */}
            {pipelineView === 'kanban' ? (
              <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
                <div className="p-4">
                  <SalesPipeline 
                    onDealsChange={handleDealsChange} 
                    onAllDealsChange={handleAllDealsChange}
                    searchTerm={searchTerm}
                    onDealClick={handleDealClick}
                    onWonClick={handleWonActionClick}
                    onLostClick={handleLostActionClick}
                  />
                </div>
              </div>
            ) : (
              <PipelineListView deals={filteredDeals} />
            )}
          </main>
        </SidebarInset>
      </div>
      
      <PipelineInsights 
        isOpen={isInsightsOpen}
        onClose={handleCloseInsights}
        deals={pipelineView === 'list' ? allDeals : deals}
      />
      
      <DealDetailSidebar
        isOpen={isDealSidebarOpen}
        onClose={handleCloseDealSidebar}
        selectedDealId={selectedDealId}
        deals={pipelineView === 'list' ? allDeals : deals}
      />
    </SidebarProvider>
  );
};

export default Sales;
