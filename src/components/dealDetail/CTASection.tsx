
import React from 'react';
import { Button } from '@/components/ui/button';
import { FileText, Send, CheckCircle, Calendar, Copy } from 'lucide-react';
import { DealData } from '@/hooks/useDealData';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

interface CTASectionProps {
  dealData: DealData;
}

const CTASection = ({ dealData }: CTASectionProps) => {
  const navigate = useNavigate();
  const { dealType, request, quote } = dealData;

  const handleCreateQuote = () => {
    if (request) {
      navigate(`/quotes/new?requestId=${request.id}`);
    }
  };

  const handleResendQuote = () => {
    // TODO: Implement resend functionality
    toast.success('Quote resent successfully');
  };

  const handleCopyQuoteLink = () => {
    // TODO: Generate and copy quote link
    navigator.clipboard.writeText(`https://example.com/quote/${quote?.id}`);
    toast.success('Quote link copied to clipboard');
  };

  const handleConvertToJob = () => {
    // TODO: Implement job conversion
    toast.success('Converting to job...');
  };

  const handleScheduleJob = () => {
    // TODO: Implement job scheduling
    toast.success('Opening job scheduler...');
  };

  const handleSendReminder = () => {
    // TODO: Implement reminder functionality
    toast.success('Reminder sent successfully');
  };

  if (dealType === 'request-only') {
    return (
      <div className="space-y-2">
        <Button onClick={handleCreateQuote} className="w-full">
          <FileText className="h-4 w-4 mr-2" />
          Create Quote
        </Button>
      </div>
    );
  }

  if (dealType === 'quote-only') {
    return (
      <div className="space-y-2">
        <div className="flex gap-2">
          <Button onClick={handleResendQuote} variant="outline" className="flex-1">
            <Send className="h-4 w-4 mr-2" />
            Resend
          </Button>
          <Button onClick={handleCopyQuoteLink} variant="outline" className="flex-1">
            <Copy className="h-4 w-4 mr-2" />
            Copy Link
          </Button>
        </div>
        
        {quote?.status === 'Approved' && (
          <Button onClick={handleConvertToJob} className="w-full">
            <CheckCircle className="h-4 w-4 mr-2" />
            Convert to Job
          </Button>
        )}
      </div>
    );
  }

  if (dealType === 'request-and-quote') {
    return (
      <div className="space-y-2">
        {quote?.status === 'Approved' ? (
          <Button onClick={handleScheduleJob} className="w-full">
            <Calendar className="h-4 w-4 mr-2" />
            Schedule Job
          </Button>
        ) : (
          <Button onClick={handleSendReminder} className="w-full">
            <Send className="h-4 w-4 mr-2" />
            Send Reminder
          </Button>
        )}
        
        <div className="flex gap-2">
          <Button onClick={handleResendQuote} variant="outline" className="flex-1">
            <Send className="h-4 w-4 mr-2" />
            Resend Quote
          </Button>
          <Button onClick={handleCopyQuoteLink} variant="outline" className="flex-1">
            <Copy className="h-4 w-4 mr-2" />
            Copy Link
          </Button>
        </div>
      </div>
    );
  }

  return null;
};

export default CTASection;
