
import React from 'react';
import { cn } from '@/lib/utils';

interface AggregateColumnProps {
  title: string;
  count: number;
  totalValue: string;
  type: 'won' | 'lost';
  onClick: () => void;
  fixedHeight: number;
}

const AggregateColumn = ({
  title,
  count,
  totalValue,
  type,
  onClick,
  fixedHeight
}: AggregateColumnProps) => {
  const headerBgColor = type === 'won' ? 'bg-green-500' : 'bg-red-500';
  
  return (
    <div 
      className="bg-white rounded-lg border border-gray-200 shadow-sm cursor-pointer hover:shadow-md transition-shadow"
      style={{ height: `${fixedHeight}px` }}
      onClick={onClick}
    >
      {/* Header */}
      <div className={cn(
        "px-3 py-2 rounded-t-lg text-white font-medium text-sm",
        headerBgColor
      )}>
        <div className="flex items-center justify-between">
          <span>{title}</span>
          <span className="bg-white/20 px-2 py-0.5 rounded-full text-xs font-semibold">
            {count}
          </span>
        </div>
        <div className="text-xs font-normal mt-1 opacity-90">
          {totalValue}
        </div>
      </div>
      
      {/* Empty body with subtle indication this is clickable */}
      <div className="p-4 h-full flex items-center justify-center text-gray-400">
        <div className="text-center">
          <div className="text-sm">Click to view</div>
          <div className="text-xs mt-1">{title.toLowerCase()} deals</div>
        </div>
      </div>
    </div>
  );
};

export default AggregateColumn;
