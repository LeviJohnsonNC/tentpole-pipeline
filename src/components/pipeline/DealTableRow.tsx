
import React from 'react';
import { TableCell, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { FileText, Receipt } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { Deal } from './SalesPipelineData';
import { formatCurrency } from '@/utils/pipelineMetrics';
import { useStagesStore } from '@/store/stagesStore';

interface DealTableRowProps {
  deal: Deal;
}

const DealTableRow: React.FC<DealTableRowProps> = ({ deal }) => {
  const navigate = useNavigate();
  const { stages } = useStagesStore();

  const handleRequestClick = () => {
    if (deal.type === 'request') {
      navigate(`/requests/${deal.id}`);
    }
  };

  const handleQuoteClick = () => {
    if (deal.quoteId) {
      navigate(`/quotes/${deal.quoteId}`);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const getStageDisplayInfo = (status: string) => {
    // First try to find by exact title match
    let stage = stages.find(s => s.title.toLowerCase() === status.toLowerCase());
    
    // If not found, try to find by ID (for cases like 'draft-quote' -> 'Draft Quote')
    if (!stage) {
      stage = stages.find(s => s.id === status || s.id === status.toLowerCase().replace(/\s+/g, '-'));
    }
    
    // If still not found, try matching status variations
    if (!stage) {
      const statusLower = status.toLowerCase();
      stage = stages.find(s => {
        const titleLower = s.title.toLowerCase();
        return titleLower.includes(statusLower) || statusLower.includes(titleLower);
      });
    }
    
    const displayTitle = stage ? stage.title : status;
    
    // Color mapping based on stage types and existing patterns from quotes and requests
    const getColor = (title: string) => {
      const titleLower = title.toLowerCase();
      
      // New/Lead stages - blue
      if (titleLower.includes('new') || titleLower.includes('lead')) {
        return 'bg-blue-100 text-blue-800';
      }
      
      // Draft stages - gray
      if (titleLower.includes('draft')) {
        return 'bg-gray-100 text-gray-800';
      }
      
      // Awaiting/Response stages - yellow
      if (titleLower.includes('awaiting') || titleLower.includes('response')) {
        return 'bg-yellow-100 text-yellow-800';
      }
      
      // Contact/Follow-up stages - purple
      if (titleLower.includes('contact') || titleLower.includes('followup') || titleLower.includes('follow-up')) {
        return 'bg-purple-100 text-purple-800';
      }
      
      // Converted/Won stages - green
      if (titleLower.includes('converted') || titleLower.includes('won') || titleLower.includes('approved')) {
        return 'bg-green-100 text-green-800';
      }
      
      // Lost/Closed stages - red
      if (titleLower.includes('lost') || titleLower.includes('archived')) {
        return 'bg-red-100 text-red-800';
      }
      
      // Assessment/Complete stages - emerald
      if (titleLower.includes('assessment') || titleLower.includes('complete')) {
        return 'bg-emerald-100 text-emerald-800';
      }
      
      // Overdue - red
      if (titleLower.includes('overdue')) {
        return 'bg-red-100 text-red-800';
      }
      
      // Unscheduled - yellow
      if (titleLower.includes('unscheduled')) {
        return 'bg-yellow-100 text-yellow-800';
      }
      
      // Default - gray
      return 'bg-gray-100 text-gray-800';
    };
    
    return {
      title: displayTitle,
      color: getColor(displayTitle)
    };
  };

  const stageInfo = getStageDisplayInfo(deal.status);

  return (
    <TableRow className="hover:bg-gray-50">
      <TableCell className="font-medium">
        <div className="max-w-xs truncate" title={deal.title}>
          {deal.title}
        </div>
      </TableCell>
      <TableCell className="font-medium">
        {deal.client}
      </TableCell>
      <TableCell>
        <div className="flex items-center gap-2">
          {deal.type === 'request' && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleRequestClick}
              className="h-8 w-8 p-0 hover:bg-blue-100"
            >
              <FileText className="h-4 w-4 text-blue-600" />
            </Button>
          )}
          {deal.quoteId && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleQuoteClick}
              className="h-8 w-8 p-0 hover:bg-green-100"
            >
              <Receipt className="h-4 w-4 text-green-600" />
            </Button>
          )}
        </div>
      </TableCell>
      <TableCell>
        <div className="max-w-xs truncate" title={deal.property}>
          {deal.property}
        </div>
      </TableCell>
      <TableCell>
        <Badge className={`${stageInfo.color} border-0`} variant="secondary">
          {stageInfo.title}
        </Badge>
      </TableCell>
      <TableCell className="text-right">
        {deal.amount ? formatCurrency(deal.amount) : '-'}
      </TableCell>
      <TableCell className="text-right">
        {formatDate(deal.requested)}
      </TableCell>
    </TableRow>
  );
};

export default DealTableRow;
