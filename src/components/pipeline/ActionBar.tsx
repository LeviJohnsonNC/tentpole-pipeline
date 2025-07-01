
import React from 'react';
import ActionZone from './ActionZone';

interface ActionBarProps {
  isVisible: boolean;
}

const ActionBar = ({ isVisible }: ActionBarProps) => {
  return (
    <div 
      className={`
        fixed bottom-0 left-0 right-0 z-50
        bg-white border-t border-gray-200 shadow-lg
        transition-transform duration-300 ease-out
        ${isVisible ? 'translate-y-0' : 'translate-y-full'}
      `}
    >
      <div className="p-4 max-w-7xl mx-auto">
        <div className="flex space-x-4">
          <ActionZone id="action-archive" type="archive" />
          <ActionZone id="action-lost" type="lost" />
          <ActionZone id="action-won" type="won" />
        </div>
      </div>
    </div>
  );
};

export default ActionBar;
