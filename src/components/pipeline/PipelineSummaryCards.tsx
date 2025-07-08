
import React from 'react';
import { cn } from '@/lib/utils';

interface PipelineSummaryCardsProps {
  wonCount: number;
  wonTotal: string;
  lostCount: number;
  lostTotal: string;
  onWonClick: () => void;
  onLostClick: () => void;
}

const PipelineSummaryCards = ({
  wonCount,
  wonTotal,
  lostCount,
  lostTotal,
  onWonClick,
  onLostClick
}: PipelineSummaryCardsProps) => {
  return (
    <div className="flex gap-4">
      {/* Total Won Card */}
      <div 
        className="bg-green-500 text-white px-4 py-3 rounded-lg cursor-pointer hover:bg-green-600 transition-colors flex-shrink-0"
        onClick={onWonClick}
      >
        <div className="flex items-center justify-between gap-4">
          <div>
            <div className="text-sm font-medium">Total Won</div>
            <div className="text-lg font-semibold">{wonTotal}</div>
          </div>
          <div className="bg-white/20 px-2 py-1 rounded-full text-sm font-semibold">
            {wonCount}
          </div>
        </div>
      </div>

      {/* Total Lost Card */}
      <div 
        className="bg-red-500 text-white px-4 py-3 rounded-lg cursor-pointer hover:bg-red-600 transition-colors flex-shrink-0"
        onClick={onLostClick}
      >
        <div className="flex items-center justify-between gap-4">
          <div>
            <div className="text-sm font-medium">Total Lost</div>
            <div className="text-lg font-semibold">{lostTotal}</div>
          </div>
          <div className="bg-white/20 px-2 py-1 rounded-full text-sm font-semibold">
            {lostCount}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PipelineSummaryCards;
