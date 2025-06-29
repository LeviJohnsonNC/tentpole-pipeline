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
import { createInitialDeals, Deal, handleDeleteAction, handleLostAction, handleWonAction, canDropInJobberStage, canDragFromJobberStage } from './pipeline/SalesPipelineData';
import { Request } from "@/types/Request";

interface SalesPipelineProps {
  onDealsChange?: (deals: Deal[]) => void;
  searchTerm?: string;
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
  searchTerm = ''
}: SalesPipelineProps) => {
  const {
    sessionClients,
    updateSessionClient
  } = useClientStore();
  const {
    sessionRequests,
    updateSessionRequest
  } = useRequestStore();
  const {
    sessionQuotes,
    updateSessionQuote
  } = useQuoteStore();
  const {
    stages
  } = useStagesStore();

  // Create initial deals and track initialization
  const [isInitialized, setIsInitialized] = useState(false);
  const [deals, setDeals] = useState<Deal[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isFeedbackModalOpen, setIsFeedbackModalOpen] = useState(false);

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

  // Initialize deals once when component mounts or data becomes available
  useEffect(() => {
    if (!isInitialized && sessionClients.length > 0 && stages.length > 0) {
      console.log('🚀 PIPELINE INIT: Initializing deals for the first time');
      const initialDeals = createInitialDeals(sessionClients, sessionRequests, sessionQuotes, stages);
      console.log('🚀 PIPELINE INIT: Created', initialDeals.length, 'initial deals');
      setDeals(initialDeals);
      setIsInitialized(true);
      if (onDealsChange) {
        onDealsChange(initialDeals);
      }
    }
  }, [sessionClients, sessionRequests, sessionQuotes, stages, isInitialized, onDealsChange]);

  // Handle new quotes being created or status changes that require deal updates
  useEffect(() => {
    if (!isInitialized || isDragging) {
      console.log('📡 PIPELINE MONITOR: Skipping update - initialized:', isInitialized, 'isDragging:', isDragging);
      return;
    }
    
    console.log('📡 PIPELINE MONITOR: Checking for data changes that require deal updates');

    // Check for approved/converted quotes that need client status updates
    const approvedOrConvertedQuotes = sessionQuotes.filter(quote => quote.status === 'Approved' || quote.status === 'Converted');
    if (approvedOrConvertedQuotes.length > 0) {
      approvedOrConvertedQuotes.forEach(quote => {
        const client = sessionClients.find(c => c.id === quote.clientId);
        if (client && client.status === 'Lead') {
          console.log('📡 PIPELINE MONITOR: Updating client status from Lead to Active:', client.id);
          updateSessionClient(client.id, {
            status: 'Active'
          });
          toast.success(`Deal won! Client ${client.name} is now Active.`);
        }
      });
    }

    // Only regenerate deals if there are significant changes (new quotes/requests)
    const currentDealIds = new Set(deals.map(d => d.id));
    const newDeals = createInitialDeals(sessionClients, sessionRequests, sessionQuotes, stages, deals);
    const newDealIds = new Set(newDeals.map(d => d.id));

    // Check if we have new deals that weren't in the current set
    const hasNewDeals = newDeals.some(deal => !currentDealIds.has(deal.id));
    const hasRemovedDeals = deals.some(deal => !newDealIds.has(deal.id));
    
    // Only check for meaningful stage changes, not temporary drag-related ones
    const hasStageChanges = newDeals.some(newDeal => {
      const existingDeal = deals.find(d => d.id === newDeal.id);
      if (!existingDeal) return false;
      
      // Skip if this is a drag-related change (status is different but we're dragging)
      if (existingDeal.status !== newDeal.status && activeId === newDeal.id) {
        return false;
      }
      
      return existingDeal.status !== newDeal.status;
    });
    
    if (hasNewDeals || hasRemovedDeals || hasStageChanges) {
      console.log('📡 PIPELINE MONITOR: Detected changes requiring pipeline update');
      console.log('  - Has new deals:', hasNewDeals);
      console.log('  - Has removed deals:', hasRemovedDeals);
      console.log('  - Has stage changes:', hasStageChanges);

      setDeals(newDeals);
      if (onDealsChange) {
        onDealsChange(newDeals);
      }
    } else {
      console.log('📡 PIPELINE MONITOR: No significant changes detected, preserving current state');
    }
  }, [sessionClients, sessionRequests, sessionQuotes, stages, isInitialized, updateSessionClient, onDealsChange, deals, isDragging, activeId]);

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
    return `$ ${amount.toLocaleString()}.00`;
  };

  // Use filteredDeals for display but original deals for column height calculation
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

    // Check if it's a deal id - use original deals array for drag operations
    const deal = deals.find(deal => deal.id === id);
    const container = deal?.status || null;
    console.log('🔍 FIND CONTAINER: Deal', id, 'found in container:', container);
    return container;
  };

  // Calculate fixed height based on original deals array
  const fixedColumnHeight = useMemo(() => {
    const getOriginalColumnDeals = (columnId: string) => {
      return deals.filter(deal => deal.status === columnId);
    };
    const maxDeals = Math.max(...stages.map(stage => getOriginalColumnDeals(stage.id).length), 1);
    const headerHeight = 80;
    const cardHeight = 65;
    const cardSpacing = 8;
    const bufferSpace = 20;
    const totalSpacing = maxDeals > 1 ? (maxDeals - 1) * cardSpacing : 0;
    return headerHeight + maxDeals * cardHeight + totalSpacing + bufferSpace;
  }, [deals, stages]);

  // Enhanced validation function with complete Jobber stage blocking
  const validateDragOperation = (dealId: string, sourceStageId: string, targetStageId: string): {
    allowed: boolean;
    message?: string;
  } => {
    console.log('🔍 DRAG VALIDATION: Full validation for deal:', dealId, 'from:', sourceStageId, 'to:', targetStageId);
    
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
    const {
      active
    } = event;
    console.log('🚀 DRAG START: Active ID:', active.id);
    setActiveId(active.id as string);
    setIsDragging(true);
  };
  
  const handleDragOver = (event: DragOverEvent) => {
    const {
      active,
      over
    } = event;
    if (!over || !active) return;
    const activeId = active.id as string;
    const overId = over.id as string;
    console.log('🔄 DRAG OVER: Active:', activeId, 'Over:', overId);
    if (activeId === overId) return;
    const activeContainer = findContainer(activeId);
    const overContainer = findContainer(overId);
    console.log('🔄 DRAG OVER: Active container:', activeContainer, 'Over container:', overContainer);
    if (!activeContainer || !overContainer) return;

    // Don't move to action zones during drag over
    if (overContainer.startsWith('action-')) return;

    // UPDATED: Use new validation function
    const validation = validateDragOperation(activeId, activeContainer, overContainer);
    if (!validation.allowed) {
      console.log('🔄 DRAG OVER: Validation failed:', validation.message);
      return;
    }

    // Only move between containers during drag over
    if (activeContainer !== overContainer) {
      console.log('🔄 DRAG OVER: Moving between containers');
      setDeals(prevDeals => {
        return prevDeals.map(deal => {
          if (deal.id === activeId) {
            console.log('🔄 DRAG OVER: Updated deal', deal.id, 'status to', overContainer);
            // Reset stage entered date when moving to new container
            return {
              ...deal,
              status: overContainer,
              stageEnteredDate: new Date().toISOString()
            };
          }
          return deal;
        });
      });
    }
  };
  
  const handleDragEnd = (event: DragEndEvent) => {
    const {
      active,
      over
    } = event;
    console.log('🏁 DRAG END: Active:', active.id, 'Over:', over?.id);
    setActiveId(null);
    setIsDragging(false);
    
    if (!over || !active) {
      console.log('🏁 DRAG END: No over target, ending drag');
      return;
    }
    const activeId = active.id as string;
    const overId = over.id as string;
    if (activeId === overId) {
      console.log('🏁 DRAG END: Dropped on self, no action needed');
      return;
    }
    const overContainer = findContainer(overId);
    console.log('🏁 DRAG END: Over container:', overContainer);
    if (!overContainer) {
      console.log('🏁 DRAG END: No valid container found');
      return;
    }

    // Handle action zone drops
    if (overContainer.startsWith('action-')) {
      console.log('🏁 DRAG END: Handling action zone drop:', overContainer);
      switch (overContainer) {
        case 'action-delete':
          handleDeleteAction(activeId, deals, setDeals, updateSessionRequest, updateSessionQuote);
          break;
        case 'action-lost':
          handleLostAction(activeId, deals, setDeals, updateSessionRequest, updateSessionQuote);
          break;
        case 'action-won':
          handleWonAction(activeId, deals, setDeals, updateSessionRequest, updateSessionQuote, updateSessionClient, sessionClients);
          break;
      }
      return;
    }

    const activeContainer = findContainer(activeId);
    if (!activeContainer) {
      console.log('🏁 DRAG END: No active container found');
      return;
    }

    // UPDATED: Final validation with complete blocking
    const validation = validateDragOperation(activeId, activeContainer, overContainer);
    if (!validation.allowed) {
      console.log('🏁 DRAG END: Final validation failed:', validation.message);
      toast.error(validation.message);

      // Revert the deal to its original position
      setDeals(prevDeals => {
        const originalDeal = deals.find(d => d.id === activeId);
        if (originalDeal) {
          return prevDeals.map(deal => {
            if (deal.id === activeId) {
              console.log('🏁 DRAG END: Reverting deal to original status:', originalDeal.status);
              return {
                ...deal,
                status: originalDeal.status,
                stageEnteredDate: originalDeal.stageEnteredDate
              };
            }
            return deal;
          });
        }
        return prevDeals;
      });
      return;
    }

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
        
        // Update parent component immediately
        if (onDealsChange) {
          onDealsChange(updatedDeals);
        }
        
        return updatedDeals;
      });
    } else {
      // Moving between containers - set manual stage for custom stages
      console.log('🏁 DRAG END: Moving between containers - finalizing');
      setDeals(prevDeals => {
        const updatedDeals = prevDeals.map(deal => {
          if (deal.id === activeId) {
            console.log('🏁 DRAG END: Final update - deal', deal.id, 'moved to', overContainer);
            return {
              ...deal,
              status: overContainer,
              stageEnteredDate: new Date().toISOString(),
              manualStage: isJobberStageId(overContainer) ? undefined : overContainer // Only set manual stage for custom stages
            };
          }
          return deal;
        });
        
        // Update parent component immediately
        if (onDealsChange) {
          onDealsChange(updatedDeals);
        }
        
        return updatedDeals;
      });

      // REMOVED: persistDealStatusChange call - no longer needed for custom stages
      console.log('🏁 DRAG END: Custom stage move completed, no persistence needed');
    }
  };
  
  const activeItem = activeId ? deals.find(deal => deal.id === activeId) : null;
  
  return <div className="h-full relative">
      {/* Pipeline Header */}
      <div className="flex justify-end mb-4">
        
      </div>

      {/* Pipeline Columns with Dynamic Grid Layout */}
      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragStart={handleDragStart} onDragOver={handleDragOver} onDragEnd={handleDragEnd}>
        <div ref={containerRef} className="w-full">
          {shouldUseHorizontalScroll ? <ScrollArea className="w-full">
              <div className="flex space-x-4 pb-4 min-w-max">
                {stages.sort((a, b) => a.order - b.order).map(stage => {
              const columnDeals = getColumnDeals(stage.id);
              return <div key={stage.id} style={{
                width: `${columnWidth}px`
              }} className="flex-shrink-0">
                      <PipelineColumn id={stage.id} title={stage.title} deals={columnDeals} count={columnDeals.length} totalValue={getColumnTotalValue(stage.id)} fixedHeight={fixedColumnHeight} />
                    </div>;
            })}
              </div>
              <ScrollBar orientation="horizontal" />
            </ScrollArea> : <div className="grid gap-4 pb-4 transition-all duration-300 ease-out" style={{
          gridTemplateColumns: `repeat(${stages.length}, ${columnWidth}px)`,
          justifyContent: 'center'
        }}>
              {stages.sort((a, b) => a.order - b.order).map(stage => {
            const columnDeals = getColumnDeals(stage.id);
            return <PipelineColumn key={stage.id} id={stage.id} title={stage.title} deals={columnDeals} count={columnDeals.length} totalValue={getColumnTotalValue(stage.id)} fixedHeight={fixedColumnHeight} />;
          })}
            </div>}
        </div>

        <DragOverlay>
          {activeItem ? <DealCard deal={activeItem} isDragging /> : null}
        </DragOverlay>

        {/* Action Bar - shows when dragging */}
        <ActionBar isVisible={!!activeId} />
      </DndContext>

      {/* Feedback Modal */}
      <FeedbackModal isOpen={isFeedbackModalOpen} onClose={() => setIsFeedbackModalOpen(false)} />
    </div>;
};

export default SalesPipeline;
