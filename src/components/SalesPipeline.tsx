
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
import PersistentActionBar from './pipeline/PersistentActionBar';
import { useClientStore } from "@/store/clientStore";
import { useRequestStore } from "@/store/requestStore";
import { useQuoteStore } from "@/store/quoteStore";
import { useStagesStore } from "@/store/stagesStore";
import { useManualMovementStore } from "@/store/manualMovementStore";
import { useResponsiveColumns } from "@/hooks/useResponsiveColumns";
import { createInitialDeals, createAllDeals, Deal, handleArchiveAction, handleLostAction, handleWonAction, canDropInJobberStage, canDragFromJobberStage } from './pipeline/SalesPipelineData';
import { Request } from "@/types/Request";

interface SalesPipelineProps {
  onDealsChange?: (deals: Deal[]) => void;
  onAllDealsChange?: (allDeals: Deal[]) => void;
  searchTerm?: string;
  onDealClick?: (dealId: string) => void;
  onWonClick?: () => void;
  onLostClick?: () => void;
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
  onDealClick,
  onWonClick,
  onLostClick
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

  // NEW: Manual movement tracking
  const {
    isManuallyMoved,
    addManualMovement,
    clearManualMovement
  } = useManualMovementStore();

  // Simplified state management
  const [isInitialized, setIsInitialized] = useState(false);
  const [deals, setDeals] = useState<Deal[]>([]); // Pipeline deals
  const [allDeals, setAllDeals] = useState<Deal[]>([]); // All deals including closed
  const [activeId, setActiveId] = useState<string | null>(null);
  const [isFeedbackModalOpen, setIsFeedbackModalOpen] = useState(false);
  const [isDraggingToActionZone, setIsDraggingToActionZone] = useState(false);

  // NEW: Track original deal position before drag starts
  const [originalDealPosition, setOriginalDealPosition] = useState<string | null>(null);

  // NEW: Helper function to get current deal position
  const getCurrentDealPosition = (dealId: string): string | null => {
    const deal = deals.find(d => d.id === dealId);
    return deal ? deal.status : null;
  };

