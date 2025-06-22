
import { Card, CardContent } from "@/components/ui/card";
import { Quote } from "@/types/Quote";
import { calculateQuoteMetrics } from "@/utils/dataHelpers";
import { ChevronRight, HelpCircle } from "lucide-react";

interface QuotesOverviewCardsProps {
  quotes: Quote[];
  onStatusFilter?: (status: string | null) => void;
  activeFilter?: string | null;
}

const QuotesOverviewCards = ({ quotes, onStatusFilter, activeFilter }: QuotesOverviewCardsProps) => {
  const metrics = calculateQuoteMetrics(quotes);
  
  // Calculate additional metrics needed for the new design
  const changesRequested = quotes.filter(q => q.status === 'Changes Requested').length;
  const sentValue = quotes
    .filter(q => q.sentDate)
    .reduce((sum, q) => sum + q.amount, 0);
  const convertedValue = quotes
    .filter(q => q.status === 'Converted')
    .reduce((sum, q) => sum + q.amount, 0);

  const handleStatusClick = (status: string) => {
    if (onStatusFilter) {
      // If clicking the same status, clear the filter
      onStatusFilter(activeFilter === status ? null : status);
    }
  };

  return (
    <div className="mb-6">
      {/* Single row with Overview card on the left and other cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        {/* Overview Card */}
        <Card className="bg-white border border-gray-200">
          <CardContent className="p-4">
            <h3 className="text-sm font-medium text-gray-600 mb-3">Overview</h3>
            <div className="space-y-2">
              <div 
                className={`flex items-center justify-between cursor-pointer hover:bg-gray-50 p-1 rounded ${
                  activeFilter === 'Draft' ? 'bg-blue-50' : ''
                }`}
                onClick={() => handleStatusClick('Draft')}
              >
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-gray-600 rounded-full"></div>
                  <span className="text-sm text-gray-600">Draft ({metrics.draft})</span>
                </div>
              </div>
              <div 
                className={`flex items-center justify-between cursor-pointer hover:bg-gray-50 p-1 rounded ${
                  activeFilter === 'Awaiting Response' ? 'bg-blue-50' : ''
                }`}
                onClick={() => handleStatusClick('Awaiting Response')}
              >
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                  <span className="text-sm text-gray-600">Awaiting Response ({metrics.awaitingResponse})</span>
                </div>
              </div>
              <div 
                className={`flex items-center justify-between cursor-pointer hover:bg-gray-50 p-1 rounded ${
                  activeFilter === 'Changes Requested' ? 'bg-blue-50' : ''
                }`}
                onClick={() => handleStatusClick('Changes Requested')}
              >
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                  <span className="text-sm text-gray-600">Changes Requested ({changesRequested})</span>
                </div>
              </div>
              <div 
                className={`flex items-center justify-between cursor-pointer hover:bg-gray-50 p-1 rounded ${
                  activeFilter === 'Approved' ? 'bg-blue-50' : ''
                }`}
                onClick={() => handleStatusClick('Approved')}
              >
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span className="text-sm text-gray-600">Approved ({metrics.approved})</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Conversion Rate Card */}
        <Card className="bg-white border border-gray-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-medium text-gray-600">Conversion rate</h3>
              <div className="flex items-center space-x-1">
                <HelpCircle className="w-3 h-3 text-gray-400" />
                <ChevronRight className="w-3 h-3 text-gray-400" />
              </div>
            </div>
            <p className="text-xs text-gray-500 mb-2">Past 30 days</p>
            <div className="flex items-baseline space-x-2">
              <span className="text-2xl font-bold text-gray-900">{metrics.conversionRate}%</span>
              <span className="text-sm text-gray-500">0%</span>
            </div>
          </CardContent>
        </Card>

        {/* Sent Card */}
        <Card className="bg-white border border-gray-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-medium text-gray-600">Sent</h3>
              <ChevronRight className="w-3 h-3 text-gray-400" />
            </div>
            <p className="text-xs text-gray-500 mb-2">Past 30 days</p>
            <div className="flex items-baseline space-x-2 mb-1">
              <span className="text-2xl font-bold text-gray-900">{metrics.sent}</span>
              <span className="text-sm text-red-500">↓ 25%</span>
            </div>
            <p className="text-sm text-gray-500">${sentValue.toLocaleString()}</p>
          </CardContent>
        </Card>

        {/* Converted Card */}
        <Card className="bg-white border border-gray-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-medium text-gray-600">Converted</h3>
              <ChevronRight className="w-3 h-3 text-gray-400" />
            </div>
            <p className="text-xs text-gray-500 mb-2">Past 30 days</p>
            <div className="flex items-baseline space-x-2 mb-1">
              <span className="text-2xl font-bold text-gray-900">{metrics.converted}</span>
              <span className="text-sm text-gray-500">0%</span>
            </div>
            <p className="text-sm text-gray-500">${convertedValue.toLocaleString()}</p>
          </CardContent>
        </Card>

        {/* Help Card */}
        <Card className="bg-white border border-gray-200">
          <CardContent className="p-4">
            <h3 className="text-sm font-medium text-gray-900 mb-2">How can I get paid faster?</h3>
            <p className="text-xs text-gray-600 mb-3">Jobber can help you take payments instantly in person or set up automatic payments.</p>
            <button className="text-xs text-blue-600 hover:text-blue-700">Learn more with Copilot</button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default QuotesOverviewCards;
