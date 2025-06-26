
import React from 'react';
import { Badge } from "@/components/ui/badge";

interface AggregateColumnProps {
  title: string;
  count: number;
  totalValue: string;
  type: 'won' | 'lost';
}

const AggregateColumn: React.FC<AggregateColumnProps> = ({
  title,
  count,
  totalValue,
  type
}) => {
  const bgColor = type === 'won' ? 'bg-green-50' : 'bg-red-50';
  const textColor = type === 'won' ? 'text-green-700' : 'text-red-700';
  const badgeVariant = type === 'won' ? 'default' : 'destructive';

  return (
    <div className={`
      flex flex-col rounded-lg p-4 border-2 border-dashed
      ${bgColor} ${textColor}
      w-32 flex-shrink-0
      h-24
    `}>
      {/* Title */}
      <h3 className="font-semibold text-sm mb-2">
        {title}
      </h3>
      
      {/* Count and Value */}
      <div className="flex flex-col space-y-1">
        <Badge variant={badgeVariant} className="text-xs w-fit">
          {count}
        </Badge>
        <span className="text-xs font-medium">
          {totalValue}
        </span>
      </div>
    </div>
  );
};

export default AggregateColumn;
