
import { Badge } from "@/components/ui/badge";
import { MoreHorizontal, Calendar, DollarSign } from "lucide-react";
import { Button } from "@/components/ui/button";

const SalesPipeline = () => {
  // Using the same request data from RequestsTable but formatted for pipeline
  const requests = [
    {
      id: 1,
      client: "Test Client",
      title: "New landscaping request",
      property: "333 Skimmon Place, Saskatoon, Saskatchewan S7V 0A7",
      contact: "(306) 555-5555\ntest@client.com",
      requested: "May 26",
      amount: 45000,
      status: "New"
    },
    {
      id: 2,
      client: "Test Client",
      title: "Landscaping",
      property: "333 Skimmon Place, Saskatoon, Saskatchewan S7V 0A7",
      contact: "(306) 555-5555\ntest@client.com",
      requested: "May 26",
      amount: 45000,
      status: "New"
    },
    {
      id: 3,
      client: "Pete Duggan",
      title: "Garden maintenance",
      property: "188 Chestnut Street, Pictou, Nova Scotia B2H 1Y5",
      contact: "",
      requested: "May 23",
      amount: 25000,
      status: "New"
    },
    {
      id: 4,
      client: "Sid Sidé",
      title: "Landscaping consultation",
      property: "",
      contact: "",
      requested: "May 23",
      amount: 5000,
      status: "New"
    },
    {
      id: 5,
      client: "Pam Sillar",
      title: "Request!",
      property: "190 Watt Street, Winnipeg, Manitoba R2L 2B8",
      contact: "",
      requested: "May 23",
      amount: 18000,
      status: "New"
    },
    {
      id: 6,
      client: "Enjoi Skateboards",
      title: "Levi's Request #1",
      property: "",
      contact: "(306) 555-5555",
      requested: "Mar 19",
      amount: 15000,
      status: "New"
    },
    {
      id: 7,
      client: "Marketing Dashboard Aabsss",
      title: "Commercial landscaping",
      property: "5527 15 Ave NW, Edmonton, AB T5A 2X6",
      contact: "(123456789074744443\nlaura.@getjobber.com",
      requested: "Nov 13",
      amount: 15000,
      status: "New"
    }
  ];

  const columns = [
    { id: "new-deals", title: "New deals", count: requests.length },
    { id: "contacted", title: "Assessment unscheduled", count: 0 },
    { id: "quote-sent", title: "Assessment overdue", count: 0 },
    { id: "followup", title: "Assessment completed", count: 0 }
  ];

  const formatAmount = (amount: number) => {
    return `$ ${amount.toLocaleString()}.00`;
  };

  const formatDate = (dateStr: string) => {
    // Convert "May 26" format to "Jul 10" format for consistency
    return dateStr;
  };

  return (
    <div className="h-full">
      {/* Pipeline Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <span className="text-sm text-gray-600">Sort by</span>
            <Button variant="outline" size="sm" className="h-8">
              Days in stage
            </Button>
          </div>
          <div className="flex items-center space-x-2">
            <Calendar className="h-4 w-4 text-gray-400" />
            <Button variant="outline" size="sm" className="h-8">
              Filter by date
            </Button>
          </div>
          <span className="text-sm text-gray-500">(19 results)</span>
        </div>
      </div>

      {/* Pipeline Columns */}
      <div className="grid grid-cols-4 gap-6 h-full">
        {columns.map((column, columnIndex) => (
          <div key={column.id} className="flex flex-col">
            {/* Column Header */}
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-2">
                <h3 className="font-medium text-gray-900">{column.title}</h3>
                <Badge variant="secondary" className="text-xs">
                  {column.count}
                </Badge>
              </div>
              <div className="flex items-center space-x-2">
                <span className="text-sm text-gray-500">
                  $ {columnIndex === 0 ? "45,0000.00" : "45,0000.00"}
                </span>
                <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                  <MoreHorizontal className="h-3 w-3" />
                </Button>
              </div>
            </div>

            {/* Cards Container */}
            <div className="flex-1 space-y-3">
              {columnIndex === 0 && requests.map((request) => (
                <div key={request.id} className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow cursor-pointer">
                  {/* Card Header */}
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <h4 className="font-medium text-gray-900 text-sm mb-1">
                        {request.client}
                      </h4>
                      {request.title && (
                        <p className="text-sm text-gray-600 mb-2">{request.title}</p>
                      )}
                    </div>
                    <Button variant="ghost" size="sm" className="h-6 w-6 p-0 shrink-0">
                      <MoreHorizontal className="h-3 w-3" />
                    </Button>
                  </div>

                  {/* Property */}
                  {request.property && (
                    <p className="text-xs text-gray-500 mb-3 line-clamp-2">
                      {request.property}
                    </p>
                  )}

                  {/* Contact Info */}
                  {request.contact && (
                    <p className="text-xs text-gray-500 mb-3 whitespace-pre-line">
                      {request.contact}
                    </p>
                  )}

                  {/* Card Footer */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <span className="text-xs bg-blue-50 text-blue-700 px-2 py-1 rounded">
                        Client
                      </span>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-medium text-gray-900">
                        {formatAmount(request.amount)}
                      </div>
                      <div className="text-xs text-gray-500 flex items-center">
                        <Calendar className="h-3 w-3 mr-1" />
                        {formatDate(request.requested)} 6d
                      </div>
                    </div>
                  </div>
                </div>
              ))}
              
              {/* Empty state for other columns */}
              {columnIndex !== 0 && (
                <div className="text-center py-8 text-gray-400">
                  <p className="text-sm">No deals in this stage</p>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default SalesPipeline;
