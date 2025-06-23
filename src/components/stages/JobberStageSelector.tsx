
import React from 'react';
import { X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useStagesStore } from '@/store/stagesStore';

interface JobberStageSelectorProps {
  onSelect: (stageName: string) => void;
  onClose: () => void;
}

const jobberStages = [
  "Draft Quote",
  "Quote Awaiting Response", 
  "Unscheduled Assessment",
  "Overdue Assessment",
  "Assessment Completed",
  "Quote Changes Requested"
];

const JobberStageSelector = ({ onSelect, onClose }: JobberStageSelectorProps) => {
  const { getUsedJobberStages } = useStagesStore();
  const usedStages = getUsedJobberStages();
  
  const availableStages = jobberStages.filter(stage => !usedStages.includes(stage));

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">Add Jobber Stage</h3>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="h-8 w-8 p-0"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
        
        <div className="space-y-2 max-h-64 overflow-y-auto">
          {availableStages.length === 0 ? (
            <p className="text-gray-500 text-center py-4">
              All Jobber stages have been added
            </p>
          ) : (
            availableStages.map((stage) => (
              <Button
                key={stage}
                variant="ghost"
                className="w-full justify-start h-auto p-3 text-left"
                onClick={() => onSelect(stage)}
              >
                {stage}
              </Button>
            ))
          )}
        </div>
        
        <div className="mt-4 pt-4 border-t">
          <Button
            variant="outline"
            onClick={onClose}
            className="w-full"
          >
            Cancel
          </Button>
        </div>
      </div>
    </div>
  );
};

export default JobberStageSelector;
