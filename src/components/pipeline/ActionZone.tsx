import React from 'react';
import { useDroppable } from '@dnd-kit/core';
import { Archive, X, Check, ArrowRight } from 'lucide-react';
interface ActionZoneProps {
  id: string;
  type: 'archive' | 'lost' | 'won';
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
  return;
};
export default ActionZone;