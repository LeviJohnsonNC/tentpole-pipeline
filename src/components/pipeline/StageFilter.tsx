
import React from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useStagesStore } from '@/store/stagesStore';

interface StageFilterProps {
  selectedStage: string;
  onStageChange: (stage: string) => void;
  resultsCount: number;
}

const StageFilter: React.FC<StageFilterProps> = ({ selectedStage, onStageChange, resultsCount }) => {
  const { stages } = useStagesStore();

  return (
    <div className="flex items-center gap-2">
      <span className="text-sm text-gray-600 font-medium">Stage</span>
      <Select value={selectedStage} onValueChange={onStageChange}>
        <SelectTrigger className="w-[180px]">
          <SelectValue placeholder="All stages" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All</SelectItem>
          {stages
            .sort((a, b) => a.order - b.order)
            .map((stage) => (
              <SelectItem key={stage.id} value={stage.id}>
                {stage.title}
              </SelectItem>
            ))}
          <SelectItem value="closed-won">Closed Won</SelectItem>
          <SelectItem value="closed-lost">Closed Lost</SelectItem>
        </SelectContent>
      </Select>
      <span className="text-sm text-gray-400">({resultsCount} results)</span>
    </div>
  );
};

export default StageFilter;
