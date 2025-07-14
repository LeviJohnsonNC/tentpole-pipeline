
import React from 'react';
import ActionZone from './ActionZone';

interface PersistentActionBarProps {
  onWonClick?: () => void;
  onLostClick?: () => void;
  onArchiveClick?: () => void;
}

const PersistentActionBar = ({ 
  onWonClick, 
  onLostClick, 
  onArchiveClick 
}: PersistentActionBarProps) => {
  return (
    <div className="mt-1 mb-1">
      <div className="flex gap-4">
        <ActionZone 
          id="action-won" 
          type="won" 
          onClick={onWonClick}
          className="flex-[2]"
        />
        <ActionZone 
          id="action-lost" 
          type="lost" 
          onClick={onLostClick}
          className="flex-[2]"
        />
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
