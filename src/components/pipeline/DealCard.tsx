
import React from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

interface Deal {
  id: number;
  client: string;
  title: string;
  property: string;
  contact: string;
  requested: string;
  amount: number;
  status: string;
}

interface DealCardProps {
  deal: Deal;
  isDragging?: boolean;
}

const DealCard = ({ deal, isDragging }: DealCardProps) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging: isSortableDragging,
  } = useSortable({ id: deal.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition: transition || 'transform 150ms ease',
  };

  const isBeingDragged = isDragging || isSortableDragging;

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className={`
        bg-white border border-gray-200 rounded-lg p-3 shadow-sm 
        cursor-grab active:cursor-grabbing
        transition-all duration-150 ease-out
        hover:shadow-md hover:-translate-y-0.5
        ${isBeingDragged ? 
          'shadow-lg scale-105 rotate-2 opacity-90 z-50' : 
          'shadow-sm'
        }
      `}
    >
      <h4 className="font-medium text-gray-900 text-sm mb-1 truncate">
        {deal.client}
      </h4>
      <p className="text-sm text-gray-600 truncate">{deal.title}</p>
    </div>
  );
};

export default DealCard;
