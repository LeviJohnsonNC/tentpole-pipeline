import React from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Plus } from 'lucide-react';
import { Salesperson } from '@/store/salespersonStore';

interface SalespersonAvatarProps {
  salesperson?: Salesperson;
  onClick: () => void;
  size?: 'sm' | 'md';
  className?: string;
}

const SalespersonAvatar = ({ 
  salesperson, 
  onClick, 
  size = 'sm',
  className = '' 
}: SalespersonAvatarProps) => {
  const sizeClasses = {
    sm: 'h-6 w-6',
    md: 'h-8 w-8'
  };

  if (!salesperson) {
    // Show plus icon when no salesperson assigned
    return (
      <button
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          onClick();
        }}
        className={`
          ${sizeClasses[size]} 
          rounded-full border-2 border-dashed border-muted-foreground/30 
          bg-muted/30 hover:bg-muted/50 transition-colors 
          flex items-center justify-center group
          ${className}
        `}
      >
        <Plus className="h-3 w-3 text-muted-foreground group-hover:text-foreground transition-colors" />
      </button>
    );
  }

  return (
    <button
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        onClick();
      }}
      className={`${className} transition-transform hover:scale-110`}
    >
      <Avatar className={`${sizeClasses[size]} border-2 border-background shadow-sm`}>
        {salesperson.avatarUrl && (
          <AvatarImage src={salesperson.avatarUrl} alt={salesperson.name} />
        )}
        <AvatarFallback 
          style={{ backgroundColor: salesperson.color, color: 'white' }}
          className="text-xs font-medium"
        >
          {salesperson.initials}
        </AvatarFallback>
      </Avatar>
    </button>
  );
};

export default SalespersonAvatar;