  // Responsive columns setup - back to original column count
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
    padding: 32,
    includeAggregateColumns: false // Remove aggregate columns
  });

  // Initialize deals only once when component mounts
  useEffect(() => {
    if (!isInitialized && sessionClients.length > 0 && stages.length > 0) {
      console.log('🚀 PIPELINE INIT: Initializing deals for the first time');
      console.log('🚀 PIPELINE INIT: Session data:', {
        clients: sessionClients.length,
        requests: sessionRequests.length,
        quotes: sessionQuotes.length,
        stages: stages.length
      });
      const initialDeals = createInitialDeals(
        sessionClients, 
        sessionRequests, 
        sessionQuotes, 
        stages,
        isManuallyMoved,
        getCurrentDealPosition
      );
      const initialAllDeals = createAllDeals(sessionClients, sessionRequests, sessionQuotes, stages);
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
  }, [sessionClients, sessionRequests, sessionQuotes, stages, isInitialized, onDealsChange, onAllDealsChange, isManuallyMoved]);

  // ENHANCED: Better detection of new data changes with manual movement support
  useEffect(() => {
    if (!isInitialized) return;
    
    console.log('📡 PIPELINE UPDATE CHECK: Checking for data changes');
    console.log('📡 Current session data:', {
      clients: sessionClients.length,
      requests: sessionRequests.length,
      quotes: sessionQuotes.length
    });
    
    const newDeals = createInitialDeals(
      sessionClients, 
      sessionRequests, 
      sessionQuotes, 
      stages,
      isManuallyMoved,
      getCurrentDealPosition
    );
    const newAllDeals = createAllDeals(sessionClients, sessionRequests, sessionQuotes, stages);
    const currentDealIds = new Set(deals.map(d => d.id));
    const newDealIds = new Set(newDeals.map(d => d.id));
    const currentAllDealIds = new Set(allDeals.map(d => d.id));
    const newAllDealIds = new Set(newAllDeals.map(d => d.id));
    
    // Check for new or removed deals
    const hasNewDeals = newDeals.some(deal => !currentDealIds.has(deal.id));
    const hasRemovedDeals = deals.some(deal => !newDealIds.has(deal.id));
    const hasNewAllDeals = newAllDeals.some(deal => !currentAllDealIds.has(deal.id));
    const hasRemovedAllDeals = allDeals.some(deal => !newAllDealIds.has(deal.id));
    
    // ENHANCED: Also check for amount changes on existing deals
    const hasAmountChanges = newDeals.some(newDeal => {
      const existingDeal = deals.find(d => d.id === newDeal.id);
      return existingDeal && existingDeal.amount !== newDeal.amount;
    });

    const hasAllAmountChanges = newAllDeals.some(newDeal => {
      const existingDeal = allDeals.find(d => d.id === newDeal.id);
      return existingDeal && existingDeal.amount !== newDeal.amount;
    });

    // NEW: Check for status changes that should clear manual movements
    const hasStatusChanges = newDeals.some(newDeal => {
      const existingDeal = deals.find(d => d.id === newDeal.id);
      if (!existingDeal) return false;
      
      // If the deal would naturally be in a different Jobber stage, clear manual movement
      if (isJobberStageId(newDeal.status) && existingDeal.status !== newDeal.status) {
        console.log(`🧹 CLEARING MANUAL MOVEMENT: Deal ${newDeal.id} status changed from ${existingDeal.status} to ${newDeal.status}`);
        clearManualMovement(newDeal.id);
        return true;
      }
      return false;
    });
    
    console.log('📡 PIPELINE UPDATE CHECK Results:', {
      hasNewDeals,
      hasRemovedDeals,
      hasAmountChanges,
      hasStatusChanges,
      hasNewAllDeals,
      hasRemovedAllDeals,
      hasAllAmountChanges,
      currentDeals: deals.length,
      newDeals: newDeals.length,
      currentAllDeals: allDeals.length,
      newAllDeals: newAllDeals.length
    });
    
    if (hasNewDeals || hasRemovedDeals || hasAmountChanges || hasStatusChanges) {
      console.log('📡 PIPELINE: Detected pipeline changes, updating pipeline');
      setDeals(newDeals);
      if (onDealsChange) {
        onDealsChange(newDeals);
      }
    }

    if (hasNewAllDeals || hasRemovedAllDeals || hasAllAmountChanges) {
      console.log('📡 ALL DEALS: Detected all deals changes, updating all deals');
      setAllDeals(newAllDeals);
      if (onAllDealsChange) {
        onAllDealsChange(newAllDeals);
      }
    }
  }, [sessionClients.length, sessionRequests.length, sessionQuotes.length, sessionQuotes, isInitialized, onDealsChange, onAllDealsChange, isManuallyMoved, clearManualMovement]);

  // Helper function to format amounts
  const formatAmount = (amount: number) => {
    return `$${amount.toLocaleString()}`;
  };

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
    const bufferSpace = 85;
    const totalSpacing = maxDeals > 1 ? (maxDeals - 1) * cardSpacing : 0;
    return headerHeight + maxDeals * cardHeight + totalSpacing + bufferSpace;
  }, [deals, stages]);

  // UPDATED: Enhanced validation function that passes session data for condition checking
  const validateDragOperation = (dealId: string, sourceStageId: string, targetStageId: string): {
    allowed: boolean;
    message?: string;
  } => {
    console.log('🔍 DRAG VALIDATION: Full validation for deal:', dealId, 'from:', sourceStageId, 'to:', targetStageId);
    
    // Check if dragging FROM a stage is allowed (now always allowed)
    const fromValidation = canDragFromJobberStage(dealId, sourceStageId);
    if (!fromValidation.allowed) {
      console.log('🔍 DRAG VALIDATION: FROM validation failed:', fromValidation.message);
      return fromValidation;
    }
    
    // Check if dragging TO a stage is allowed (with condition checking for Jobber stages)
    const toValidation = canDropInJobberStage(dealId, targetStageId, deals, sessionRequests, sessionQuotes);
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
    setIsDraggingToActionZone(false);
    
    // NEW: Store the original position before any modifications
    const activeDeal = deals.find(deal => deal.id === active.id);
    if (activeDeal) {
      setOriginalDealPosition(activeDeal.status);
      console.log('🚀 DRAG START: Stored original position:', activeDeal.status);
    }
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

    // ENHANCED: Check if dragging towards action zone and prevent intermediate updates
    if (overContainer.startsWith('action-')) {
      console.log('🔄 DRAG OVER: Detected drag towards action zone, preventing intermediate updates');
      setIsDraggingToActionZone(true);
      return;
    } else {
      setIsDraggingToActionZone(false);
    }

    // Use validation function
    const validation = validateDragOperation(activeId, activeContainer, overContainer);
    if (!validation.allowed) {
      console.log('🔄 DRAG OVER: Validation failed:', validation.message);
      return;
    }

    // Only move between containers during drag over if not targeting action zones
    if (activeContainer !== overContainer && !isDraggingToActionZone) {
      console.log('🔄 DRAG OVER: Moving between containers');
      setDeals(prevDeals => {
        return prevDeals.map(deal => {
          if (deal.id === activeId) {
            console.log('🔄 DRAG OVER: Updated deal', deal.id, 'status to', overContainer);
            return {
              ...deal,
              status: overContainer,
              stageEnteredDate: new Date().toISOString() // Reset stage entered date on manual move
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
    setIsDraggingToActionZone(false);
    
    if (!over || !active) {
      console.log('🏁 DRAG END: No over target, ending drag');
      // Reset original position state
      setOriginalDealPosition(null);
      return;
    }
    const activeId = active.id as string;
    const overId = over.id as string;
    if (activeId === overId) {
      console.log('🏁 DRAG END: Dropped on self, no action needed');
      // Reset original position state
      setOriginalDealPosition(null);
      return;
    }
    const overContainer = findContainer(overId);
    console.log('🏁 DRAG END: Over container:', overContainer);
    if (!overContainer) {
      console.log('🏁 DRAG END: No valid container found');
      // Reset original position state
      setOriginalDealPosition(null);
      return;
    }

    // ENHANCED: Handle action zone drops with immediate state updates for both collections
    if (overContainer.startsWith('action-')) {
      console.log('🏁 DRAG END: Handling action zone drop:', overContainer);
      
      // Create enhanced handlers that update both source data AND both deal collections immediately
      const enhancedArchiveAction = (dealId: string) => {
        const deal = deals.find(d => d.id === dealId) || allDeals.find(d => d.id === dealId);
        if (!deal) return;
        
        // Update source data
        if (deal.type === 'request') {
          updateSessionRequest(dealId, { status: 'Archived' });
        } else if (deal.type === 'quote' && deal.quoteId) {
          updateSessionQuote(deal.quoteId, { status: 'Archived' });
        }
        
        // Clear manual movement tracking
        clearManualMovement(dealId);
        
        // IMMEDIATE: Update both deal collections to remove from both instantly
        setDeals(prevDeals => prevDeals.filter(d => d.id !== dealId));
        setAllDeals(prevDeals => prevDeals.filter(d => d.id !== dealId));
        
        toast.success(`Deal archived: ${deal.client}`);
        
        if (onDealsChange) {
          const updatedDeals = deals.filter(d => d.id !== dealId);
          onDealsChange(updatedDeals);
        }
        if (onAllDealsChange) {
          const updatedAllDeals = allDeals.filter(d => d.id !== dealId);
          onAllDealsChange(updatedAllDeals);
        }
      };
      
      const enhancedLostAction = (dealId: string) => {
        const deal = deals.find(d => d.id === dealId) || allDeals.find(d => d.id === dealId);
        if (!deal) return;
        
        // Update source data
        if (deal.type === 'request') {
          updateSessionRequest(dealId, { status: 'Closed Lost' });
        } else if (deal.type === 'quote' && deal.quoteId) {
          updateSessionQuote(deal.quoteId, { status: 'Closed Lost' });
        }
        
        // Clear manual movement tracking
        clearManualMovement(dealId);
        
        // IMMEDIATE: Remove from pipeline deals, update status in all deals
        setDeals(prevDeals => prevDeals.filter(d => d.id !== dealId));
        setAllDeals(prevDeals => prevDeals.map(d => 
          d.id === dealId ? { ...d, status: 'Closed Lost', stageEnteredDate: new Date().toISOString() } : d
        ));
        
        toast.error(`Deal marked as lost: ${deal.client}`);
        
        if (onDealsChange) {
          const updatedDeals = deals.filter(d => d.id !== dealId);
          onDealsChange(updatedDeals);
        }
        if (onAllDealsChange) {
          const updatedAllDeals = allDeals.map(d => 
            d.id === dealId ? { ...d, status: 'Closed Lost', stageEnteredDate: new Date().toISOString() } : d
          );
          onAllDealsChange(updatedAllDeals);
        }
      };
      
      const enhancedWonAction = (dealId: string) => {
        const deal = deals.find(d => d.id === dealId) || allDeals.find(d => d.id === dealId);
        if (!deal) return;
        
        // Update source data
        if (deal.type === 'request') {
          updateSessionRequest(dealId, { status: 'Closed Won' });
        } else if (deal.type === 'quote' && deal.quoteId) {
          updateSessionQuote(deal.quoteId, { status: 'Closed Won' });
        }
        
        // Update client status to Active if they're currently a Lead
        const client = sessionClients.find(c => c.name === deal.client);
        if (client && client.status === 'Lead') {
          console.log('Updating client status from Lead to Active:', client.id);
          updateSessionClient(client.id, { status: 'Active' });
        }
        
        // Clear manual movement tracking
        clearManualMovement(dealId);
        
        // IMMEDIATE: Remove from pipeline deals, update status in all deals
        setDeals(prevDeals => prevDeals.filter(d => d.id !== dealId));
        setAllDeals(prevDeals => prevDeals.map(d => 
          d.id === dealId ? { ...d, status: 'Closed Won', stageEnteredDate: new Date().toISOString() } : d
        ));
        
        toast.success(`Deal won: ${deal.client}!`);
        
        if (onDealsChange) {
          const updatedDeals = deals.filter(d => d.id !== dealId);
          onDealsChange(updatedDeals);
        }
        if (onAllDealsChange) {
          const updatedAllDeals = allDeals.map(d => 
            d.id === dealId ? { ...d, status: 'Closed Won', stageEnteredDate: new Date().toISOString() } : d
          );
          onAllDealsChange(updatedAllDeals);
        }
      };
      
      switch (overContainer) {
        case 'action-archive':
          enhancedArchiveAction(activeId);
          break;
        case 'action-lost':
          enhancedLostAction(activeId);
          break;
        case 'action-won':
          enhancedWonAction(activeId);
          break;
      }
      
      // Reset original position state
      setOriginalDealPosition(null);
      return;
    }

    const activeContainer = findContainer(activeId);
    if (!activeContainer) {
      console.log('🏁 DRAG END: No active container found');
      // Reset original position state
      setOriginalDealPosition(null);
      return;
    }

    // Final validation
    const validation = validateDragOperation(activeId, activeContainer, overContainer);
    if (!validation.allowed) {
      console.log('🏁 DRAG END: Final validation failed:', validation.message);
      toast.error(validation.message);

      // FIXED: Revert the deal to its ORIGINAL position (not current position)
      if (originalDealPosition) {
        console.log('🏁 DRAG END: Reverting deal to ORIGINAL status:', originalDealPosition);
        setDeals(prevDeals => {
          return prevDeals.map(deal => {
            if (deal.id === activeId) {
              // Find the original deal data to restore all properties
              const originalDeal = deals.find(d => d.id === activeId);
              return {
                ...deal,
                status: originalDealPosition,
                stageEnteredDate: originalDeal?.stageEnteredDate || deal.stageEnteredDate
              };
            }
            return deal;
          });
        });
      }
      
      // Reset original position state
      setOriginalDealPosition(null);
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
        
        if (onDealsChange) {
          onDealsChange(updatedDeals);
        }
        
        return updatedDeals;
      });
    } else {
      // Moving between containers - TRACK MANUAL MOVEMENT
      console.log('🏁 DRAG END: Moving between containers - tracking manual movement');

      // NEW: Track manual movement if moving FROM a Jobber stage TO a non-Jobber stage
      if (isJobberStageId(activeContainer) && !isJobberStageId(overContainer)) {
        console.log(`📝 TRACKING MANUAL MOVEMENT: Deal ${activeId} moved from Jobber stage ${activeContainer} to ${overContainer}`);
        addManualMovement(activeId, activeContainer, overContainer);
      }

      setDeals(prevDeals => {
        const updatedDeals = prevDeals.map(deal => {
          if (deal.id === activeId) {
            console.log('🏁 DRAG END: Final update - deal', deal.id, 'moved to', overContainer);
            return {
              ...deal,
              status: overContainer,
              stageEnteredDate: new Date().toISOString() // Reset stage entered date on manual move
            };
          }
          return deal;
        });
        
        if (onDealsChange) {
          onDealsChange(updatedDeals);
        }
        
        return updatedDeals;
      });

      console.log('🏁 DRAG END: Manual move completed and tracked');
    }
    
    // Reset original position state
    setOriginalDealPosition(null);
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
                {/* Regular pipeline columns only */}
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
              
              {/* Action Bar aligned with scrollable columns */}
              <div className="flex space-x-4 min-w-max">
                <div style={{ width: `${columnWidth * stages.length + (stages.length - 1) * 16}px` }}>
                  <PersistentActionBar 
                    onWonClick={onWonClick}
                    onLostClick={onLostClick}
                  />
                </div>
              </div>
            </ScrollArea>
          ) : (
            <>
              <div className="grid gap-4 pb-4 transition-all duration-300 ease-out" style={{
                gridTemplateColumns: `repeat(${stages.length}, ${columnWidth}px)`,
                justifyContent: 'center'
              }}>
                {/* Regular pipeline columns only */}
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
              
              {/* Action Bar aligned with grid columns */}
              <div className="transition-all duration-300 ease-out" style={{
                width: `${columnWidth * stages.length + (stages.length - 1) * 16}px`,
                margin: '0 auto'
              }}>
                <PersistentActionBar 
                  onWonClick={onWonClick}
                  onLostClick={onLostClick}
                />
              </div>
            </>
          )}
        </div>

        <DragOverlay>
          {activeItem ? <DealCard deal={activeItem} isDragging /> : null}
        </DragOverlay>
      </DndContext>

      {/* Feedback Modal */}
      <FeedbackModal isOpen={isFeedbackModalOpen} onClose={() => setIsFeedbackModalOpen(false)} />
    </div>
  );
};

export default SalesPipeline;
