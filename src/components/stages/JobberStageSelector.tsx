
import React from 'react';
import { X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useStagesStore } from '@/store/stagesStore';

interface JobberStageSelectorProps {
  onSelect: (stageName: string, bucket: 'requests' | 'quotes') => void;
  onClose: () => void;
}

const jobberStages = [
  // Requests stages
  { name: "Unscheduled Assessment", bucket: 'requests' as const },
  { name: "Assessment Scheduled", bucket: 'requests' as const },
  { name: "Assessment Completed", bucket: 'requests' as const },
  // Quotes stages  
  { name: "Draft Quote", bucket: 'quotes' as const },
  { name: "Quote Awaiting Response", bucket: 'quotes' as const },
  { name: "Quote Changes Requested", bucket: 'quotes' as const }
];

const JobberStageSelector = ({ onSelect, onClose }: JobberStageSelectorProps) => {
  const { getUsedJobberStages } = useStagesStore();
  const usedStages = getUsedJobberStages();
  
  const availableStages = jobberStages.filter(stage => !usedStages.includes(stage.name));

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
        
        <div className="space-y-4 max-h-64 overflow-y-auto">
          {availableStages.length === 0 ? (
            <p className="text-gray-500 text-center py-4">
              All Jobber stages have been added
            </p>
          ) : (
            <>
              {/* Group stages by bucket */}
              {['requests', 'quotes'].map(bucket => {
                const bucketStages = availableStages.filter(stage => stage.bucket === bucket);
                if (bucketStages.length === 0) return null;
                
                return (
                  <div key={bucket} className="space-y-2">
                    <h4 className="text-sm font-medium text-gray-600 capitalize px-2">
                      {bucket}
                    </h4>
                    {bucketStages.map((stage) => (
                      <Button
                        key={stage.name}
                        variant="ghost"
                        className="w-full justify-start h-auto p-3 text-left"
                        onClick={() => onSelect(stage.name, stage.bucket)}
                      >
                        {stage.name}
                      </Button>
                    ))}
                  </div>
                );
              })}
            </>
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
