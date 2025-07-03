
import React from 'react';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { useDealData, DealData } from '@/hooks/useDealData';
import { Deal } from '@/components/pipeline/SalesPipelineData';
import SharedClientHeader from './SharedClientHeader';
import RequestSnapshot from './RequestSnapshot';
import QuoteSnapshot from './QuoteSnapshot';
import NextStepSection from './NextStepSection';
import LastActivitySection from './LastActivitySection';
import CTASection from './CTASection';

interface DealDetailSidebarProps {
  isOpen: boolean;
  onClose: () => void;
  selectedDealId: string | null;
  deals: Deal[];
}

const DealDetailSidebar = ({ isOpen, onClose, selectedDealId, deals }: DealDetailSidebarProps) => {
  const dealData = useDealData(selectedDealId, deals);

  if (!dealData) {
    return (
      <Sheet open={isOpen} onOpenChange={onClose}>
        <SheetContent side="right" className="w-[400px] sm:w-[540px]">
          <SheetHeader>
            <SheetTitle>Deal not found</SheetTitle>
          </SheetHeader>
        </SheetContent>
      </Sheet>
    );
  }

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent side="right" className="w-[400px] sm:w-[540px] overflow-y-auto">
        <div className="space-y-6">
          <SharedClientHeader dealData={dealData} />
          
          {dealData.dealType === 'request-and-quote' && (
            <>
              <RequestSnapshot dealData={dealData} showConvertedPill />
              <QuoteSnapshot dealData={dealData} />
            </>
          )}
          
          {dealData.dealType === 'request-only' && (
            <RequestSnapshot dealData={dealData} />
          )}
          
          {dealData.dealType === 'quote-only' && (
            <QuoteSnapshot dealData={dealData} />
          )}
          
          <NextStepSection dealData={dealData} />
          <LastActivitySection dealData={dealData} />
          <CTASection dealData={dealData} />
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default DealDetailSidebar;
