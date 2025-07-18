
import React from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import * as TooltipPrimitive from '@radix-ui/react-tooltip';
import { Badge } from '@/components/ui/badge';
import { formatDateShort, formatDateTimeFull, calculateDaysInStage, calculateDaysAndHours, isOverTimeLimit } from '@/utils/dateHelpers';
import { Stage } from '@/store/stagesStore';
import { useClientStore } from '@/store/clientStore';

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
  const { sessionClients } = useClientStore();
  
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

  // Get client status based on deal's client name
  const getClientStatus = (clientName: string) => {
    const client = sessionClients.find(c => c.name === clientName);
    return client?.status || 'Active'; // Default to Active if not found
  };

  const clientStatus = getClientStatus(deal.client);

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
          bg-white border rounded-lg p-3 shadow-sm 
          cursor-grab active:cursor-grabbing
          transition-all duration-150 ease-out
          hover:shadow-md hover:-translate-y-0.5
          ${isBeingDragged ? 'shadow-lg scale-105 rotate-1 opacity-90 z-50 ring-2 ring-blue-200' : 'shadow-sm'}
          ${isDragging ? 'pointer-events-none' : ''}
          ${isOverLimit ? 'border-red-500' : 'border-gray-200'}
          ${onDealClick && !isBeingDragged ? 'hover:cursor-pointer' : ''}
        `}
      >
        {/* Client name with lead badge */}
        <div className="mb-2 flex items-start justify-between">
          <div className="flex-1 min-w-0">
            <h4 className="font-medium text-gray-900 text-sm mb-1 truncate">
              {deal.client}
            </h4>
            <p className="text-sm text-gray-600 truncate leading-tight">{deal.title}</p>
          </div>
          
          {/* Lead badge - only show if client status is Lead */}
          {clientStatus === 'Lead' && (
            <TooltipPrimitive.Root delayDuration={300}>
              <TooltipPrimitive.Trigger asChild disabled={isBeingDragged}>
                <div className="cursor-help ml-2 flex-shrink-0">
                  <Badge 
                    variant="secondary" 
                    className="px-2 py-1 text-xs font-medium rounded pointer-events-none text-blue-800 bg-blue-100 border-blue-200"
                  >
                    Lead
                  </Badge>
                </div>
              </TooltipPrimitive.Trigger>
              <TooltipPrimitive.Portal>
                <TooltipPrimitive.Content
                  side="top"
                  sideOffset={8}
                  className="z-[9999] overflow-hidden rounded-md bg-gray-900 px-3 py-1.5 text-sm text-white shadow-md animate-in fade-in-0 zoom-in-95 data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2"
                >
                  Client Status: {clientStatus}
                </TooltipPrimitive.Content>
              </TooltipPrimitive.Portal>
            </TooltipPrimitive.Root>
          )}
        </div>

        {/* Amount above date/client line if present */}
        {deal.amount && (
          <div className="mb-2">
            <p className="text-sm text-green-600 font-medium">
              {formatAmount(deal.amount)}
            </p>
          </div>
        )}

        {/* Bottom section with date and days counter */}
        <div className="flex items-center space-x-2 mt-3 pt-2 border-t border-gray-100">
          {/* Date field - only show tooltip when not dragging */}
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

          {/* Days in stage counter */}
          <TooltipPrimitive.Root delayDuration={300}>
            <TooltipPrimitive.Trigger asChild disabled={isBeingDragged}>
              <div className="cursor-help">
                <div className={`
                  w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium pointer-events-none
                  ${isOverLimit 
                    ? 'text-red-800 bg-red-200' 
                    : 'text-gray-700 bg-gray-200'
                  }
                `}>
                  {daysInStage}
                </div>
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
            </TotooltipPrimitive.Portal>
          </TooltipPrimitive.Root>
        </div>
      </div>
    </TooltipPrimitive.Provider>
  );
};

export default DealCard;
