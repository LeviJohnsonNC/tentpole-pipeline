
import React from 'react';
import { useDroppable } from '@dnd-kit/core';
import { Archive, X, Check, ArrowRight } from 'lucide-react';

interface ActionZoneProps {
  id: string;
  type: 'archive' | 'lost' | 'won';
  onClick?: () => void;
  className?: string;
}

const ActionZone = ({ id, type, onClick, className }: ActionZoneProps) => {
  const { setNodeRef, isOver } = useDroppable({
    id,
  });

  const getZoneConfig = () => {
    switch (type) {
      case 'won':
        return {
          icon: Check,
          label: 'Won',
          bgColor: isOver ? 'bg-white' : 'bg-white',
          textColor: isOver ? 'text-black' : 'text-black',
          iconColor: isOver ? 'text-green-600' : 'text-green-600',
          borderColor: isOver ? 'border-green-300' : 'border-gray-200',
          clickable: true
        };
      case 'lost':
        return {
          icon: X,
          label: 'Lost',
          bgColor: isOver ? 'bg-white' : 'bg-white',
          textColor: isOver ? 'text-black' : 'text-black',
          iconColor: isOver ? 'text-red-600' : 'text-red-600',
          borderColor: isOver ? 'border-red-300' : 'border-gray-200',
          clickable: true
        };
      case 'archive':
        return {
          icon: Archive,
          label: 'Archive',
          bgColor: isOver ? 'bg-white' : 'bg-white',
          textColor: isOver ? 'text-gray-600' : 'text-gray-600',
          iconColor: isOver ? 'text-gray-600' : 'text-gray-600',
          borderColor: isOver ? 'border-gray-300' : 'border-gray-200',
          clickable: false
        };
    }
  };

  const config = getZoneConfig();
  const Icon = config.icon;

  const handleClick = () => {
    if (config.clickable && onClick) {
      onClick();
    }
  };

  return (
    <div
      ref={setNodeRef}
      onClick={handleClick}
      className={`
        flex items-center justify-between
        ${config.bgColor}
        border ${config.borderColor}
        rounded-lg px-4 py-3 transition-all duration-200
        ${isOver ? 'shadow-md border-2' : 'shadow-sm'}
        ${config.clickable ? 'cursor-pointer hover:shadow-md' : ''}
        min-h-[48px]
        ${className || ''}
      `}
    >
      <div className="flex items-center gap-3">
        <Icon className={`h-5 w-5 ${config.iconColor}`} />
        <span className={`font-medium text-sm ${config.textColor}`}>{config.label}</span>
      </div>
      {config.clickable && (
        <ArrowRight className={`h-4 w-4 opacity-60 ${config.textColor}`} />
      )}
    </div>
  );
};

export default ActionZone;
