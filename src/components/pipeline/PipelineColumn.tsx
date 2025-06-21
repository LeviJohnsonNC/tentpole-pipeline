
import React from 'react';
import { useDroppable } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { Badge } from "@/components/ui/badge";
import { MoreHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import DealCard from './DealCard';

interface Deal {
  id: number;
  client: string;
  title: string;
  property: string;
  contact: string;
  requested: string;
  amount: number;
  status: string;
}

interface PipelineColumnProps {
  id: string;
  title: string;
  deals: Deal[];
  count: number;
  totalValue: string;
  isOver?: boolean;
}

const PipelineColumn = ({ id, title, deals, count, totalValue, isOver }: PipelineColumnProps) => {
  const { setNodeRef } = useDroppable({
    id,
  });

  const dealIds = deals.map(deal => deal.id);

  return (
    <div 
      className={`
        flex flex-col bg-gray-50 rounded-lg p-4 
        transition-all duration-200 ease-out
        ${isOver ? 'bg-blue-50 ring-2 ring-blue-200 ring-opacity-50' : ''}
      `}
    >
      {/* Column Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-2">
          <h3 className="font-medium text-gray-900">{title}</h3>
          <Badge variant="secondary" className="text-xs">
            {count}
          </Badge>
        </div>
        <div className="flex items-center space-x-2">
          <span className="text-sm text-gray-500">
            {totalValue}
          </span>
          <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
            <MoreHorizontal className="h-3 w-3" />
          </Button>
        </div>
      </div>

      {/* Cards Container */}
      <div 
        ref={setNodeRef}
        className="flex-1 space-y-2 min-h-[200px]"
      >
        <SortableContext items={dealIds} strategy={verticalListSortingStrategy}>
          {deals.map((deal) => (
            <DealCard key={deal.id} deal={deal} />
          ))}
        </SortableContext>
        
        {/* Empty state */}
        {deals.length === 0 && (
          <div className="text-center py-8 text-gray-400">
            <p className="text-sm">No deals in this stage</p>
            {isOver && (
              <p className="text-xs mt-1 text-blue-600">Drop here to move deal</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default PipelineColumn;
