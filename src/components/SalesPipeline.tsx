import React, { useState, useMemo, useEffect, useRef } from "react";
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors, DragEndEvent, DragOverEvent, DragStartEvent, DragOverlay } from '@dnd-kit/core';
import { arrayMove, sortableKeyboardCoordinates } from '@dnd-kit/sortable';
import { Calendar, MessageSquare } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { toast } from "sonner";
import PipelineColumn from './pipeline/PipelineColumn';
import DealCard from './pipeline/DealCard';
import ActionBar from './pipeline/ActionBar';
import FeedbackModal from './FeedbackModal';
import { useClientStore } from "@/store/clientStore";
import { useRequestStore } from "@/store/requestStore";
import { useQuoteStore } from "@/store/quoteStore";
import { useStagesStore } from "@/store/stagesStore";
import { useResponsiveColumns } from "@/hooks/useResponsiveColumns";
import { createInitialDeals, createAllDeals, Deal, canDropInJobberStage, canDragFromJobberStage } from './pipeline/SalesPipelineData';
import { Request } from "@/types/Request";

interface SalesPipelineProps {
  onDealsChange?: (deals: Deal[]) => void;
  onAllDealsChange?: (allDeals: Deal[]) => void;
  searchTerm?: string;
  onDealClick?: (dealId: string) => void;
}

// Helper function to check if a stage ID is a Jobber stage
const isJobberStageId = (stageId: string): boolean => {
  const JOBBER_STAGE_IDS = [
    'draft-quote',
    'quote-awaiting-response', 
    'jobber-unscheduled-assessment',
    'jobber-overdue-assessment',
    'jobber-assessment-completed',
    'jobber-quote-changes-requested'
  ];
  return JOBBER_STAGE_IDS.includes(stageId);
};

