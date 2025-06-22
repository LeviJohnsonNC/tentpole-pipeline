import React, { useState, useMemo } from "react";
import { 
  DndContext, 
  closestCenter, 
  KeyboardSensor, 
  PointerSensor, 
  useSensor, 
  useSensors,
  DragEndEvent,
  DragOverEvent,
  DragStartEvent,
  DragOverlay,
} from '@dnd-kit/core';
import { 
  arrayMove, 
  sortableKeyboardCoordinates 
} from '@dnd-kit/sortable';
import { Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import PipelineColumn from './pipeline/PipelineColumn';
import DealCard from './pipeline/DealCard';
import { useClientStore } from "@/store/clientStore";
import { useRequestStore } from "@/store/requestStore";
import { createInitialDeals, pipelineColumns, Deal } from './pipeline/SalesPipelineData';

const SalesPipeline = () => {
  const { sessionClients } = useClientStore();
  const { sessionRequests } = useRequestStore();
  
  const initialDeals = useMemo(() => {
    return createInitialDeals(sessionClients, sessionRequests);
  }, [sessionClients, sessionRequests]);
  
  const [deals, setDeals] = useState<Deal[]>(initialDeals);
  const [activeId, setActiveId] = useState<string | null>(null);

  // Update deals when session data changes
  React.useEffect(() => {
    setDeals(createInitialDeals(sessionClients, sessionRequests));
  }, [sessionClients, sessionRequests]);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const formatAmount = (amount: number) => {
    return `$ ${amount.toLocaleString()}.00`;
  };

  const getColumnDeals = (columnId: string) => {
    return deals.filter(deal => deal.status === columnId);
  };

  const getColumnTotalValue = (columnId: string) => {
    const columnDeals = getColumnDeals(columnId);
    const total = columnDeals.reduce((sum, deal) => sum + deal.amount, 0);
    return formatAmount(total);
  };

  const findContainer = (id: string) => {
    // Check if id is a column id first
    if (pipelineColumns.some(col => col.id === id)) {
      return id;
    }
    
    // Then check if it's a deal id
    const deal = deals.find(deal => deal.id === id);
    return deal?.status || null;
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

    // Don't do anything if we're hovering over the same item
    if (activeId === overId) return;

    const activeContainer = findContainer(activeId);
    const overContainer = findContainer(overId);

    if (!activeContainer || !overContainer) return;

    // Only move between containers, don't reorder within the same container here
    if (activeContainer !== overContainer) {
      setDeals((prevDeals) => {
        return prevDeals.map(deal => {
          if (deal.id === activeId) {
            return { ...deal, status: overContainer };
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

    // Don't do anything if dropped on itself
    if (activeId === overId) return;

    const activeContainer = findContainer(activeId);
    const overContainer = findContainer(overId);

    if (!activeContainer || !overContainer) return;

    if (activeContainer === overContainer) {
      // Reordering within the same container
      setDeals((prevDeals) => {
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
      setDeals((prevDeals) => {
        return prevDeals.map(deal => {
          if (deal.id === activeId) {
            return { ...deal, status: overContainer };
          }
          return deal;
        });
      });
    }
  };

  const activeItem = activeId ? deals.find(deal => deal.id === activeId) : null;

  return (
    <div className="h-full">
      {/* Pipeline Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <span className="text-sm text-gray-600">Sort by</span>
            <Button variant="outline" size="sm" className="h-8">
              Days in stage
            </Button>
          </div>
          <div className="flex items-center space-x-2">
            <Calendar className="h-4 w-4 text-gray-400" />
            <Button variant="outline" size="sm" className="h-8">
              Filter by date
            </Button>
          </div>
          <span className="text-sm text-gray-500">({deals.length} results)</span>
        </div>
      </div>

      {/* Pipeline Columns */}
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragStart={handleDragStart}
        onDragOver={handleDragOver}
        onDragEnd={handleDragEnd}
      >
        <div className="grid grid-cols-4 gap-6 h-full">
          {pipelineColumns.map((column) => {
            const columnDeals = getColumnDeals(column.id);
            return (
              <PipelineColumn
                key={column.id}
                id={column.id}
                title={column.title}
                deals={columnDeals}
                count={columnDeals.length}
                totalValue={getColumnTotalValue(column.id)}
              />
            );
          })}
        </div>

        <DragOverlay>
          {activeItem ? (
            <DealCard deal={activeItem} isDragging />
          ) : null}
        </DragOverlay>
      </DndContext>
    </div>
  );
};

export default SalesPipeline;
