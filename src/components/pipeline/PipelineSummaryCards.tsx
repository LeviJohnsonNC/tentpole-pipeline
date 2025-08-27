
import React from 'react';
import { cn } from '@/lib/utils';
import { Check, X } from 'lucide-react';

interface PipelineSummaryCardsProps {
  wonCount: number;
  lostCount: number;
  onWonClick: () => void;
  onLostClick: () => void;
}

const PipelineSummaryCards = ({
  wonCount,
  lostCount,
  onWonClick,
  onLostClick
}: PipelineSummaryCardsProps) => {
  return (
    <div className="flex gap-4">
      {/* Won Card */}
      <div 
        className="bg-white border border-gray-200 px-4 py-3 rounded-lg cursor-pointer hover:shadow-md transition-all flex-shrink-0 shadow-sm"
        onClick={onWonClick}
      >
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
              <Check className="w-4 h-4 text-green-600" />
            </div>
            <div>
              <div className="text-sm font-medium text-gray-900">Won</div>
              <div className="text-xs text-gray-500">Past 30 days</div>
            </div>
          </div>
          <div className="bg-gray-100 px-2 py-1 rounded-full text-sm font-semibold text-gray-700">
            {wonCount}
          </div>
        </div>
      </div>

      {/* Lost Card */}
      <div 
        className="bg-white border border-gray-200 px-4 py-3 rounded-lg cursor-pointer hover:shadow-md transition-all flex-shrink-0 shadow-sm"
        onClick={onLostClick}
      >
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center">
              <X className="w-4 h-4 text-red-600" />
            </div>
            <div>
              <div className="text-sm font-medium text-gray-900">Lost</div>
              <div className="text-xs text-gray-500">Past 30 days</div>
            </div>
          </div>
          <div className="bg-gray-100 px-2 py-1 rounded-full text-sm font-semibold text-gray-700">
            {lostCount}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PipelineSummaryCards;
