import React from 'react';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { Badge } from '@/components/ui/badge';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';
import PipelineColumn from './PipelineColumn';
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

interface PipelineBucketProps {
  title: string;
  stages: Stage[];
  deals: Deal[];
  fixedHeight: number;
  shouldUseHorizontalScroll: boolean;
  columnWidth: number;
  formatAmount: (amount: number) => string;
  onDealClick?: (dealId: string) => void;
}

const PipelineBucket = ({
  title,
  stages,
  deals,
  fixedHeight,
  shouldUseHorizontalScroll,
  columnWidth,
  formatAmount,
  onDealClick
}: PipelineBucketProps) => {
  // Helper functions for column data
  const getColumnDeals = (columnId: string) => {
    return deals.filter(deal => deal.status === columnId);
  };
  
  const getColumnTotalValue = (columnId: string) => {
    const columnDeals = getColumnDeals(columnId);
    const total = columnDeals.reduce((sum, deal) => {
      return sum + (deal.amount || 0);
    }, 0);
    return formatAmount(total);
  };

  // Calculate total deals in this bucket
  const totalDeals = stages.reduce((sum, stage) => {
    return sum + getColumnDeals(stage.id).length;
  }, 0);

  // Calculate total value in this bucket
  const totalValue = stages.reduce((sum, stage) => {
    const columnDeals = getColumnDeals(stage.id);
    return sum + columnDeals.reduce((colSum, deal) => colSum + (deal.amount || 0), 0);
  }, 0);

  if (stages.length === 0) {
    return null;
  }

  return (
    <div className="mb-8">
      {/* Bucket Header */}
      <div className="bg-white border border-gray-200 rounded-lg p-4 mb-4 shadow-sm">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <h2 className="text-xl font-semibold text-gray-900">{title}</h2>
            <Badge variant="secondary" className="text-sm">
              {totalDeals}
            </Badge>
          </div>
          {totalValue > 0 && (
            <div className="text-right">
              <p className="text-lg font-semibold text-green-600">
                {formatAmount(totalValue)}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Bucket Columns */}
      <div className="w-full">
        {shouldUseHorizontalScroll ? (
          <ScrollArea className="w-full">
            <div className="flex gap-4 min-w-max pb-4">
              {stages.sort((a, b) => a.order - b.order).map(stage => (
                <div key={stage.id} style={{ width: `${columnWidth}px` }} className="flex-shrink-0">
                  <PipelineColumn
                    id={stage.id}
                    title={stage.title}
                    deals={getColumnDeals(stage.id)}
                    count={getColumnDeals(stage.id).length}
                    totalValue={getColumnTotalValue(stage.id)}
                    fixedHeight={fixedHeight}
                    stage={stage}
                    onDealClick={onDealClick}
                  />
                </div>
              ))}
            </div>
            <ScrollBar orientation="horizontal" />
          </ScrollArea>
        ) : (
          <div 
            className="grid gap-4 pb-4 transition-all duration-300 ease-out"
            style={{
              gridTemplateColumns: `repeat(${stages.length}, ${columnWidth}px)`,
              justifyContent: 'center'
            }}
          >
            {stages.sort((a, b) => a.order - b.order).map(stage => (
              <PipelineColumn
                key={stage.id}
                id={stage.id}
                title={stage.title}
                deals={getColumnDeals(stage.id)}
                count={getColumnDeals(stage.id).length}
                totalValue={getColumnTotalValue(stage.id)}
                fixedHeight={fixedHeight}
                stage={stage}
                onDealClick={onDealClick}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default PipelineBucket;