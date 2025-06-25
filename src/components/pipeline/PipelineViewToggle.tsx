
import React from 'react';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import { Kanban, List } from 'lucide-react';

interface PipelineViewToggleProps {
  view: 'kanban' | 'list';
  onViewChange: (view: 'kanban' | 'list') => void;
}

const PipelineViewToggle: React.FC<PipelineViewToggleProps> = ({
  view,
  onViewChange
}) => {
  return (
    <ToggleGroup
      type="single"
      value={view}
      onValueChange={(value) => {
        if (value) onViewChange(value as 'kanban' | 'list');
      }}
      className="border border-gray-200 rounded-lg"
    >
      <ToggleGroupItem 
        value="kanban" 
        aria-label="Kanban view"
        className="px-3 py-2 text-sm"
      >
        <Kanban className="h-4 w-4 mr-2" />
        Pipeline
      </ToggleGroupItem>
      <ToggleGroupItem 
        value="list" 
        aria-label="List view"
        className="px-3 py-2 text-sm"
      >
        <List className="h-4 w-4 mr-2" />
        List
      </ToggleGroupItem>
    </ToggleGroup>
  );
};

export default PipelineViewToggle;
