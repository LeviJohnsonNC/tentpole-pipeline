
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
    <div className="mt-6 mb-4">
      <div className="flex gap-3 max-w-4xl mx-auto">
        <ActionZone 
          id="action-won" 
          type="won" 
          onClick={onWonClick}
        />
        <ActionZone 
          id="action-lost" 
          type="lost" 
          onClick={onLostClick}
        />
        <ActionZone 
          id="action-archive" 
          type="archive" 
          onClick={onArchiveClick}
        />
      </div>
    </div>
  );
};

export default PersistentActionBar;
