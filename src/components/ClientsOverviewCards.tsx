
import { Card, CardContent } from "@/components/ui/card";
import { ChevronRight } from "lucide-react";

const ClientsOverviewCards = () => {
  const overviewData = [
    {
      title: "New leads",
      subtitle: "Past 30 days",
      value: "5",
      change: "69%",
      changeType: "decrease" as const,
    },
    {
      title: "New clients",
      subtitle: "Past 30 days", 
      value: "5",
      change: "29%",
      changeType: "decrease" as const,
    },
    {
      title: "Total new clients",
      subtitle: "Year to date",
      value: "88",
      change: null,
      changeType: null,
    },
    {
      title: "How can I get paid faster?",
      subtitle: "Jobber can help you take payments instantly in person or set up automatic payments.",
      value: null,
      change: null,
      changeType: null,
      isPromoCard: true,
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      {overviewData.map((item, index) => (
        <Card key={index} className={`${item.isPromoCard ? 'border-blue-200 bg-blue-50' : 'bg-white'}`}>
          <CardContent className="p-4">
            {item.isPromoCard ? (
              <div>
                <h3 className="text-sm font-medium text-blue-900 mb-2">{item.title}</h3>
                <p className="text-xs text-blue-700 mb-3">{item.subtitle}</p>
                <button className="flex items-center text-xs text-blue-600 hover:text-blue-800">
                  Learn more with <span className="ml-1 font-medium">⚡ Copilot</span>
                </button>
              </div>
            ) : (
              <div className="cursor-pointer group">
                <div className="flex items-center justify-between mb-1">
                  <h3 className="text-sm font-medium text-gray-600">{item.title}</h3>
                  <ChevronRight className="h-4 w-4 text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
                <p className="text-xs text-gray-500 mb-2">{item.subtitle}</p>
                <div className="flex items-center space-x-2">
                  <span className="text-2xl font-bold text-gray-900">{item.value}</span>
                  {item.change && (
                    <span className={`text-xs px-1.5 py-0.5 rounded flex items-center ${
                      item.changeType === 'decrease' 
                        ? 'text-red-600 bg-red-50' 
                        : 'text-green-600 bg-green-50'
                    }`}>
                      <span className="mr-1">
                        {item.changeType === 'decrease' ? '↓' : '↑'}
                      </span>
                      {item.change}
                    </span>
                  )}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default ClientsOverviewCards;
