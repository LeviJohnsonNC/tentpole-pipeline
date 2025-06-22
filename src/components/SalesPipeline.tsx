
import React, { useState } from "react";
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
import { initialDeals, pipelineColumns, Deal } from './pipeline/SalesPipelineData';

const SalesPipeline = () => {
  const [deals, setDeals] = useState<Deal[]>(initialDeals);
  const [activeId, setActiveId] = useState<string | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8, // Require 8px movement before drag starts
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
    const deal = deals.find(deal => deal.id === id);
    return deal?.status || null;
  };

  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event;
    setActiveId(active.id as string);
  };

  const handleDragOver = (event: DragOverEvent) => {
    const { active, over } = event;
    
    if (!over) return;

    const activeId = active.id as string;
    const overId = over.id;

    // Find the containers
    const activeContainer = findContainer(activeId);
    const overContainer = typeof overId === 'string' ? overId : findContainer(String(overId));

    if (!activeContainer || !overContainer) return;

    // If we're dragging over a different container
    if (activeContainer !== overContainer) {
      setDeals((deals) => {
        return deals.map(deal => {
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
    
    if (!over) {
      setActiveId(null);
      return;
    }

    const activeId = active.id as string;
    const overId = over.id;

    const activeContainer = findContainer(activeId);
    const overContainer = typeof overId === 'string' ? overId : findContainer(String(overId));

    if (!activeContainer || !overContainer) {
      setActiveId(null);
      return;
    }

    if (activeContainer === overContainer) {
      // Reordering within the same container
      const containerDeals = deals.filter(deal => deal.status === activeContainer);
      const activeIndex = containerDeals.findIndex(deal => deal.id === activeId);
      const overIndex = containerDeals.findIndex(deal => deal.id === overId);

      if (activeIndex !== overIndex) {
        const newOrder = arrayMove(containerDeals, activeIndex, overIndex);
        const otherDeals = deals.filter(deal => deal.status !== activeContainer);
        setDeals([...otherDeals, ...newOrder]);
      }
    }

    setActiveId(null);
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
