
import { TrendingUp, Info } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { RequestWithClient } from "@/utils/dataHelpers";

interface OverviewCardsProps {
  onStatusFilter?: (status: string | null) => void;
  activeStatusFilter?: string | null;
  requests: RequestWithClient[];
}

const OverviewCards = ({ onStatusFilter, activeStatusFilter, requests }: OverviewCardsProps) => {
  const handleStatusClick = (status: string) => {
    if (onStatusFilter) {
      // If clicking the same status, clear the filter; otherwise set the new filter
      onStatusFilter(activeStatusFilter === status ? null : status);
    }
  };

  const getStatusButtonClass = (status: string) => {
    const isActive = activeStatusFilter === status;
    return `cursor-pointer transition-colors ${
      isActive ? 'bg-blue-50 border-blue-200' : 'hover:bg-gray-50'
    }`;
  };

  // Calculate dynamic counts
  const statusCounts = {
    new: requests.filter(r => r.status === 'New').length,
    assessmentComplete: requests.filter(r => r.status === 'Assessment complete').length,
    overdue: requests.filter(r => r.status === 'Overdue').length,
    unscheduled: requests.filter(r => r.status === 'Unscheduled').length
  };

  // Calculate new requests in past 30 days
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  const newRequestsPast30Days = requests.filter(r => {
    const requestDate = new Date(r.requestDate);
    return requestDate >= thirtyDaysAgo;
  }).length;

  // Calculate conversion rate (converted requests vs total requests in past 30 days)
  const requestsPast30Days = requests.filter(r => {
    const requestDate = new Date(r.requestDate);
    return requestDate >= thirtyDaysAgo;
  });
  const convertedRequestsPast30Days = requestsPast30Days.filter(r => r.status === 'Converted').length;
  const conversionRate = requestsPast30Days.length > 0 ? Math.round((convertedRequestsPast30Days / requestsPast30Days.length) * 100) : 0;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      {/* Overview Card */}
      <Card className="bg-white border border-gray-200 shadow-sm">
        <CardContent className="p-4">
          <h3 className="font-medium text-gray-900 mb-3">Overview</h3>
          <div className="space-y-2">
            <div 
              className={`flex items-center justify-between p-2 rounded ${getStatusButtonClass('New')}`}
              onClick={() => handleStatusClick('New')}
            >
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                <span className="text-sm text-gray-600">New ({statusCounts.new})</span>
              </div>
            </div>
            <div 
              className={`flex items-center justify-between p-2 rounded ${getStatusButtonClass('Assessment complete')}`}
              onClick={() => handleStatusClick('Assessment complete')}
            >
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span className="text-sm text-gray-600">Assessment complete ({statusCounts.assessmentComplete})</span>
              </div>
            </div>
            <div 
              className={`flex items-center justify-between p-2 rounded ${getStatusButtonClass('Overdue')}`}
              onClick={() => handleStatusClick('Overdue')}
            >
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                <span className="text-sm text-gray-600">Overdue ({statusCounts.overdue})</span>
              </div>
            </div>
            <div 
              className={`flex items-center justify-between p-2 rounded ${getStatusButtonClass('Unscheduled')}`}
              onClick={() => handleStatusClick('Unscheduled')}
            >
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                <span className="text-sm text-gray-600">Unscheduled ({statusCounts.unscheduled})</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* New Requests Card */}
      <Card className="bg-white border border-gray-200 shadow-sm">
        <CardContent className="p-4">
          <div className="flex items-center justify-between mb-2">
            <h3 className="font-medium text-gray-900">New requests</h3>
          </div>
          <div className="text-sm text-gray-500 mb-3">Past 30 days</div>
          <div className="flex items-baseline space-x-2">
            <span className="text-3xl font-semibold text-gray-900">{newRequestsPast30Days}</span>
            <div className="flex items-center text-green-600 text-sm">
              <TrendingUp className="h-3 w-3 mr-1" />
              100%
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Conversion Rate Card */}
      <Card className="bg-white border border-gray-200 shadow-sm">
        <CardContent className="p-4">
          <div className="flex items-center justify-between mb-2">
            <h3 className="font-medium text-gray-900">Conversion rate</h3>
            <Info className="h-4 w-4 text-gray-400" />
          </div>
          <div className="text-sm text-gray-500 mb-3">Past 30 days</div>
          <div className="flex items-baseline space-x-2">
            <span className="text-3xl font-semibold text-gray-900">{conversionRate}%</span>
            <div className="flex items-center text-green-600 text-sm">
              <TrendingUp className="h-3 w-3 mr-1" />
              100%
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Copilot KPI Card */}
      <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-200 shadow-sm">
        <CardContent className="p-4">
          <div className="mb-3">
            <h3 className="font-medium text-gray-900 mb-1">Want to take a closer look at some KPIs?</h3>
            <p className="text-sm text-gray-600">Jobber Copilot can help make sense of performance across all areas of your business.</p>
          </div>
          <Button variant="outline" size="sm" className="text-blue-600 border-blue-200 hover:bg-blue-50">
            <TrendingUp className="h-3 w-3 mr-1" />
            Learn more with Copilot
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default OverviewCards;
