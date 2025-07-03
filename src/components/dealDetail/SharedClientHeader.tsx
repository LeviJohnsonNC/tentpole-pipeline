
import React from 'react';
import { Phone, Mail, MessageSquare, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { DealData } from '@/hooks/useDealData';
import { calculateDaysInStage, isOverTimeLimit } from '@/utils/dateHelpers';
import { useStagesStore } from '@/store/stagesStore';

interface SharedClientHeaderProps {
  dealData: DealData;
}

const SharedClientHeader = ({ dealData }: SharedClientHeaderProps) => {
  const { stages } = useStagesStore();
  const { client, deal } = dealData;

  // Find the current stage for time limit checking
  const currentStage = stages.find(s => s.id === deal.status);
  const daysInStage = calculateDaysInStage(deal.stageEnteredDate);
  const isOverdue = currentStage?.timeLimitEnabled && 
    isOverTimeLimit(deal.stageEnteredDate, currentStage.timeLimitDays, currentStage.timeLimitHours);

  const handleContact = (method: 'phone' | 'email' | 'sms') => {
    if (!client) return;
    
    switch (method) {
      case 'phone':
        if (client.phone) {
          window.open(`tel:${client.phone}`);
        }
        break;
      case 'email':
        if (client.email) {
          window.open(`mailto:${client.email}`);
        }
        break;
      case 'sms':
        if (client.phone) {
          window.open(`sms:${client.phone}`);
        }
        break;
    }
  };

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-xl font-semibold text-gray-900">{deal.client}</h2>
        <p className="text-sm text-gray-600">{deal.property}</p>
      </div>

      {/* Contact buttons */}
      <div className="flex space-x-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => handleContact('phone')}
          disabled={!client?.phone}
          className="flex items-center gap-1"
        >
          <Phone className="h-3 w-3" />
          Phone
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => handleContact('email')}
          disabled={!client?.email}
          className="flex items-center gap-1"
        >
          <Mail className="h-3 w-3" />
          Email
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => handleContact('sms')}
          disabled={!client?.phone}
          className="flex items-center gap-1"
        >
          <MessageSquare className="h-3 w-3" />
          SMS
        </Button>
      </div>

      {/* Current stage and status */}
      <div className="flex items-center gap-2">
        <Badge 
          variant={isOverdue ? "destructive" : "secondary"}
          className="capitalize"
        >
          {deal.status.replace(/-/g, ' ')}
        </Badge>
        {isOverdue && (
          <div className="flex items-center gap-1 text-red-600">
            <Clock className="h-3 w-3" />
            <span className="text-xs">Overdue ({daysInStage} days)</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default SharedClientHeader;
