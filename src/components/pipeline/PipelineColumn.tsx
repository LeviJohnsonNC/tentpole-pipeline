import React from 'react';
import { useDroppable } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { MoreHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useStagesStore } from "@/store/stagesStore";
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
  fixedHeight: number;
}
const PipelineColumn = ({
  id,
  title,
  deals,
  count,
  totalValue,
  fixedHeight
}: PipelineColumnProps) => {
  const {
    setNodeRef,
    isOver
  } = useDroppable({
    id
  });
  const {
    stages
  } = useStagesStore();
  const stage = stages.find(s => s.id === id);
  const isJobberStage = stage?.isJobberStage;

  // Don't show amount for New Deals and Contacted columns
  const shouldShowAmount = id !== 'new-deals' && id !== 'contacted';
  const dealIds = deals.map(deal => deal.id);
  return <div className={`
        flex flex-col rounded-lg p-3 
        transition-all duration-200 ease-out
        ${isJobberStage ? 'bg-gray-100' : 'bg-gray-50'}
        ${isOver ? isJobberStage ? 'bg-gray-200 ring-2 ring-gray-300 ring-opacity-50' : 'bg-blue-50 ring-2 ring-blue-200 ring-opacity-50' : ''}
      `} style={{
    height: `${fixedHeight}px`
  }}>
      {/* Column Header */}
      <div className="mb-3 flex-shrink-0">
        <div className="flex items-center justify-between mb-2">
          <h3 className="font-medium text-gray-900 text-sm truncate">{title}</h3>
          
        </div>
        
        {/* Counter and Total Value */}
        <div className="flex items-center justify-between">
          <Badge variant="secondary" className="text-xs">
            {count}
          </Badge>
          {shouldShowAmount && <span className="text-xs text-gray-500 truncate">
              {totalValue}
            </span>}
        </div>
      </div>

      {/* Separator */}
      <Separator className="mb-3 flex-shrink-0" />

      {/* Cards Container */}
      <div ref={setNodeRef} className="flex-1 space-y-2 relative overflow-y-auto">
        <SortableContext items={dealIds} strategy={verticalListSortingStrategy}>
          {deals.map(deal => <DealCard key={deal.id} deal={deal} />)}
        </SortableContext>
        
        {/* Empty state */}
        {deals.length === 0 && <div className="text-center py-6 text-gray-400">
            <p className="text-xs">No deals in this stage</p>
            {isOver && <p className="text-xs mt-1 text-blue-600">Drop here to move deal</p>}
          </div>}
        
        {/* Drop zone overlay for better UX */}
        {isOver && deals.length > 0 && <div className={`absolute inset-0 bg-opacity-20 rounded border-2 border-dashed pointer-events-none ${isJobberStage ? 'bg-gray-200 border-gray-400' : 'bg-blue-100 border-blue-300'}`} />}
      </div>
    </div>;
};
export default PipelineColumn;