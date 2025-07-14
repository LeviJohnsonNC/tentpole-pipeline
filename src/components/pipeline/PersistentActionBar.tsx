
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
    <div className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-gray-200 shadow-lg">
      <div className="p-4 max-w-7xl mx-auto">
        <div className="flex space-x-4">
          <ActionZone 
            id="action-archive" 
            type="archive" 
            onClick={onArchiveClick}
          />
          <ActionZone 
            id="action-lost" 
            type="lost" 
            onClick={onLostClick}
          />
          <ActionZone 
            id="action-won" 
            type="won" 
            onClick={onWonClick}
          />
        </div>
      </div>
    </div>
  );
};

export default PersistentActionBar;
