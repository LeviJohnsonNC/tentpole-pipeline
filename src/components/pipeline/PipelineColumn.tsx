
import React from 'react';
import { useDroppable } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import DealCard from './DealCard';
import { Stage } from '@/store/stagesStore';

interface Deal {
  id: string;
  client: string;
  title: string;
  property: string;
  contact: string;
  requested: string;
  amount?: number;
  status: string;
  createdAt: string;
  stageEnteredDate: string;
}

interface PipelineColumnProps {
  id: string;
  title: string;
  deals: Deal[];
  count: number;
  totalValue: string;
  fixedHeight: number;
  stage?: Stage;
  onDealClick?: (dealId: string) => void;
}

const PipelineColumn = ({
  id,
  title,
  deals,
  count,
  totalValue,
  fixedHeight,
  stage,
  onDealClick
}: PipelineColumnProps) => {
  const { setNodeRef, isOver } = useDroppable({
    id: id,
  });

  const droppableStyle = {
    backgroundColor: isOver ? 'lightblue' : undefined,
  };

  return (
    <div
      ref={setNodeRef}
      style={droppableStyle}
      className={`bg-gray-50 rounded-lg border border-gray-200 flex flex-col ${
        isOver ? 'ring-2 ring-blue-300 bg-blue-50' : ''
      }`}
      style={{
        height: `${fixedHeight}px`,
        ...droppableStyle
      }}
    >
      {/* Header */}
      <div className="p-3 border-b border-gray-200 bg-white rounded-t-lg">
        <div className="flex items-center justify-between mb-1">
          <h3 className="font-medium text-gray-900 text-sm">{title}</h3>
          <Badge variant="secondary" className="text-xs">
            {count}
          </Badge>
        </div>
        <p className="text-xs text-gray-600 font-medium">{totalValue}</p>
      </div>
      
      {/* Deals */}
      <SortableContext items={deals.map(deal => deal.id)} strategy={verticalListSortingStrategy}>
        <ScrollArea className="flex-1 p-2">
          <div className="space-y-2">
            {deals.map((deal) => (
              <DealCard 
                key={deal.id} 
                deal={deal} 
                stage={stage}
                onDealClick={onDealClick}
              />
            ))}
          </div>
        </ScrollArea>
      </SortableContext>
    </div>
  );
};

export default PipelineColumn;
