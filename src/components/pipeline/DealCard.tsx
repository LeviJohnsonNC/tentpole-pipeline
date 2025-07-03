
import React from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import * as TooltipPrimitive from '@radix-ui/react-tooltip';
import { Badge } from '@/components/ui/badge';
import { formatDateShort, formatDateTimeFull, calculateDaysInStage, calculateDaysAndHours, isOverTimeLimit } from '@/utils/dateHelpers';
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

interface DealCardProps {
  deal: Deal;
  stage?: Stage;
  isDragging?: boolean;
  onDealClick?: (dealId: string) => void;
}

const DealCard = ({
  deal,
  stage,
  isDragging,
  onDealClick
}: DealCardProps) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging: isSortableDragging,
    active
  } = useSortable({
    id: deal.id
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition: isDragging ? 'none' : transition || 'transform 150ms ease'
  };

  const isBeingDragged = isDragging || isSortableDragging;

  const formatAmount = (amount: number) => {
    return `$${amount.toLocaleString()}`;
  };

  // Calculate days in stage
  const daysInStage = calculateDaysInStage(deal.stageEnteredDate);
  const {
    days,
    hours
  } = calculateDaysAndHours(deal.stageEnteredDate);

  // Format days and hours for tooltip
  const daysHoursText = `${days} Days ${hours} Hours`;

  // Check if deal is over time limit
  const isOverLimit = stage?.timeLimitEnabled && 
    isOverTimeLimit(deal.stageEnteredDate, stage.timeLimitDays, stage.timeLimitHours);

  // Handle card click - only if not actively dragging
  const handleCardClick = (e: React.MouseEvent) => {
    // Prevent click if we're in the middle of a drag operation
    if (active && active.id === deal.id) {
      return;
    }
    
    // Prevent click if onDealClick is not provided
    if (!onDealClick) {
      return;
    }

    e.preventDefault();
    e.stopPropagation();
    onDealClick(deal.id);
  };

  return (
    <TooltipPrimitive.Provider delayDuration={300}>
      <div 
        ref={setNodeRef} 
        style={style} 
        {...attributes} 
        {...listeners} 
        onClick={handleCardClick}
        className={`
          bg-white border-2 rounded-lg p-2 shadow-sm 
          cursor-grab active:cursor-grabbing
          transition-all duration-150 ease-out
          hover:shadow-md hover:-translate-y-0.5
          ${isBeingDragged ? 'shadow-lg scale-105 rotate-1 opacity-90 z-50 ring-2 ring-blue-200' : 'shadow-sm'}
          ${isDragging ? 'pointer-events-none' : ''}
          ${isOverLimit ? 'border-red-500' : 'border-gray-200'}
          ${onDealClick && !isBeingDragged ? 'hover:cursor-pointer' : ''}
        `}
      >
        {/* Main content */}
        <div className="mb-2">
          <h4 className="font-medium text-gray-900 text-xs mb-1 truncate">
            {deal.client}
          </h4>
          <p className="text-xs text-gray-600 truncate">{deal.title}</p>
          {deal.amount && (
            <p className="text-xs text-green-600 font-medium mt-1">
              {formatAmount(deal.amount)}
            </p>
          )}
        </div>

        {/* Bottom section with date and days counter */}
        <div className="flex justify-between items-center mt-2 pt-1 border-t border-gray-100">
          {/* Date field (left) - only show tooltip when not dragging */}
          <TooltipPrimitive.Root delayDuration={300}>
            <TooltipPrimitive.Trigger asChild disabled={isBeingDragged}>
              <span className="text-xs text-gray-500 cursor-help">
                {formatDateShort(deal.createdAt)}
              </span>
            </TooltipPrimitive.Trigger>
            <TooltipPrimitive.Portal>
              <TooltipPrimitive.Content
                side="top"
                sideOffset={8}
                className="z-[9999] overflow-hidden rounded-md bg-gray-900 px-3 py-1.5 text-sm text-white shadow-md animate-in fade-in-0 zoom-in-95 data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2"
              >
                Created: {formatDateTimeFull(deal.createdAt)}
              </TooltipPrimitive.Content>
            </TooltipPrimitive.Portal>
          </TooltipPrimitive.Root>

          {/* Days in stage counter (right) - only show tooltip when not dragging */}
          <TooltipPrimitive.Root delayDuration={300}>
            <TooltipPrimitive.Trigger asChild disabled={isBeingDragged}>
              <div className="cursor-help">
                <Badge 
                  variant="secondary" 
                  className={`h-5 w-5 p-0 rounded-full flex items-center justify-center text-xs pointer-events-none ${
                    isOverLimit 
                      ? 'text-red-800 bg-red-200' 
                      : 'text-blue-800 bg-slate-200'
                  }`}
                >
                  {daysInStage}
                </Badge>
              </div>
            </TooltipPrimitive.Trigger>
            <TooltipPrimitive.Portal>
              <TooltipPrimitive.Content
                side="top"
                sideOffset={8}
                className="z-[9999] overflow-hidden rounded-md bg-gray-900 px-3 py-1.5 text-sm text-white shadow-md animate-in fade-in-0 zoom-in-95 data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2"
              >
                {daysHoursText}
                {isOverLimit && stage && (
                  <div className="mt-1 text-red-300 text-xs">
                    Over limit: {stage.timeLimitDays}d {stage.timeLimitHours}h
                  </div>
                )}
              </TooltipPrimitive.Content>
            </TooltipPrimitive.Portal>
          </TooltipPrimitive.Root>
        </div>
      </div>
    </TooltipPrimitive.Provider>
  );
};

export default DealCard;
