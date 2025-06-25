
import React, { useMemo } from 'react';
import { 
  Sheet, 
  SheetContent, 
  SheetHeader, 
  SheetTitle 
} from '@/components/ui/sheet';
import { Users, TrendingUp, DollarSign, Clock } from 'lucide-react';
import InsightMetricCard from './InsightMetricCard';
import { Deal } from '@/components/pipeline/SalesPipelineData';
import { calculatePipelineMetrics, formatCurrency } from '@/utils/pipelineMetrics';

interface PipelineInsightsProps {
  isOpen: boolean;
  onClose: () => void;
  deals: Deal[];
}

const PipelineInsights: React.FC<PipelineInsightsProps> = ({
  isOpen,
  onClose,
  deals
}) => {
  const metrics = useMemo(() => {
    return calculatePipelineMetrics(deals);
  }, [deals]);

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent className="w-[400px] sm:w-[540px]">
        <SheetHeader className="pb-6">
          <SheetTitle className="text-xl font-semibold">Pipeline Insights</SheetTitle>
        </SheetHeader>
        
        <div className="space-y-4">
          <InsightMetricCard
            title="Total Open Leads"
            value={metrics.totalOpenLeads}
            subtitle="Leads in active pipeline stages"
            icon={Users}
          />
          
          <InsightMetricCard
            title="Conversion Rate"
            value={`${metrics.conversionRate}%`}
            subtitle="Last 30 days win rate"
            icon={TrendingUp}
          />
          
          <InsightMetricCard
            title="Total Pipeline Value"
            value={formatCurrency(metrics.totalPipelineValue)}
            subtitle="Value of deals with quotes"
            icon={DollarSign}
          />
          
          <InsightMetricCard
            title="Average Lead Age"
            value={`${metrics.averageLeadAge} days`}
            subtitle="Average age of open leads"
            icon={Clock}
          />
        </div>
        
        <div className="mt-8 p-4 bg-gray-50 rounded-lg">
          <h4 className="font-medium text-gray-900 mb-2">Quick Actions</h4>
          <ul className="text-sm text-gray-600 space-y-1">
            <li>• High open leads? Focus on outreach and follow-ups</li>
            <li>• Low conversion rate? Review pricing and processes</li>
            <li>• High pipeline value? Prioritize closing deals</li>
            <li>• Old leads? Send reminders and touch base</li>
          </ul>
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default PipelineInsights;
