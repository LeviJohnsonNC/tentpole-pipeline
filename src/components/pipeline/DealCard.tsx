import React from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Badge } from '@/components/ui/badge';
import { formatDateShort, formatDateTimeFull, calculateDaysInStage, calculateDaysAndHours } from '@/utils/dateHelpers';
interface Deal {
  id: string;
  client: string;
  title: string;
  property: string;
  contact: string;
  requested: string;
  amount?: number; // Made optional
  status: string;
  createdAt: string;
  stageEnteredDate: string;
}
interface DealCardProps {
  deal: Deal;
  isDragging?: boolean;
}
const DealCard = ({
  deal,
  isDragging
}: DealCardProps) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging: isSortableDragging
  } = useSortable({
    id: deal.id
  });
  const style = {
    transform: CSS.Transform.toString(transform),
    transition: isDragging ? 'none' : transition || 'transform 150ms ease'
  };
  const isBeingDragged = isDragging || isSortableDragging;
  const formatAmount = (amount: number) => {
    return `$ ${amount.toLocaleString()}.00`;
  };

  // Calculate days in stage
  const daysInStage = calculateDaysInStage(deal.stageEnteredDate);
  const {
    days,
    hours
  } = calculateDaysAndHours(deal.stageEnteredDate);
  return <TooltipProvider>
      <div ref={setNodeRef} style={style} {...attributes} {...listeners} className={`
          bg-white border border-gray-200 rounded-lg p-2 shadow-sm 
          cursor-grab active:cursor-grabbing
          transition-all duration-150 ease-out
          hover:shadow-md hover:-translate-y-0.5
          ${isBeingDragged ? 'shadow-lg scale-105 rotate-1 opacity-90 z-50 ring-2 ring-blue-200' : 'shadow-sm'}
          ${isDragging ? 'pointer-events-none' : ''}
        `}>
        {/* Main content */}
        <div className="mb-2">
          <h4 className="font-medium text-gray-900 text-xs mb-1 truncate">
            {deal.client}
          </h4>
          <p className="text-xs text-gray-600 truncate">{deal.title}</p>
          {deal.amount && <p className="text-xs text-green-600 font-medium mt-1">
              {formatAmount(deal.amount)}
            </p>}
        </div>

        {/* Bottom section with date and days counter */}
        <div className="flex justify-between items-center mt-2 pt-1 border-t border-gray-100">
          {/* Date field (left) */}
          <Tooltip>
            <TooltipTrigger asChild>
              <span className="text-xs text-gray-500 cursor-help">
                {formatDateShort(deal.createdAt)}
              </span>
            </TooltipTrigger>
            <TooltipContent>
              <p>Created: {formatDateTimeFull(deal.createdAt)}</p>
            </TooltipContent>
          </Tooltip>

          {/* Days in stage counter (right) */}
          <Tooltip>
            <TooltipTrigger asChild>
              <Badge variant="secondary" className="h-5 w-5 p-0 rounded-full flex items-center justify-center text-xs text-blue-800 cursor-help bg-slate-200">
                {daysInStage}
              </Badge>
            </TooltipTrigger>
            <TooltipContent>
              <p>In stage: {days} day{days !== 1 ? 's' : ''}, {hours} hour{hours !== 1 ? 's' : ''}</p>
            </TooltipContent>
          </Tooltip>
        </div>
      </div>
    </TooltipProvider>;
};
export default DealCard;