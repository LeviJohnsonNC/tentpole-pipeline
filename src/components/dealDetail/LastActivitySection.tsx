
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { DealData } from '@/hooks/useDealData';
import { formatDistanceToNow } from 'date-fns';

interface LastActivitySectionProps {
  dealData: DealData;
}

const LastActivitySection = ({ dealData }: LastActivitySectionProps) => {
  const { request, quote, dealType } = dealData;

  const getLastActivity = () => {
    const activities = [];

    if (request) {
      activities.push({
        text: 'Request received',
        date: new Date(request.requestDate),
        type: 'request'
      });
    }

    if (quote) {
      activities.push({
        text: 'Quote created',
        date: new Date(quote.createdDate),
        type: 'quote'
      });

      if (quote.sentDate) {
        activities.push({
          text: 'Quote sent',
          date: new Date(quote.sentDate),
          type: 'quote'
        });
      }

      if (quote.approvedDate) {
        activities.push({
          text: 'Quote approved',
          date: new Date(quote.approvedDate),
          type: 'quote'
        });
      }
    }

    // Sort by date, most recent first
    activities.sort((a, b) => b.date.getTime() - a.date.getTime());
    return activities[0];
  };

  const lastActivity = getLastActivity();

  if (!lastActivity) {
    return (
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium">Last Activity</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-xs text-gray-400 italic">No activity recorded</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-medium">Last Activity</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="text-sm text-gray-900">{lastActivity.text}</div>
        <div className="text-xs text-gray-500">
          {formatDistanceToNow(lastActivity.date, { addSuffix: true })}
        </div>
      </CardContent>
    </Card>
  );
};

export default LastActivitySection;
