
import React, { useState, useMemo, useEffect } from "react";
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
import { createInitialDeals, Deal, handleDeleteAction, handleLostAction, handleWonAction } from './pipeline/SalesPipelineData';

interface SalesPipelineProps {
  onDealsChange?: (deals: Deal[]) => void;
  searchTerm?: string;
}

const SalesPipeline = ({ onDealsChange, searchTerm = '' }: SalesPipelineProps) => {
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

  // ENHANCED: Create initial deals and ensure they update when data changes with better logging
  const initialDeals = useMemo(() => {
    console.log('🔄 PIPELINE REFRESH: Creating initial deals with:');
    console.log('  - Clients:', sessionClients.length);
    console.log('  - Requests:', sessionRequests.length); 
    console.log('  - Quotes:', sessionQuotes.length);
    console.log('  - Stages:', stages.length);
    
    const deals = createInitialDeals(sessionClients, sessionRequests, sessionQuotes, stages);
    
    console.log('🎯 PIPELINE REFRESH RESULT:');
    console.log('  - Total deals created:', deals.length);
    console.log('  - Deals by type:', deals.reduce((acc, d) => {
      acc[d.type] = (acc[d.type] || 0) + 1;
      return acc;
    }, {} as Record<string, number>));
    console.log('  - Deals by stage:', deals.reduce((acc, d) => {
      acc[d.status] = (acc[d.status] || 0) + 1;
      return acc;
    }, {} as Record<string, number>));
    
    return deals;
  }, [sessionClients, sessionRequests, sessionQuotes, stages]);
  
  const [deals, setDeals] = useState<Deal[]>(initialDeals);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [isFeedbackModalOpen, setIsFeedbackModalOpen] = useState(false);
  
  // Filter deals based on search term - now includes title search
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
  
  // ENHANCED: Force pipeline refresh when session data changes
  React.useEffect(() => {
    console.log('📡 PIPELINE MONITOR: Session data changed, forcing pipeline refresh...');
    console.log('  - Quotes changed. Current quotes:', sessionQuotes.length);
    console.log('  - Quote statuses:', sessionQuotes.map(q => ({ id: q.id, status: q.status, clientId: q.clientId })));
    
    // Check each quote for approved/converted status
    const approvedOrConvertedQuotes = sessionQuotes.filter(quote => quote.status === 'Approved' || quote.status === 'Converted');
    console.log('  - Found approved/converted quotes:', approvedOrConvertedQuotes.length);
    
    if (approvedOrConvertedQuotes.length > 0) {
      approvedOrConvertedQuotes.forEach(quote => {
        console.log('  - Processing auto closed-won for quote:', quote.id, 'status:', quote.status);

        // Update client status to Active if they are currently a Lead
        const client = sessionClients.find(c => c.id === quote.clientId);
        if (client && client.status === 'Lead') {
          console.log('  - Updating client status from Lead to Active:', client.id);
          updateSessionClient(client.id, {
            status: 'Active'
          });
          toast.success(`Deal won! Client ${client.name} is now Active.`);
        }
      });
    }

    // CRITICAL: Always regenerate deals from fresh data to ensure new quotes appear immediately
    const newDeals = createInitialDeals(sessionClients, sessionRequests, sessionQuotes, stages);
    console.log('🔄 PIPELINE UPDATE: Regenerated deals count:', newDeals.length);
    
    // Force state update to ensure pipeline refreshes
    setDeals(newDeals);
    
    // Notify parent component of deals change
    if (onDealsChange) {
      onDealsChange(newDeals);
    }
    
  }, [sessionClients, sessionRequests, sessionQuotes, stages, updateSessionClient, onDealsChange]);

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
      // Only add to total if deal has an amount (i.e., has a quote)
      return sum + (deal.amount || 0);
    }, 0);
    return formatAmount(total);
  };
  
  const findContainer = (id: string) => {
    // Check if id is an action zone
    if (id.startsWith('action-')) {
      return id;
    }

    // Check if id is a column id
    if (stages.some(stage => stage.id === id)) {
      return id;
    }

    // Then check if it's a deal id - use original deals array for drag operations
    const deal = deals.find(deal => deal.id === id);
    return deal?.status || null;
  };

  // Calculate fixed height based on original deals array to maintain consistent column heights
  const fixedColumnHeight = useMemo(() => {
    const getOriginalColumnDeals = (columnId: string) => {
      return deals.filter(deal => deal.status === columnId);
    };
    
    const maxDeals = Math.max(...stages.map(stage => getOriginalColumnDeals(stage.id).length), 1); // Minimum of 1 to avoid 0 height

    // More precise measurements:
    const headerHeight = 80; // Header + counter/value + separator + padding
    const cardHeight = 65; // More realistic card height based on actual size
    const cardSpacing = 8; // space-y-2 = 8px spacing between cards
    const bufferSpace = 20; // Minimal buffer for scroll and breathing room

    // Calculate total spacing needed (n-1 spaces between n cards)
    const totalSpacing = maxDeals > 1 ? (maxDeals - 1) * cardSpacing : 0;
    return headerHeight + maxDeals * cardHeight + totalSpacing + bufferSpace;
  }, [deals, stages]);

  // Enhanced validation function for Jobber stages - FIXED to allow moves to New Deals
  const canDropInJobberStage = (dealId: string, targetStageId: string): {
    allowed: boolean;
    message?: string;
  } => {
    const deal = deals.find(d => d.id === dealId);
    const targetStage = stages.find(s => s.id === targetStageId);
    
    console.log('🔍 DRAG VALIDATION: Checking drop for deal:', dealId, 'to stage:', targetStageId);
    console.log('  - Deal found:', !!deal);
    console.log('  - Target stage found:', !!targetStage);
    console.log('  - Target stage isJobberStage:', targetStage?.isJobberStage);
    
    if (!deal || !targetStage) {
      console.log('  - Missing deal or target stage, allowing drop');
      return { allowed: true };
    }
    
    // IMPORTANT: Always allow drops to New Deals stage regardless of isJobberStage
    if (targetStageId === 'new-deals') {
      console.log('  - Target is New Deals stage, allowing drop');
      return { allowed: true };
    }
    
    // Only validate Jobber stages, not regular stages
    if (!targetStage.isJobberStage) {
      console.log('  - Target is not a Jobber stage, allowing drop');
      return { allowed: true };
    }
    
    const stageTitle = targetStage.title.toLowerCase();
    console.log('  - Validating Jobber stage:', stageTitle);

    // Map Jobber stage titles to required deal conditions
    if (stageTitle.includes('draft') && stageTitle.includes('quote')) {
      // For "Draft Quote" stage, need to have a quote (any status except archived)
      if (deal.type === 'quote') {
        // Quote-type deals already have a quote, so they're allowed
        const quote = sessionQuotes.find(q => q.id === deal.quoteId);
        if (!quote || quote.status === 'Archived') {
          return {
            allowed: false,
            message: "Cannot move archived quotes to Draft Quote stage."
          };
        }
      } else {
        // For request-type deals, check if there's any quote (except archived) for this request
        const requestQuote = sessionQuotes.find(q => q.requestId === deal.id && q.status !== 'Archived');
        if (!requestQuote) {
          return {
            allowed: false,
            message: "Only deals with created quotes can be moved to Draft Quote stage. Create a quote first."
          };
        }
      }
    } else if (stageTitle.includes('quote') && stageTitle.includes('awaiting')) {
      // For "Quote Awaiting Response" stage, need quote to be sent
      if (deal.type === 'quote') {
        // For quote-type deals, check if the quote has been sent
        const quote = sessionQuotes.find(q => q.id === deal.quoteId);
        if (!quote || quote.status !== 'Awaiting Response') {
          return {
            allowed: false,
            message: "Only sent quotes can be moved to Quote Awaiting Response stage. Send the quote first via text or email."
          };
        }
      } else {
        // For request-type deals, check if there's a sent quote for this request
        const requestQuote = sessionQuotes.find(q => q.requestId === deal.id && q.status === 'Awaiting Response');
        if (!requestQuote) {
          return {
            allowed: false,
            message: "Only deals with sent quotes can be moved to Quote Awaiting Response stage. Send the quote first via text or email."
          };
        }
      }
    } else if (stageTitle.includes('invoice') && stageTitle.includes('sent')) {
      // For "Invoice Sent" stage
      return {
        allowed: false,
        message: "Only jobs with sent invoices can be moved to Invoice Sent stage."
      };
    } else if (stageTitle.includes('work') && (stageTitle.includes('scheduled') || stageTitle.includes('progress'))) {
      // For work-related stages
      return {
        allowed: false,
        message: "Only scheduled jobs can be moved to work stages."
      };
    }
    
    console.log('  - Validation passed for Jobber stage');
    return { allowed: true };
  };
  
  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event;
    console.log('🚀 DRAG START: Active ID:', active.id);
    setActiveId(active.id as string);
  };
  
  const handleDragOver = (event: DragOverEvent) => {
    const { active, over } = event;
    if (!over || !active) return;
    
    const activeId = active.id as string;
    const overId = over.id as string;
    
    console.log('🔄 DRAG OVER: Active:', activeId, 'Over:', overId);

    // Don't do anything if we're hovering over the same item
    if (activeId === overId) return;
    
    const activeContainer = findContainer(activeId);
    const overContainer = findContainer(overId);
    
    console.log('  - Active container:', activeContainer, 'Over container:', overContainer);
    
    if (!activeContainer || !overContainer) return;

    // Don't move to action zones during drag over
    if (overContainer.startsWith('action-')) return;

    // Check Jobber stage validation before allowing drag over
    const validation = canDropInJobberStage(activeId, overContainer);
    if (!validation.allowed) {
      console.log('  - Validation failed:', validation.message);
      return; // Prevent drag over for invalid drops
    }

    // Only move between containers, don't reorder within the same container here
    if (activeContainer !== overContainer) {
      console.log('  - Moving between containers');
      setDeals(prevDeals => {
        return prevDeals.map(deal => {
          if (deal.id === activeId) {
            return {
              ...deal,
              status: overContainer
            };
          }
          return deal;
        });
      });
    }
  };
  
  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    console.log('🏁 DRAG END: Active:', active.id, 'Over:', over?.id);
    
    setActiveId(null);
    if (!over || !active) return;
    
    const activeId = active.id as string;
    const overId = over.id as string;

    // Don't do anything if dropped on itself
    if (activeId === overId) return;
    
    const overContainer = findContainer(overId);
    console.log('  - Over container:', overContainer);
    
    if (!overContainer) return;

    // Handle action zone drops with enhanced store updates
    if (overContainer.startsWith('action-')) {
      console.log('Handling action zone drop:', overContainer, 'for deal:', activeId);
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

    // Validate Jobber stage drops
    const validation = canDropInJobberStage(activeId, overContainer);
    if (!validation.allowed) {
      console.log('  - Final validation failed:', validation.message);
      toast.error(validation.message);
      // Revert the deal to its original position
      setDeals(prevDeals => {
        const originalDeal = initialDeals.find(d => d.id === activeId);
        if (originalDeal) {
          return prevDeals.map(deal => {
            if (deal.id === activeId) {
              return {
                ...deal,
                status: originalDeal.status
              };
            }
            return deal;
          });
        }
        return prevDeals;
      });
      return;
    }
    
    const activeContainer = findContainer(activeId);
    if (!activeContainer) return;
    
    if (activeContainer === overContainer) {
      // Reordering within the same container
      console.log('  - Reordering within same container');
      setDeals(prevDeals => {
        const containerDeals = prevDeals.filter(deal => deal.status === activeContainer);
        const otherDeals = prevDeals.filter(deal => deal.status !== activeContainer);
        const activeIndex = containerDeals.findIndex(deal => deal.id === activeId);
        const overIndex = containerDeals.findIndex(deal => deal.id === overId);
        if (activeIndex === -1 || overIndex === -1) return prevDeals;
        const reorderedDeals = arrayMove(containerDeals, activeIndex, overIndex);
        return [...otherDeals, ...reorderedDeals];
      });
    } else {
      // Moving between containers - ensure final state is correct
      console.log('  - Moving between containers - final update');
      setDeals(prevDeals => {
        return prevDeals.map(deal => {
          if (deal.id === activeId) {
            console.log('  - Updated deal', deal.id, 'status from', deal.status, 'to', overContainer);
            return {
              ...deal,
              status: overContainer
            };
          }
          return deal;
        });
      });
    }
  };
  
  const activeItem = activeId ? deals.find(deal => deal.id === activeId) : null;
  
  return <div className="h-full relative">
      {/* Pipeline Header */}
      <div className="flex justify-end mb-4">
        <Button 
          variant="outline" 
          onClick={() => setIsFeedbackModalOpen(true)}
          className="flex items-center gap-2"
        >
          <MessageSquare className="h-4 w-4" />
          Submit Feedback
        </Button>
      </div>

      {/* Pipeline Columns with Horizontal Scroll */}
      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragStart={handleDragStart} onDragOver={handleDragOver} onDragEnd={handleDragEnd}>
        <ScrollArea className="w-full">
          <div className="flex space-x-4 pb-4 min-w-max">
            {stages.sort((a, b) => a.order - b.order).map(stage => {
            const columnDeals = getColumnDeals(stage.id);
            return <div key={stage.id} className="w-44 flex-shrink-0">
                    <PipelineColumn id={stage.id} title={stage.title} deals={columnDeals} count={columnDeals.length} totalValue={getColumnTotalValue(stage.id)} fixedHeight={fixedColumnHeight} />
                  </div>;
          })}
          </div>
          <ScrollBar orientation="horizontal" />
        </ScrollArea>

        <DragOverlay>
          {activeItem ? <DealCard deal={activeItem} isDragging /> : null}
        </DragOverlay>

        {/* Action Bar - shows when dragging */}
        <ActionBar isVisible={!!activeId} />
      </DndContext>

      {/* Feedback Modal */}
      <FeedbackModal 
        isOpen={isFeedbackModalOpen} 
        onClose={() => setIsFeedbackModalOpen(false)} 
      />
    </div>;
};

export default SalesPipeline;
