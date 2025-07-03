import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { DealData } from '@/hooks/useDealData';
import { formatDateTimeFull } from '@/utils/dateHelpers';
interface RequestSnapshotProps {
  dealData: DealData;
  showConvertedPill?: boolean;
}
const RequestSnapshot = ({
  dealData,
  showConvertedPill = false
}: RequestSnapshotProps) => {
  const {
    request,
    quote
  } = dealData;
  if (!request) return null;
  return <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-medium">Request Details</CardTitle>
          {showConvertedPill && quote && <Badge variant="outline" className="text-xs">
              Converted to Quote on {formatDateTimeFull(quote.createdDate).split(' at ')[0]}
            </Badge>}
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <div>
          <div className="text-sm font-medium text-gray-900">{request.title}</div>
          <div className="text-xs text-gray-500">
            Submitted {formatDateTimeFull(request.requestDate)}
          </div>
        </div>

        {request.serviceDetails && <div>
            <div className="text-xs font-medium text-gray-700 mb-1">Service Details</div>
            <div className="text-xs text-gray-600">{request.serviceDetails}</div>
          </div>}

        {request.urgency}

        {request.preferredTime && <div>
            <div className="text-xs font-medium text-gray-700 mb-1">Preferred Time</div>
            <div className="text-xs text-gray-600">{request.preferredTime}</div>
          </div>}

        {request.notes && <div>
            <div className="text-xs font-medium text-gray-700 mb-1">Notes</div>
            <div className="text-xs text-gray-600">{request.notes}</div>
          </div>}
      </CardContent>
    </Card>;
};
export default RequestSnapshot;