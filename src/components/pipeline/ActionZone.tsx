
import React from 'react';
import { useDroppable } from '@dnd-kit/core';
import { Archive, TrendingDown, TrendingUp } from 'lucide-react';

interface ActionZoneProps {
  id: string;
  type: 'archive' | 'lost' | 'won';
  onClick?: () => void;
}

const ActionZone = ({ id, type, onClick }: ActionZoneProps) => {
  const { setNodeRef, isOver } = useDroppable({
    id,
  });

  const getZoneConfig = () => {
    switch (type) {
      case 'archive':
        return {
          icon: Archive,
          label: 'Archive',
          bgColor: isOver ? 'bg-gray-600' : 'bg-gray-500',
          textColor: 'text-white',
          borderColor: 'border-gray-400',
          clickable: false
        };
      case 'lost':
        return {
          icon: TrendingDown,
          label: 'Lost',
          bgColor: isOver ? 'bg-red-600' : 'bg-red-500',
          textColor: 'text-white',
          borderColor: 'border-red-400',
          clickable: true
        };
      case 'won':
        return {
          icon: TrendingUp,
          label: 'Won',
          bgColor: isOver ? 'bg-green-600' : 'bg-green-500',
          textColor: 'text-white',
          borderColor: 'border-green-400',
          clickable: true
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
        flex-1 flex flex-col items-center justify-center
        ${config.bgColor} ${config.textColor}
        border-2 ${config.borderColor}
        rounded-lg p-4 transition-all duration-200
        ${isOver ? 'scale-105 shadow-lg' : 'shadow-md'}
        ${config.clickable ? 'cursor-pointer hover:opacity-90' : ''}
      `}
    >
      <Icon className="h-6 w-6 mb-2" />
      <span className="text-sm font-medium">{config.label}</span>
    </div>
  );
};

export default ActionZone;
