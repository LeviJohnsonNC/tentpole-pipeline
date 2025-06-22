
import React from 'react';
import { useDroppable } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { MoreHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import DealCard from './DealCard';

interface Deal {
  id: string;
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
}

const PipelineColumn = ({ id, title, deals, count, totalValue }: PipelineColumnProps) => {
  const { setNodeRef, isOver } = useDroppable({
    id,
  });

  const dealIds = deals.map(deal => deal.id);

  return (
    <div 
      className={`
        flex flex-col bg-gray-50 rounded-lg p-3 
        transition-all duration-200 ease-out
        ${isOver ? 'bg-blue-50 ring-2 ring-blue-200 ring-opacity-50' : ''}
      `}
    >
      {/* Column Header */}
      <div className="mb-3">
        <div className="flex items-center justify-between mb-2">
          <h3 className="font-medium text-gray-900 text-sm truncate">{title}</h3>
          <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
            <MoreHorizontal className="h-3 w-3" />
          </Button>
        </div>
        
        {/* Counter and Total Value */}
        <div className="flex items-center justify-between">
          <Badge variant="secondary" className="text-xs">
            {count}
          </Badge>
          <span className="text-xs text-gray-500 truncate">
            {totalValue}
          </span>
        </div>
      </div>

      {/* Separator */}
      <Separator className="mb-3" />

      {/* Cards Container */}
      <div 
        ref={setNodeRef}
        className="flex-1 space-y-2 min-h-[200px] relative"
      >
        <SortableContext items={dealIds} strategy={verticalListSortingStrategy}>
          {deals.map((deal) => (
            <DealCard key={deal.id} deal={deal} />
          ))}
        </SortableContext>
        
        {/* Empty state */}
        {deals.length === 0 && (
          <div className="text-center py-6 text-gray-400">
            <p className="text-xs">No deals in this stage</p>
            {isOver && (
              <p className="text-xs mt-1 text-blue-600">Drop here to move deal</p>
            )}
          </div>
        )}
        
        {/* Drop zone overlay for better UX */}
        {isOver && deals.length > 0 && (
          <div className="absolute inset-0 bg-blue-100 bg-opacity-20 rounded border-2 border-dashed border-blue-300 pointer-events-none" />
        )}
      </div>
    </div>
  );
};

export default PipelineColumn;
