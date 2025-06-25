
import { Deal } from '@/components/pipeline/SalesPipelineData';

export interface PipelineMetrics {
  totalOpenLeads: number;
  conversionRate: number;
  totalPipelineValue: number;
  averageLeadAge: number;
}

export const calculatePipelineMetrics = (deals: Deal[]): PipelineMetrics => {
  const now = new Date();
  const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

  // Total Open Leads - deals in active pipeline stages (not won/lost)
  const openDeals = deals.filter(deal => 
    !deal.status.includes('won') && 
    !deal.status.includes('lost') && 
    !deal.status.includes('closed')
  );
  const totalOpenLeads = openDeals.length;

  // Conversion Rate (Last 30 Days)
  const recentDeals = deals.filter(deal => {
    const dealDate = new Date(deal.requested);
    return dealDate >= thirtyDaysAgo;
  });
  
  const wonDeals = recentDeals.filter(deal => 
    deal.status.includes('won') || deal.status.includes('converted')
  ).length;
  
  const conversionRate = recentDeals.length > 0 ? (wonDeals / recentDeals.length) * 100 : 0;

  // Total Pipeline Value - sum of deals with amounts (from quotes)
  const totalPipelineValue = openDeals.reduce((sum, deal) => {
    return sum + (deal.amount || 0);
  }, 0);

  // Average Lead Age - average days since creation for open leads
  const leadAges = openDeals.map(deal => {
    const createdDate = new Date(deal.requested);
    const diffTime = now.getTime() - createdDate.getTime();
    return Math.floor(diffTime / (1000 * 60 * 60 * 24));
  });
  
  const averageLeadAge = leadAges.length > 0 
    ? leadAges.reduce((sum, age) => sum + age, 0) / leadAges.length 
    : 0;

  return {
    totalOpenLeads,
    conversionRate: Math.round(conversionRate * 10) / 10, // Round to 1 decimal
    totalPipelineValue,
    averageLeadAge: Math.round(averageLeadAge)
  };
};

export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
};
