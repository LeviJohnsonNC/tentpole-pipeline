
import React from 'react';
import { useDroppable } from '@dnd-kit/core';
import { Trash2, TrendingDown, TrendingUp } from 'lucide-react';

interface ActionZoneProps {
  id: string;
  type: 'delete' | 'lost' | 'won';
}

const ActionZone = ({ id, type }: ActionZoneProps) => {
  const { setNodeRef, isOver } = useDroppable({
    id,
  });

  const getZoneConfig = () => {
    switch (type) {
      case 'delete':
        return {
          icon: Trash2,
          label: 'Delete',
          bgColor: isOver ? 'bg-gray-600' : 'bg-gray-500',
          textColor: 'text-white',
          borderColor: 'border-gray-400'
        };
      case 'lost':
        return {
          icon: TrendingDown,
          label: 'Lost',
          bgColor: isOver ? 'bg-red-600' : 'bg-red-500',
          textColor: 'text-white',
          borderColor: 'border-red-400'
        };
      case 'won':
        return {
          icon: TrendingUp,
          label: 'Won',
          bgColor: isOver ? 'bg-green-600' : 'bg-green-500',
          textColor: 'text-white',
          borderColor: 'border-green-400'
        };
    }
  };

  const config = getZoneConfig();
  const Icon = config.icon;

  return (
    <div
      ref={setNodeRef}
      className={`
        flex-1 flex flex-col items-center justify-center
        ${config.bgColor} ${config.textColor}
        border-2 ${config.borderColor}
        rounded-lg p-4 transition-all duration-200
        ${isOver ? 'scale-105 shadow-lg' : 'shadow-md'}
      `}
    >
      <Icon className="h-6 w-6 mb-2" />
      <span className="text-sm font-medium">{config.label}</span>
    </div>
  );
};

export default ActionZone;