const SalesPipeline = ({
  onDealsChange,
  onAllDealsChange,
  searchTerm = '',
  onDealClick
}: SalesPipelineProps) => {
  const {
    sessionClients,
    updateSessionClient
  } = useClientStore();
  const {
    sessionRequests,
    updateSessionRequest,
    addSessionRequest
  } = useRequestStore();
  const {
    sessionQuotes,
    updateSessionQuote
  } = useQuoteStore();
  const {
    stages
  } = useStagesStore();

  // State management
  const [isInitialized, setIsInitialized] = useState(false);
  const [deals, setDeals] = useState<Deal[]>([]); // Pipeline deals
  const [allDeals, setAllDeals] = useState<Deal[]>([]); // All deals including closed
  const [activeId, setActiveId] = useState<string | null>(null);
  const [isFeedbackModalOpen, setIsFeedbackModalOpen] = useState(false);
  const [isDraggingToActionZone, setIsDraggingToActionZone] = useState(false);

  // FIXED: Component-level migration tracking instead of ref
  const [migrationCompleted, setMigrationCompleted] = useState(false);

  // Responsive columns setup
  const containerRef = useRef<HTMLDivElement>(null);
  const {
    columnWidth,
    shouldUseHorizontalScroll
  } = useResponsiveColumns({
    containerRef,
    columnCount: stages.length,
    minColumnWidth: 200,
    maxColumnWidth: 320,
    columnGap: 16,
    padding: 32
  });

  // FIXED: Initialize deals only once when component mounts
  useEffect(() => {
    if (!isInitialized && sessionClients.length > 0 && stages.length > 0) {
      console.log('🚀 PIPELINE INIT: Initializing deals for the first time');
      console.log('🚀 PIPELINE INIT: Session data:', {
        clients: sessionClients.length,
        requests: sessionRequests.length,
        quotes: sessionQuotes.length,
        stages: stages.length
      });
      
      // Run migration only if not completed
      const migrationFunction = migrationCompleted ? undefined : addSessionRequest;
      const initialDeals = createInitialDeals(sessionClients, sessionRequests, sessionQuotes, stages, migrationFunction);
      const initialAllDeals = createAllDeals(sessionClients, sessionRequests, sessionQuotes, stages, migrationFunction);
      
      // Mark migration as completed
      if (!migrationCompleted) {
        setMigrationCompleted(true);
      }
      
      console.log('🚀 PIPELINE INIT: Created', initialDeals.length, 'pipeline deals and', initialAllDeals.length, 'all deals');
      setDeals(initialDeals);
      setAllDeals(initialAllDeals);
      setIsInitialized(true);
      
      if (onDealsChange) {
        onDealsChange(initialDeals);
      }
      if (onAllDealsChange) {
        onAllDealsChange(initialAllDeals);
      }
    }
  }, [sessionClients.length, sessionRequests.length, sessionQuotes.length, stages.length, isInitialized, migrationCompleted]);

  // Reset migration state when data is reset
  useEffect(() => {
    // Check if data has been reset to initial state
    if (sessionClients.length > 0 && sessionRequests.length > 0 && sessionQuotes.length > 0 && 
        !migrationCompleted && isInitialized) {
      console.log('📡 PIPELINE: Detected data reset, resetting migration state');
      setMigrationCompleted(false);
      setIsInitialized(false);
    }
  }, [sessionClients.length, sessionRequests.length, sessionQuotes.length, migrationCompleted, isInitialized]);

  // IMPROVED: Better detection of data changes
  useEffect(() => {
    if (!isInitialized) return;
    
    console.log('📡 PIPELINE UPDATE CHECK: Checking for data changes');
    
    // Don't run migration again, just update deals based on existing data
    const newDeals = createInitialDeals(sessionClients, sessionRequests, sessionQuotes, stages); // No migration function
    const newAllDeals = createAllDeals(sessionClients, sessionRequests, sessionQuotes, stages); // No migration function
    
    // Preserve manual positions for existing deals but update amounts and stage dates for changed deals
    const updatedDeals = newDeals.map(newDeal => {
      const existingDeal = deals.find(d => d.id === newDeal.id);
      if (existingDeal) {
        // Check if the deal should be in a different stage due to data changes
        if (isJobberStageId(newDeal.status) && existingDeal.status !== newDeal.status) {
          // Automatic stage change - reset stage entered date and update amount
          console.log(`🔄 PIPELINE: Auto-moving deal ${newDeal.id} from ${existingDeal.status} to ${newDeal.status}`);
          return {
            ...newDeal,
            stageEnteredDate: new Date().toISOString()
          };
        } else if (!isJobberStageId(existingDeal.status)) {
          // Keep manual position for custom columns but update amount if changed
          return {
            ...newDeal,
            status: existingDeal.status,
            stageEnteredDate: existingDeal.stageEnteredDate,
            amount: newDeal.amount !== existingDeal.amount ? newDeal.amount : existingDeal.amount
          };
        }
      }
      return newDeal;
    });
    
    setDeals(updatedDeals);
    setAllDeals(newAllDeals);
    
    if (onDealsChange) {
      onDealsChange(updatedDeals);
    }
    if (onAllDealsChange) {
      onAllDealsChange(newAllDeals);
    }
  }, [sessionClients, sessionRequests, sessionQuotes, stages, isInitialized]);

  // Filter deals based on search term
  const filteredDeals = useMemo(() => {
    if (!searchTerm) return deals;
    return deals.filter(deal => {
      const matchesClient = deal.client.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesProperty = deal.property.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesTitle = deal.title.toLowerCase().includes(searchTerm.toLowerCase());
      return matchesClient || matchesProperty || matchesTitle;
    });
  }, [deals, searchTerm]);
  
  const sensors = useSensors(useSensor(PointerSensor, {
    activationConstraint: {
      distance: 8
    }
  }), useSensor(KeyboardSensor, {
    coordinateGetter: sortableKeyboardCoordinates
  }));
  
  const formatAmount = (amount: number) => {
    return `$${amount.toLocaleString()}`;
  };

  const getColumnDeals = (columnId: string) => {
    return filteredDeals.filter(deal => deal.status === columnId);
  };
  
  const getColumnTotalValue = (columnId: string) => {
    const columnDeals = getColumnDeals(columnId);
    const total = columnDeals.reduce((sum, deal) => {
      return sum + (deal.amount || 0);
    }, 0);
    return formatAmount(total);
  };
  
  const findContainer = (id: string) => {
    console.log('🔍 FIND CONTAINER: Looking for container of:', id);

    // Check if id is an action zone
    if (id.startsWith('action-')) {
      console.log('🔍 FIND CONTAINER: Found action zone:', id);
      return id;
    }

    // Check if id is a column id
    if (stages.some(stage => stage.id === id)) {
      console.log('🔍 FIND CONTAINER: Found stage column:', id);
      return id;
    }

    // Check if it's a deal id
    const deal = deals.find(deal => deal.id === id);
    const container = deal?.status || null;
    console.log('🔍 FIND CONTAINER: Deal', id, 'found in container:', container);
    return container;
  };

  // Calculate fixed height based on deals array
  const fixedColumnHeight = useMemo(() => {
    const getOriginalColumnDeals = (columnId: string) => {
      return deals.filter(deal => deal.status === columnId);
    };
    const maxDeals = Math.max(...stages.map(stage => getOriginalColumnDeals(stage.id).length), 1);
    const headerHeight = 80;
    const cardHeight = 65;
    const cardSpacing = 8;
    const bufferSpace = 85;
    const totalSpacing = maxDeals > 1 ? (maxDeals - 1) * cardSpacing : 0;
    return headerHeight + maxDeals * cardHeight + totalSpacing + bufferSpace;
  }, [deals, stages]);

  // SIMPLIFIED: Validation function
  const validateDragOperation = (dealId: string, sourceStageId: string, targetStageId: string): {
    allowed: boolean;
    message?: string;
  } => {
    console.log('🔍 DRAG VALIDATION: Checking drag from:', sourceStageId, 'to:', targetStageId);
    
    // Check if dragging FROM a Jobber stage is allowed
    const fromValidation = canDragFromJobberStage(dealId, sourceStageId);
    if (!fromValidation.allowed) {
      console.log('🔍 DRAG VALIDATION: FROM validation failed:', fromValidation.message);
      return fromValidation;
    }
    
    // Check if dragging TO a Jobber stage is allowed
    const toValidation = canDropInJobberStage(dealId, targetStageId);
    if (!toValidation.allowed) {
      console.log('🔍 DRAG VALIDATION: TO validation failed:', toValidation.message);
      return toValidation;
    }
    
    console.log('🔍 DRAG VALIDATION: All validations passed');
    return { allowed: true };
  };

  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event;
    console.log('🚀 DRAG START: Active ID:', active.id);
    
    setActiveId(active.id as string);
    setIsDraggingToActionZone(false);
  };
  
  const handleDragOver = (event: DragOverEvent) => {
    const { active, over } = event;
    if (!over || !active) return;
    
    const activeId = active.id as string;
    const overId = over.id as string;
    
    console.log('🔄 DRAG OVER: Active:', activeId, 'Over:', overId);
    
    if (activeId === overId) return;
    
    const activeContainer = findContainer(activeId);
    const overContainer = findContainer(overId);
    
    console.log('🔄 DRAG OVER: Active container:', activeContainer, 'Over container:', overContainer);
    
    if (!activeContainer || !overContainer) return;

    // Check if dragging towards action zone
    if (overContainer.startsWith('action-')) {
      console.log('🔄 DRAG OVER: Detected drag towards action zone');
      setIsDraggingToActionZone(true);
      return;
    } else {
      setIsDraggingToActionZone(false);
    }

    // REMOVED: Visual state updates during drag over to eliminate race conditions
    // Only validation check remains for visual feedback
    const validation = validateDragOperation(activeId, activeContainer, overContainer);
    if (!validation.allowed) {
      console.log('🔄 DRAG OVER: Validation failed:', validation.message);
      return;
    }
  };
  
  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    console.log('🏁 DRAG END: Active:', active.id, 'Over:', over?.id);
    
    // Clean up drag state
    setActiveId(null);
    setIsDraggingToActionZone(false);
    
    if (!over || !active) {
      console.log('🏁 DRAG END: No over target');
      return;
    }
    
    const activeId = active.id as string;
    const overId = over.id as string;
    
    if (activeId === overId) {
      console.log('🏁 DRAG END: Dropped on self');
      return;
    }
    
    const overContainer = findContainer(overId);
    console.log('🏁 DRAG END: Over container:', overContainer);
    
    if (!overContainer) {
      console.log('🏁 DRAG END: No valid container found');
      return;
    }

    // Handle action zone drops with immediate state updates
    if (overContainer.startsWith('action-')) {
      console.log('🏁 DRAG END: Handling action zone drop:', overContainer);
      
      const deal = deals.find(d => d.id === activeId) || allDeals.find(d => d.id === activeId);
      if (!deal) return;
      
      switch (overContainer) {
        case 'action-archive':
          // Update source data
          if (deal.type === 'request') {
            updateSessionRequest(activeId, { status: 'Archived' });
          } else if (deal.type === 'quote' && deal.quoteId) {
            updateSessionQuote(deal.quoteId, { status: 'Archived' });
          }
          
          // Remove from both collections immediately
          const archivedDeals = deals.filter(d => d.id !== activeId);
          const archivedAllDeals = allDeals.filter(d => d.id !== activeId);
          
          setDeals(archivedDeals);
          setAllDeals(archivedAllDeals);
          
          toast.success(`Deal archived: ${deal.client}`);
          
          if (onDealsChange) onDealsChange(archivedDeals);
          if (onAllDealsChange) onAllDealsChange(archivedAllDeals);
          break;
          
        case 'action-lost':
          // Update source data
          if (deal.type === 'request') {
            updateSessionRequest(activeId, { status: 'Closed Lost' });
          } else if (deal.type === 'quote' && deal.quoteId) {
            updateSessionQuote(deal.quoteId, { status: 'Closed Lost' });
          }
          
          // Remove from pipeline, update in all deals
          const lostDeals = deals.filter(d => d.id !== activeId);
          const lostAllDeals = allDeals.map(d => 
            d.id === activeId ? { ...d, status: 'Closed Lost', stageEnteredDate: new Date().toISOString() } : d
          );
          
          setDeals(lostDeals);
          setAllDeals(lostAllDeals);
          
          toast.error(`Deal marked as lost: ${deal.client}`);
          
          if (onDealsChange) onDealsChange(lostDeals);
          if (onAllDealsChange) onAllDealsChange(lostAllDeals);
          break;
          
        case 'action-won':
          // Update source data
          if (deal.type === 'request') {
            updateSessionRequest(activeId, { status: 'Closed Won' });
          } else if (deal.type === 'quote' && deal.quoteId) {
            updateSessionQuote(deal.quoteId, { status: 'Closed Won' });
          }
          
          // Update client status to Active if they're currently a Lead
          const client = sessionClients.find(c => c.name === deal.client);
          if (client && client.status === 'Lead') {
            console.log('Updating client status from Lead to Active:', client.id);
            updateSessionClient(client.id, { status: 'Active' });
          }
          
          // Remove from pipeline, update in all deals
          const wonDeals = deals.filter(d => d.id !== activeId);
          const wonAllDeals = allDeals.map(d => 
            d.id === activeId ? { ...d, status: 'Closed Won', stageEnteredDate: new Date().toISOString() } : d
          );
          
          setDeals(wonDeals);
          setAllDeals(wonAllDeals);
          
          toast.success(`Deal won: ${deal.client}!`);
          
          if (onDealsChange) onDealsChange(wonDeals);
          if (onAllDealsChange) onAllDealsChange(wonAllDeals);
          break;
      }
      return;
    }

    const activeContainer = findContainer(activeId);
    if (!activeContainer) {
      console.log('🏁 DRAG END: No active container found');
      return;
    }

    // Final validation
    const validation = validateDragOperation(activeId, activeContainer, overContainer);
    if (!validation.allowed) {
      console.log('🏁 DRAG END: Final validation failed:', validation.message);
      toast.error(validation.message);
      return;
    }

    // SIMPLIFIED: Handle drag operations
    if (activeContainer === overContainer) {
      // Reordering within the same container
      console.log('🏁 DRAG END: Reordering within same container');
      setDeals(prevDeals => {
        const containerDeals = prevDeals.filter(deal => deal.status === activeContainer);
        const otherDeals = prevDeals.filter(deal => deal.status !== activeContainer);
        const activeIndex = containerDeals.findIndex(deal => deal.id === activeId);
        const overIndex = containerDeals.findIndex(deal => deal.id === overId);

        if (activeIndex === -1 || overIndex === -1) return prevDeals;

        const reorderedDeals = arrayMove(containerDeals, activeIndex, overIndex);
        const updatedDeals = [...otherDeals, ...reorderedDeals];
        
        if (onDealsChange) {
          onDealsChange(updatedDeals);
        }
        
        return updatedDeals;
      });
    } else {
      // Moving between containers
      console.log('🏁 DRAG END: Moving between containers');

      const updatedDeals = deals.map(deal => {
        if (deal.id === activeId) {
          console.log('🏁 DRAG END: Moving deal', deal.id, 'to', overContainer);
          return {
            ...deal,
            status: overContainer,
            stageEnteredDate: new Date().toISOString()
          };
        }
        return deal;
      });

      setDeals(updatedDeals);
      
      if (onDealsChange) {
        onDealsChange(updatedDeals);
      }
      
      console.log('🏁 DRAG END: Cross-container move completed');
    }
  };
  
  const activeItem = activeId ? deals.find(deal => deal.id === activeId) : null;
  
  return (
    <div className="h-full relative">
      {/* Pipeline Header */}
      <div className="flex justify-end mb-4">
        
      </div>

      {/* Pipeline Columns with Dynamic Grid Layout */}
      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragStart={handleDragStart} onDragOver={handleDragOver} onDragEnd={handleDragEnd}>
        <div ref={containerRef} className="w-full">
          {shouldUseHorizontalScroll ? (
            <ScrollArea className="w-full">
              <div className="flex space-x-4 pb-4 min-w-max">
                {stages.sort((a, b) => a.order - b.order).map(stage => {
                  const columnDeals = getColumnDeals(stage.id);
                  return (
                    <div key={stage.id} style={{ width: `${columnWidth}px` }} className="flex-shrink-0">
                      <PipelineColumn 
                        id={stage.id} 
                        title={stage.title} 
                        deals={columnDeals} 
                        count={columnDeals.length} 
                        totalValue={getColumnTotalValue(stage.id)} 
                        fixedHeight={fixedColumnHeight}
                        stage={stage}
                        onDealClick={onDealClick}
                      />
                    </div>
                  );
                })}
              </div>
              <ScrollBar orientation="horizontal" />
            </ScrollArea>
          ) : (
            <div className="grid gap-4 pb-4 transition-all duration-300 ease-out" style={{
              gridTemplateColumns: `repeat(${stages.length}, ${columnWidth}px)`,
              justifyContent: 'center'
            }}>
              {stages.sort((a, b) => a.order - b.order).map(stage => {
                const columnDeals = getColumnDeals(stage.id);
                return (
                  <PipelineColumn 
                    key={stage.id} 
                    id={stage.id} 
                    title={stage.title} 
                    deals={columnDeals} 
                    count={columnDeals.length} 
                    totalValue={getColumnTotalValue(stage.id)} 
                    fixedHeight={fixedColumnHeight}
                    stage={stage}
                    onDealClick={onDealClick}
                  />
                );
              })}
            </div>
          )}
        </div>

        <DragOverlay>
          {activeItem ? <DealCard deal={activeItem} isDragging /> : null}
        </DragOverlay>

        {/* Action Bar - shows when dragging */}
        <ActionBar isVisible={!!activeId} />
      </DndContext>

      {/* Feedback Modal */}
      <FeedbackModal isOpen={isFeedbackModalOpen} onClose={() => setIsFeedbackModalOpen(false)} />
    </div>
  );
};

export default SalesPipeline;
