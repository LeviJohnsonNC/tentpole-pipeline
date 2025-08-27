
import React from 'react';
import ActionZone from './ActionZone';

interface PersistentActionBarProps {
  onArchiveClick?: () => void;
}

const PersistentActionBar = ({ 
  onArchiveClick 
}: PersistentActionBarProps) => {
  return (
    <div className="mt-1 mb-1">
      <div className="flex gap-4">
        <ActionZone 
          id="action-archive" 
          type="archive" 
          onClick={onArchiveClick}
          className="flex-1"
        />
      </div>
    </div>
  );
};

export default PersistentActionBar;
