
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { DealData } from '@/hooks/useDealData';
import { formatDateTimeFull } from '@/utils/dateHelpers';

interface QuoteSnapshotProps {
  dealData: DealData;
}

const QuoteSnapshot = ({ dealData }: QuoteSnapshotProps) => {
  const { quote } = dealData;

  if (!quote) return null;

  const formatAmount = (amount: number) => {
    return `$${amount.toLocaleString()}`;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Draft':
        return 'secondary';
      case 'Awaiting Response':
        return 'default';
      case 'Changes Requested':
        return 'outline';
      case 'Approved':
        return 'default';
      case 'Converted':
        return 'default';
      default:
        return 'secondary';
    }
  };

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-medium">Quote Details</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-sm font-medium text-gray-900">Quote #{quote.quoteNumber}</div>
            <div className="text-lg font-semibold text-green-600">{formatAmount(quote.amount)}</div>
          </div>
          <Badge variant={getStatusColor(quote.status)} className="text-xs">
            {quote.status}
          </Badge>
        </div>

        <div className="text-xs text-gray-500">
          Created {formatDateTimeFull(quote.createdDate)}
        </div>

        {quote.sentDate && (
          <div className="text-xs text-gray-500">
            Sent {formatDateTimeFull(quote.sentDate)}
          </div>
        )}

        {quote.approvedDate && (
          <div className="text-xs text-green-600">
            Approved {formatDateTimeFull(quote.approvedDate)}
          </div>
        )}

        {quote.validUntil && (
          <div>
            <div className="text-xs font-medium text-gray-700 mb-1">Valid Until</div>
            <div className="text-xs text-gray-600">{formatDateTimeFull(quote.validUntil).split(' at ')[0]}</div>
          </div>
        )}

        {quote.salesperson && (
          <div>
            <div className="text-xs font-medium text-gray-700 mb-1">Salesperson</div>
            <div className="text-xs text-gray-600">{quote.salesperson}</div>
          </div>
        )}

        {quote.notes && (
          <div>
            <div className="text-xs font-medium text-gray-700 mb-1">Notes</div>
            <div className="text-xs text-gray-600">{quote.notes}</div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default QuoteSnapshot;
