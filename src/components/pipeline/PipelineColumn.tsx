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

  const isJobberStage = stage?.isJobberStage;

  const getColumnStyles = () => {
    const baseStyles = {
      height: `${fixedHeight}px`,
    };

    if (isJobberStage) {
      // Automated Jobber stage styling
      return {
        ...baseStyles,
        backgroundColor: isOver ? '#f3f4f6' : '#f9fafb',
      };
    } else {
      // Manual stage styling
      return {
        ...baseStyles,
        backgroundColor: isOver ? 'lightblue' : undefined,
      };
    }
  };

  const getColumnClasses = () => {
    if (isJobberStage) {
      return `bg-gray-50/50 rounded-lg border-2 border-solid border-gray-400 flex flex-col relative ${
        isOver ? 'ring-1 ring-gray-400 bg-gray-100/50' : ''
      }`;
    } else {
      return `bg-gray-50 rounded-lg border border-gray-200 flex flex-col ${
        isOver ? 'ring-2 ring-blue-300 bg-blue-50' : ''
      }`;
    }
  };

  // Don't show amount if it's $0
  const shouldShowAmount = totalValue !== '$0';

  return (
    <div
      ref={setNodeRef}
      style={getColumnStyles()}
      className={getColumnClasses()}
    >
      {/* Header */}
      <div className={`p-3 border-b flex flex-col h-20 ${
        isJobberStage 
          ? 'border-gray-400 bg-gray-100/50 rounded-t-lg' 
          : 'border-gray-200 bg-white rounded-t-lg'
      }`}>
        <div className="flex items-center justify-between">
          <h3 className={`font-medium text-sm truncate pr-2 ${
            isJobberStage ? 'text-gray-700' : 'text-gray-900'
          }`} title={title}>
            {title}
          </h3>
          <Badge variant="secondary" className="text-xs flex-shrink-0">
            {count}
          </Badge>
        </div>
        <div className="mt-1 h-4 flex items-start">
          {shouldShowAmount && (
            <p className="text-xs font-medium text-green-600">
              {totalValue}
            </p>
          )}
        </div>
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
