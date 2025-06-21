
import { TrendingUp, Info } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

const OverviewCards = () => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      {/* Overview Card */}
      <Card className="bg-white border border-gray-200 shadow-sm">
        <CardContent className="p-4">
          <h3 className="font-medium text-gray-900 mb-3">Overview</h3>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                <span className="text-sm text-gray-600">New (22)</span>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span className="text-sm text-gray-600">Assessment complete (4)</span>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                <span className="text-sm text-gray-600">Overdue (2)</span>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                <span className="text-sm text-gray-600">Unscheduled (2)</span>
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
            <span className="text-3xl font-semibold text-gray-900">6</span>
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
            <span className="text-3xl font-semibold text-gray-900">33%</span>
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
