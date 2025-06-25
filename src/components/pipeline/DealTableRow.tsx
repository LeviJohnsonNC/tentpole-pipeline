
import React from 'react';
import { TableCell, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { FileText, Receipt } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { Deal } from './SalesPipelineData';
import { formatCurrency } from '@/utils/pipelineMetrics';

interface DealTableRowProps {
  deal: Deal;
}

const DealTableRow: React.FC<DealTableRowProps> = ({ deal }) => {
  const navigate = useNavigate();

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

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'new': return 'bg-blue-100 text-blue-800';
      case 'converted': return 'bg-green-100 text-green-800';
      case 'draft': return 'bg-gray-100 text-gray-800';
      case 'awaiting response': return 'bg-yellow-100 text-yellow-800';
      case 'closed-won': return 'bg-green-100 text-green-800';
      case 'closed-lost': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <TableRow className="hover:bg-gray-50">
      <TableCell className="font-medium">
        {deal.clientName}
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
        <Badge className={getStatusColor(deal.status)} variant="secondary">
          {deal.status}
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
