import React, { useState, useMemo, useEffect } from "react";
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors, DragEndEvent, DragOverEvent, DragStartEvent, DragOverlay } from '@dnd-kit/core';
import { arrayMove, sortableKeyboardCoordinates } from '@dnd-kit/sortable';
import { Calendar, MessageSquare } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { toast } from "sonner";
import PipelineColumn from './pipeline/PipelineColumn';
import AggregateColumn from './pipeline/AggregateColumn';
import DealCard from './pipeline/DealCard';
import ActionBar from './pipeline/ActionBar';
import FeedbackModal from './FeedbackModal';
import { useClientStore } from "@/store/clientStore";
import { useRequestStore } from "@/store/requestStore";
import { useQuoteStore } from "@/store/quoteStore";
import { useStagesStore } from "@/store/stagesStore";
import { createInitialDeals, Deal, handleDeleteAction, handleLostAction, handleWonAction } from './pipeline/SalesPipelineData';
import { calculateAggregateMetrics, formatAmount } from './pipeline/SalesPipelineAggregates';

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

  // Calculate aggregate metrics
  const aggregateMetrics = useMemo(() => {
    return calculateAggregateMetrics(sessionRequests, sessionQuotes, sessionClients);
  }, [sessionRequests, sessionQuotes, sessionClients]);
  
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
  
  React.useEffect(() => {
    console.log('📡 PIPELINE MONITOR: Session data changed, forcing pipeline refresh...');
    console.log('  - Quotes changed. Current quotes:', sessionQuotes.length);
    console.log('  - Quote statuses:', sessionQuotes.map(q => ({ id: q.id, status: q.status, clientId: q.clientId })));
    
    const approvedOrConvertedQuotes = sessionQuotes.filter(quote => quote.status === 'Approved' || quote.status === 'Converted');
    console.log('  - Found approved/converted quotes:', approvedOrConvertedQuotes.length);
    
    if (approvedOrConvertedQuotes.length > 0) {
      approvedOrConvertedQuotes.forEach(quote => {
        console.log('  - Processing auto closed-won for quote:', quote.id, 'status:', quote.status);

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

    const newDeals = createInitialDeals(sessionClients, sessionRequests, sessionQuotes, stages);
    console.log('🔄 PIPELINE UPDATE: Regenerated deals count:', newDeals.length);
    
    setDeals(newDeals);
    
    if (onDealsChange) {
      onDealsChange(newDeals);
    }
    
  }, [sessionClients, sessionRequests, sessionQuotes, stages, updateSessionClient, onDealsChange]);

  const formatAmountDisplay = (amount: number) => {
    return `$ ${amount.toLocaleString()}.00`;
  };
  
  const getColumnDeals = (columnId: string) => {
    return filteredDeals.filter(deal => deal.status === columnId);
  };
  
  const getColumnTotalValue = (columnId: string) => {
    const columnDeals = getColumnDeals(columnId);
    const total = columnDeals.reduce((sum, deal) => {
      return sum + (deal.amount || 0);
    }, 0);
    return formatAmountDisplay(total);
  };

  const findContainer = (id: string) => {
    if (id.startsWith('action-')) {
      return id;
    }

    if (stages.some(stage => stage.id === id)) {
      return id;
    }

    const deal = deals.find(deal => deal.id === id);
    return deal?.status || null;
  };

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

  const canDropInJobberStage = (dealId: string, targetStageId: string): {
    allowed: boolean;
    message?: string;
  } => {
    const deal = deals.find(d => d.id === dealId);
    const targetStage = stages.find(s => s.id === targetStageId);
    if (!deal || !targetStage || !targetStage.isJobberStage) {
      return {
        allowed: true
      };
    }
    const stageTitle = targetStage.title.toLowerCase();

    if (stageTitle.includes('draft') && stageTitle.includes('quote')) {
      if (deal.type === 'quote') {
        const quote = sessionQuotes.find(q => q.id === deal.quoteId);
        if (!quote || quote.status === 'Archived') {
          return {
            allowed: false,
            message: "Cannot move archived quotes to Draft Quote stage."
          };
        }
      } else {
        const requestQuote = sessionQuotes.find(q => q.requestId === deal.id && q.status !== 'Archived');
        if (!requestQuote) {
          return {
            allowed: false,
            message: "Only deals with created quotes can be moved to Draft Quote stage. Create a quote first."
          };
        }
      }
    } else if (stageTitle.includes('quote') && stageTitle.includes('awaiting')) {
      if (deal.type === 'quote') {
        const quote = sessionQuotes.find(q => q.id === deal.quoteId);
        if (!quote || quote.status !== 'Awaiting Response') {
          return {
            allowed: false,
            message: "Only sent quotes can be moved to Quote Awaiting Response stage. Send the quote first via text or email."
          };
        }
      } else {
        const requestQuote = sessionQuotes.find(q => q.requestId === deal.id && q.status === 'Awaiting Response');
        if (!requestQuote) {
          return {
            allowed: false,
            message: "Only deals with sent quotes can be moved to Quote Awaiting Response stage. Send the quote first via text or email."
          };
        }
      }
    } else if (stageTitle.includes('invoice') && stageTitle.includes('sent')) {
      return {
        allowed: false,
        message: "Only jobs with sent invoices can be moved to Invoice Sent stage."
      };
    } else if (stageTitle.includes('work') && (stageTitle.includes('scheduled') || stageTitle.includes('progress'))) {
      return {
        allowed: false,
        message: "Only scheduled jobs can be moved to work stages."
      };
    }
    return {
      allowed: true
    };
  };

  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event;
    setActiveId(active.id as string);
  };

  const handleDragOver = (event: DragOverEvent) => {
    const { active, over } = event;
    if (!over || !active) return;
    const activeId = active.id as string;
    const overId = over.id as string;

    if (activeId === overId) return;
    const activeContainer = findContainer(activeId);
    const overContainer = findContainer(overId);
    if (!activeContainer || !overContainer) return;

    if (overContainer.startsWith('action-')) return;

    const validation = canDropInJobberStage(activeId, overContainer);
    if (!validation.allowed) {
      return;
    }

    if (activeContainer !== overContainer) {
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
    setActiveId(null);
    if (!over || !active) return;
    const activeId = active.id as string;
    const overId = over.id as string;

    if (activeId === overId) return;
    const overContainer = findContainer(overId);
    if (!overContainer) return;

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

    const validation = canDropInJobberStage(activeId, overContainer);
    if (!validation.allowed) {
      toast.error(validation.message);
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
            {/* Regular Pipeline Columns */}
            {stages.sort((a, b) => a.order - b.order).map(stage => {
              const columnDeals = getColumnDeals(stage.id);
              return <div key={stage.id} className="w-44 flex-shrink-0">
                      <PipelineColumn id={stage.id} title={stage.title} deals={columnDeals} count={columnDeals.length} totalValue={getColumnTotalValue(stage.id)} fixedHeight={fixedColumnHeight} />
                    </div>;
            })}
            
            {/* Aggregate Columns */}
            <div className="flex space-x-4 ml-6">
              <AggregateColumn
                title="Won"
                count={aggregateMetrics.wonCount}
                totalValue={formatAmount(aggregateMetrics.wonValue)}
                type="won"
              />
              <AggregateColumn
                title="Lost"
                count={aggregateMetrics.lostCount}
                totalValue={formatAmount(aggregateMetrics.lostValue)}
                type="lost"
              />
            </div>
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
