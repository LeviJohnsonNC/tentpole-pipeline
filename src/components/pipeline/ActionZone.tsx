import React from 'react';
import { useDroppable } from '@dnd-kit/core';
import { X, Check, ArrowRight } from 'lucide-react';
interface ActionZoneProps {
  id: string;
  type: 'lost' | 'won';
  onClick?: () => void;
  className?: string;
}
const ActionZone = ({
  id,
  type,
  onClick,
  className
}: ActionZoneProps) => {
  const {
    setNodeRef,
    isOver
  } = useDroppable({
    id
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
        p-4 rounded-lg border-2 transition-all duration-200
        ${config.bgColor} ${config.textColor} ${config.borderColor}
        ${config.clickable ? 'cursor-pointer hover:shadow-md' : 'cursor-default'}
        ${className || ''}
      `}
    >
      <div className="flex items-center justify-center space-x-2">
        <Icon className={`w-5 h-5 ${config.iconColor}`} />
        <span className="font-medium">{config.label}</span>
      </div>
    </div>
  );
};
export default ActionZone;